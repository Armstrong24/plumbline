import {
  AuditFinding,
  BrandRiskScore,
  BrandGuidelines,
  Platform,
  PostPlatformVariant,
  AISuggestionItem,
  GroqConfig
} from '../../types';
import { AIAuditEngine } from '../aiAuditService';
import { apiClient } from '../api/client';

export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

export const POPULAR_GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B' },
  { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B' }
];

class GroqService {
  private serverConfig: GroqConfig = { apiKey: '', model: DEFAULT_GROQ_MODEL, isActive: false };

  getConfig(): GroqConfig { return this.serverConfig; }

  async getConfigAsync(): Promise<GroqConfig> {
    try {
      const status = await apiClient.getAIStatus();
      this.serverConfig = { apiKey: '', model: status.model || DEFAULT_GROQ_MODEL, isActive: status.configured };
    } catch {
      this.serverConfig = { apiKey: '', model: DEFAULT_GROQ_MODEL, isActive: false };
    }
    return this.serverConfig;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const result = await apiClient.testAI();
      return { success: true, message: `Groq connected. Active model: ${result.model}.` };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Groq connection test failed.' };
    }
  }

  /**
   * Run brand audit using Groq Llama 3.3 or fallback to deterministic engine
   */
  async auditContent(
    text: string,
    platforms: Platform[],
    guidelines: BrandGuidelines,
    hasMedia: boolean = false,
    mediaAltText?: string
  ): Promise<{ findings: AuditFinding[]; score: BrandRiskScore; isLiveAi: boolean }> {
    const config = await this.getConfigAsync();

    if (!config.isActive) {
      // Fallback to local rule engine
      const localResult = AIAuditEngine.auditContent(text, platforms, guidelines, hasMedia, mediaAltText);
      return { ...localResult, isLiveAi: false };
    }

    try {
      const systemPrompt = `You are Plumbline, an intelligent AI brand-governance auditing engine.
Core Philosophy: "AI flags and suggests. Your reviewers decide. Nothing is rewritten silently."

Analyze social media content against the organization's official brand guidelines:
Brand Voice Tones: ${guidelines.voice.tones.join(', ')}
Custom Tone Description: ${guidelines.voice.customToneDescription}
Platform Tone Rules:
${Object.entries(guidelines.voice.platformRules).map(([p, r]) => `- ${p}: ${r}`).join('\n')}

Terminology Dictionary:
${guidelines.terminology.map(t => `- Context: ${t.context} | Preferred: "${t.preferredTerm}" | Banned/Discouraged: "${t.bannedTerm}" | Rule: ${t.explanation}`).join('\n')}

Approved Verified Facts:
${guidelines.facts.map(f => `- [${f.category}] Fact: "${f.fact}" (Source: ${f.source}, Status: ${f.approvalStatus})`).join('\n')}

Instructions:
1. Detect unverified promotional claims, superlatives (like "number 1", "best"), or unverified stats not backed by the approved facts (category: "unsupported_claim", severity: "critical").
2. Detect banned or discouraged terms (category: "terminology", severity: "warning").
3. Detect tone mismatches for target platforms: ${platforms.join(', ')} (category: "tone_mismatch", severity: "warning").
${hasMedia && !mediaAltText ? '4. Flag missing alt text description for attached media (category: "alt_text_missing", severity: "suggestion").' : ''}

You MUST return ONLY valid JSON matching this structure:
{
  "findings": [
    {
      "category": "unsupported_claim" | "tone_mismatch" | "terminology" | "alt_text_missing",
      "severity": "critical" | "warning" | "suggestion",
      "issueTitle": "Brief title of the finding",
      "description": "Clear explanation of the violation",
      "affectedContent": "Exact substring from copy",
      "sourceReference": "Citation from brand guidelines or facts",
      "suggestedCorrection": "Actionable correction",
      "confidence": 0.95
    }
  ]
}`;

      const userPrompt = `Target Platforms: ${platforms.join(', ')}
Post Copy:
"""${text}"""
${hasMedia ? `Attached Creative Artwork: Yes, Alt text: ${mediaAltText || 'NONE'}` : 'Attached Creative Artwork: None'}`;

      const data = await apiClient.groqCompletion({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      });
      const parsed = JSON.parse(data.choices[0].message.content);

      const rawFindings = parsed.findings || [];
      const findings: AuditFinding[] = rawFindings.map((f: any, idx: number) => ({
        id: `groq-f-${idx}-${Date.now()}`,
        category: f.category || 'tone_mismatch',
        severity: f.severity || 'warning',
        issueTitle: f.issueTitle || 'Brand rule alert',
        description: f.description || '',
        affectedContent: f.affectedContent || '',
        sourceReference: f.sourceReference || 'Active Brand Guidelines',
        guidelineVersion: guidelines.version,
        suggestedCorrection: f.suggestedCorrection || '',
        confidence: typeof f.confidence === 'number' ? f.confidence : 0.95,
        status: 'open'
      }));

      const score = AIAuditEngine.calculateRiskScore(findings);
      return { findings, score, isLiveAi: true };
    } catch (err) {
      console.warn('Groq AI audit encountered error, falling back to local engine:', err);
      const localResult = AIAuditEngine.auditContent(text, platforms, guidelines, hasMedia, mediaAltText);
      return { ...localResult, isLiveAi: false };
    }
  }

  /**
   * Generate platform variants with Groq
   */
  async generatePlatformVariants(
    title: string,
    caption: string,
    platforms: Platform[],
    guidelines: BrandGuidelines
  ): Promise<Partial<Record<Platform, PostPlatformVariant>>> {
    const config = await this.getConfigAsync();

    if (!config.isActive) {
      return AIAuditEngine.generatePlatformVariants(title, caption, platforms);
    }

    try {
      const systemPrompt = `You are Plumbline's multi-platform copy adaptation engine.
Adapt the original post into tailored copies for each requested social platform based on these brand guidelines:
Brand Voice: ${guidelines.voice.tones.join(', ')}
${guidelines.voice.customToneDescription}

Platform Rules:
${platforms.map(p => `- ${p}: ${guidelines.voice.platformRules[p] || 'Standard'}`).join('\n')}

Terminology:
${guidelines.terminology.map(t => `- Replace "${t.bannedTerm}" with "${t.preferredTerm}"`).join('\n')}

Return ONLY JSON format:
{
  "variants": {
    "<platform>": {
      "title": "Adapted headline",
      "description": "Adapted copy",
      "targetTone": "Target tone description",
      "suggestions": [
        {
          "original": "Original phrase",
          "suggestion": "Improved phrase",
          "explanation": "Why this aligns with brand tone",
          "sourceRef": "Rule reference"
        }
      ]
    }
  }
}`;

      const data = await apiClient.groqCompletion({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Original Title: "${title}"\nOriginal Caption:\n"""${caption}"""\nPlatforms: ${platforms.join(', ')}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      });
      const parsed = JSON.parse(data.choices[0].message.content);
      const variants: Partial<Record<Platform, PostPlatformVariant>> = {};

      platforms.forEach(p => {
        const v = parsed.variants?.[p];
        if (v) {
          variants[p] = {
            platform: p,
            title: v.title || title,
            description: v.description || caption,
            targetTone: v.targetTone || 'Adapted Tone',
            suggestions: (v.suggestions || []).map((s: any, idx: number) => ({
              id: `sug-${p}-${idx}-${Date.now()}`,
              original: s.original || '',
              suggestion: s.suggestion || '',
              explanation: s.explanation || '',
              sourceRef: s.sourceRef || 'Platform Guidelines',
              status: 'pending' as const
            }))
          };
        }
      });

      return variants;
    } catch (err) {
      console.warn('Groq variant generation error, using fallback:', err);
      return AIAuditEngine.generatePlatformVariants(title, caption, platforms);
    }
  }

  /**
   * Generate brand-grounded comment reply using Groq
   */
  async generateCommentReply(
    commentText: string,
    platform: Platform,
    guidelines: BrandGuidelines
  ): Promise<{ reply: string; source: string; isLiveAi: boolean }> {
    const config = await this.getConfigAsync();

    if (!config.isActive) {
      // Deterministic reply based on keywords
      if (commentText.toLowerCase().includes('rank') || commentText.toLowerCase().includes('verify')) {
        return {
          reply: 'Thanks for reaching out! Our verified accreditations and official statutory documents are published directly on our portal.',
          source: 'Brand Governance Charter & Verified Facts (Local)',
          isLiveAi: false
        };
      }
      return {
        reply: `Thank you for connecting with us! We appreciate your engagement with our community.`,
        source: `${platform.toUpperCase()} Community Voice Guidelines (Local)`,
        isLiveAi: false
      };
    }

    try {
      const prompt = `You are a social media brand representative responding to an audience comment.
Brand Voice: ${guidelines.voice.tones.join(', ')}
Platform: ${platform} (Tone rule: ${guidelines.voice.platformRules[platform] || 'Professional & Courteous'})
Verified Facts:
${guidelines.facts.map(f => `- ${f.fact} (Source: ${f.source})`).join('\n')}

Comment: "${commentText}"

Instruction: Write a helpful, brand-grounded response.
IMPORTANT: Never invent fake event dates, links, prices, or ranking superlatives.
Return ONLY JSON:
{
  "reply": "Your proposed response",
  "source": "Which approved fact or voice rule guided this response"
}`;

      const data = await apiClient.groqCompletion({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2
      });
      const parsed = JSON.parse(data.choices[0].message.content);
      return {
        reply: parsed.reply || 'Thank you for connecting with us!',
        source: parsed.source || 'Groq AI Brand Alignment',
        isLiveAi: true
      };
    } catch (err) {
      console.warn('Groq comment reply error, using fallback:', err);
      return {
        reply: `Thank you for your question! We appreciate your engagement with our brand.`,
        source: 'Brand Voice Guidelines (Fallback)',
        isLiveAi: false
      };
    }
  }
}

export const groqService = new GroqService();

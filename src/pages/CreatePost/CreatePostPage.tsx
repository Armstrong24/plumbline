import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  AlertTriangle,
  Info,
  Clock,
  Send,
  Eye,
  Trash2,
  Lock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Platform, PostPlatformVariant, AISuggestionItem } from '../../types';
import { AIAuditEngine } from '../../services/aiAuditService';
import { groqService } from '../../services/ai/groqService';
import { BrandRiskScore } from '../../components/common/BrandRiskScore';

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentRole } = useAuth();
  const { guidelines, createPost } = useWorkspace();

  // Core post form state
  const [campaign, setCampaign] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    'linkedin',
    'instagram',
    'x'
  ]);
  const [activePlatformTab, setActivePlatformTab] = useState<Platform>('linkedin');

  // Media preview
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaAltText, setMediaAltText] = useState<string>('');

  // Platform variants
  const [platformVariants, setPlatformVariants] = useState<Partial<Record<Platform, PostPlatformVariant>>>({});

  // Audit state
  const [isAuditing, setIsAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<{ findings: any[]; score: any; isLiveAi: boolean } | null>(null);
  const [aiAuditError, setAiAuditError] = useState('');
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);

  // Initialize or re-adapt variants when caption, title or platforms change
  useEffect(() => {
    const generated = AIAuditEngine.generatePlatformVariants(title, caption, selectedPlatforms);
    setPlatformVariants(generated);
    setAiAuditResult(null);
    setAiAuditError('');
  }, [title, caption, selectedPlatforms]);

  // Run audit engine dynamically on caption
  const localAuditResult = AIAuditEngine.auditContent(
    caption,
    selectedPlatforms,
    guidelines,
    Boolean(mediaUrl),
    mediaAltText
  );
  const auditResult = aiAuditResult || { ...localAuditResult, isLiveAi: false };

  const handleRunGroqAudit = async () => {
    if (!caption.trim()) { setAiAuditError('Add a caption before running the AI audit.'); return; }
    setIsAuditing(true);
    setAiAuditError('');
    try {
      const result = await groqService.auditContent(caption, selectedPlatforms, guidelines, Boolean(mediaUrl), mediaAltText);
      setAiAuditResult(result);
      if (!result.isLiveAi) setAiAuditError('Groq is not configured or the request failed. Showing the local rule-based audit instead.');
    } catch (error) {
      setAiAuditError(error instanceof Error ? error.message : 'The AI audit failed.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerateGroqVariants = async () => {
    if (!caption.trim()) { setAiAuditError('Add a caption before generating platform copy.'); return; }
    setIsGeneratingVariants(true);
    setAiAuditError('');
    try {
      const variants = await groqService.generatePlatformVariants(title, caption, selectedPlatforms, guidelines);
      setPlatformVariants(variants);
    } catch (error) {
      setAiAuditError(error instanceof Error ? error.message : 'Could not generate platform variants.');
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  const togglePlatform = (p: Platform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        const next = selectedPlatforms.filter(item => item !== p);
        setSelectedPlatforms(next);
        if (activePlatformTab === p) {
          setActivePlatformTab(next[0]);
        }
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const removeMedia = () => {
    setMediaUrl('');
    setMediaAltText('');
  };

  const handleAcceptSuggestion = (platform: Platform, sugId: string) => {
    const currentVar = platformVariants[platform];
    if (!currentVar) return;

    const suggestion = currentVar.suggestions.find(s => s.id === sugId);
    if (!suggestion) return;

    // Apply suggestion to platform-specific description only
    let updatedDesc = currentVar.description;
    if (suggestion.original && updatedDesc.includes(suggestion.original)) {
      updatedDesc = updatedDesc.replace(suggestion.original, suggestion.suggestion);
    } else {
      updatedDesc = `${updatedDesc} (${suggestion.suggestion})`;
    }

    const updatedSuggestions = currentVar.suggestions.map(s => {
      if (s.id === sugId) return { ...s, status: 'accepted' as const };
      return s;
    });

    setPlatformVariants({
      ...platformVariants,
      [platform]: {
        ...currentVar,
        description: updatedDesc,
        suggestions: updatedSuggestions
      }
    });
  };

  const handleRejectSuggestion = (platform: Platform, sugId: string) => {
    const currentVar = platformVariants[platform];
    if (!currentVar) return;

    const updatedSuggestions = currentVar.suggestions.map(s => {
      if (s.id === sugId) return { ...s, status: 'rejected' as const };
      return s;
    });

    setPlatformVariants({
      ...platformVariants,
      [platform]: {
        ...currentVar,
        suggestions: updatedSuggestions
      }
    });
  };

  const handleSaveDraft = () => {
    if (!title.trim() || !caption.trim() || selectedPlatforms.length === 0) { alert('Add a title, caption, and at least one platform before saving.'); return; }
    const newPost = createPost({
      campaign: campaign.trim() || 'General',
      title: title.trim(),
      originalDescription: caption,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorRole: currentRole === 'manager' || currentRole === 'owner' || currentRole === 'admin' ? 'Manager' : 'Social Media Creator',
      platforms: selectedPlatforms,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
      mediaType: 'image',
      platformVariants,
      status: 'draft',
      brandRiskScore: auditResult.score,
      findings: auditResult.findings
    });

    navigate(`/app/review/${newPost.id}`);
  };

  const handleSubmitForApproval = () => {
    if (!title.trim() || !caption.trim() || selectedPlatforms.length === 0) { alert('Add a title, caption, and at least one platform before submitting.'); return; }
    const newPost = createPost({
      campaign: campaign.trim() || 'General',
      title: title.trim(),
      originalDescription: caption,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorRole: currentRole === 'manager' || currentRole === 'owner' || currentRole === 'admin' ? 'Manager' : 'Social Media Creator',
      platforms: selectedPlatforms,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
      mediaType: 'image',
      platformVariants,
      status: 'in_review',
      brandRiskScore: auditResult.score,
      findings: auditResult.findings
    });

    navigate(`/app/review/${newPost.id}`);
  };


  const currentVariant = platformVariants[activePlatformTab] || {
    platform: activePlatformTab,
    title: title,
    description: caption,
    targetTone: 'Standard Tone',
    suggestions: []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0A4A3D] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Central Content Composer
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12201C] tracking-tight">
            Create post
          </h1>
          <p className="text-sm text-[#68756F] mt-1">
            Write once, review per platform, publish together.
          </p>
        </div>

        {/* Live Risk Badge Preview */}
        <div className="flex items-center gap-2">
          <BrandRiskScore score={auditResult.score} compact />
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (6 cols): Master Content */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-plumb-subtle space-y-5">
            <h2 className="text-base font-bold text-[#12201C] flex items-center justify-between">
              <span>Your Content</span>
              <span className="text-[11px] font-normal text-[#68756F]">Master Draft</span>
            </h2>

            {/* Campaign Name */}
            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1">
                Campaign / Initiative
              </label>
              <input
                type="text"
                value={campaign}
                onChange={e => setCampaign(e.target.value)}
                placeholder="Write your post message"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]"
              />
            </div>

            {/* A. Public media URL */}
            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1.5">
                Public media URL (optional)
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                placeholder="https://your-public-host/image.jpg"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                The URL must be publicly reachable over HTTPS. Local files and private Drive links cannot be fetched by social platforms. Image publishing is supported only where the connected platform API permits it.
              </p>
              {mediaUrl && /^https:\/\//i.test(mediaUrl) && (
                <div className="mt-3 rounded-xl border border-stone-200 overflow-hidden">
                  <img src={mediaUrl} alt="Media preview" className="w-full max-h-56 object-contain bg-stone-50" />
                  <button type="button" onClick={removeMedia} className="w-full py-2 text-xs text-red-600 hover:bg-red-50">Remove media URL</button>
                </div>
              )}
              {mediaUrl && !/^https:\/\//i.test(mediaUrl) && (
                <p className="text-[11px] text-red-600 mt-1">Enter a publicly accessible HTTPS URL.</p>
              )}
              {mediaUrl && (
                <div className="mt-2.5">
                  <label className="block text-[11px] font-semibold text-[#12201C] mb-1">Creative Alt Text</label>
                  <input type="text" value={mediaAltText} onChange={e => setMediaAltText(e.target.value)} placeholder="Describe the image for screen-reader users" className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]" />
                </div>
              )}
            </div>

            {/* B. Title */}
            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1">
                Post Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Post headline..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]"
              />
            </div>

            {/* C. Description / Caption */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#12201C]">
                  Description / Caption (Original Master Copy)
                </label>
                <span className="text-[11px] text-stone-400">
                  {caption.length} characters
                </span>
              </div>
              <textarea
                rows={5}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Write your main caption here..."
                className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D] leading-relaxed"
              />
              <p className="text-[11px] text-[#68756F] mt-1">
                Original content is preserved separately. Platform adaptations will not overwrite this master copy.
              </p>
            </div>

            {/* D. Post To Platforms */}
            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-2">
                Post to: (Select target channels)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'linkedin', label: 'LinkedIn', connected: true },
                  { id: 'instagram', label: 'Instagram', connected: true },
                  { id: 'x', label: 'X (Twitter)', connected: true },
                  { id: 'facebook', label: 'Facebook', connected: true },
                  { id: 'threads', label: 'Threads (Ext. Req.)', connected: false },
                  { id: 'youtube', label: 'YouTube', connected: false }
                ].map(p => {
                  const selected = selectedPlatforms.includes(p.id as Platform);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id as Platform)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all ${
                        selected
                          ? 'border-[#0A4A3D] bg-emerald-50 text-[#0A4A3D] font-bold'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <span className="capitalize">{p.label}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                          selected ? 'bg-[#0A4A3D] text-white' : 'border border-stone-300'
                        }`}
                      >
                        {selected && '✓'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (6 cols): Review per platform & AI suggestions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-plumb-subtle space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#12201C]">Review Each Platform</h2>
                <p className="text-xs text-[#68756F]">
                  Platform-specific adaptations generated from active brand rules.
                </p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-[#0A4A3D]">
                Independent Variants
              </span>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto">
              {selectedPlatforms.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePlatformTab(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                    activePlatformTab === p
                      ? 'bg-white text-[#0A4A3D] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Target Tone & Adaptation Details */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#0A4A3D] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Target Tone: {currentVariant.targetTone}
                </span>
                <span className="text-[10px] text-[#68756F]">Guideline {guidelines.version}</span>
              </div>
              <p className="text-[11px] text-stone-600">
                {guidelines.voice.platformRules[activePlatformTab] ||
                  'Preserve brand clarity and use verified facts.'}
              </p>
            </div>

            {/* Platform-Specific Title */}
            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1">
                {activePlatformTab.toUpperCase()} Title / Headline
              </label>
              <input
                type="text"
                value={currentVariant.title}
                onChange={e =>
                  setPlatformVariants({
                    ...platformVariants,
                    [activePlatformTab]: {
                      ...currentVariant,
                      title: e.target.value
                    }
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]"
              />
            </div>

            {/* Platform-Specific Description */}
            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1">
                {activePlatformTab.toUpperCase()} Adapted Description
              </label>
              <textarea
                rows={4}
                value={currentVariant.description}
                onChange={e =>
                  setPlatformVariants({
                    ...platformVariants,
                    [activePlatformTab]: {
                      ...currentVariant,
                      description: e.target.value
                    }
                  })
                }
                className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D] leading-relaxed"
              />
            </div>

            {/* AI Suggestions Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold text-[#12201C] uppercase tracking-wider">AI Tone & Factual Suggestions</h3>
                <button type="button" onClick={handleGenerateGroqVariants} disabled={isGeneratingVariants} className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#0A4A3D] text-[11px] font-semibold disabled:opacity-50">
                  {isGeneratingVariants ? 'Generating…' : 'Generate with Groq'}
                </button>
              </div>
              <div className="text-[10px] text-stone-500">{currentVariant.suggestions.length} suggestions available for this platform.</div>

              {currentVariant.suggestions.length > 0 ? (
                currentVariant.suggestions.map(sug => (
                  <div
                    key={sug.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                      sug.status === 'accepted'
                        ? 'bg-emerald-50/70 border-[#167A58]'
                        : sug.status === 'rejected'
                        ? 'bg-stone-50 border-stone-200 opacity-60'
                        : 'bg-white border-amber-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="font-semibold text-[#12201C]">
                          "{sug.suggestion}"
                        </div>
                        <div className="text-[11px] text-stone-600">
                          {sug.explanation}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          Source: {sug.sourceRef}
                        </div>
                      </div>

                      {sug.status === 'pending' ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAcceptSuggestion(activePlatformTab, sug.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#0A4A3D] text-white hover:bg-[#063028] text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectSuggestion(activePlatformTab, sug.id)}
                            className="px-2 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-[11px] text-stone-600"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            sug.status === 'accepted'
                              ? 'bg-emerald-100 text-[#167A58]'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {sug.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                  No pending suggestions for {activePlatformTab}. Current copy satisfies brand tone.
                </div>
              )}
            </div>
          </div>

          {/* Detailed Brand Risk Breakdown */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#12201C]">Brand compliance audit</div>
                <div className="text-[10px] text-stone-500">{auditResult.isLiveAi ? 'Groq AI review' : 'Local rule-based checks'}</div>
              </div>
              <button type="button" onClick={handleRunGroqAudit} disabled={isAuditing || !caption.trim()} className="px-3 py-2 rounded-lg bg-[#0A4A3D] text-white text-[11px] font-semibold disabled:opacity-50">
                {isAuditing ? 'Auditing…' : 'Run Groq audit'}
              </button>
            </div>
            {aiAuditError && <p className="text-[11px] text-amber-700">{aiAuditError}</p>}
          </div>
          <BrandRiskScore score={auditResult.score} />
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-stone-200 shadow-plumb-modal flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <Info className="w-4 h-4 text-[#0A4A3D]" />
          <span>
            {currentRole === 'employee'
              ? 'Your submission will be saved for review in this workspace.'
              : 'As a manager, you can review findings, request revisions, or directly approve.'}
          </span>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors"
          >
            Save as draft
          </button>

          <button
            type="button"
            onClick={handleSubmitForApproval}
            className="px-5 py-2.5 rounded-xl bg-[#0A4A3D] hover:bg-[#063028] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Send for approval to manager
          </button>

        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Palette,
  Type,
  BookOpen
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Platform } from '../../types';

export const BrandSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { guidelines, saveGuidelines } = useWorkspace();

  // Local form state initialized from workspace
  const [selectedTones, setSelectedTones] = useState<string[]>(guidelines.voice.tones);
  const [customTone, setCustomTone] = useState(guidelines.voice.customToneDescription);
  const [examplePositive, setExamplePositive] = useState(guidelines.voice.examplePositive);
  const [exampleNegative, setExampleNegative] = useState(guidelines.voice.exampleNegative);

  const [platformRules, setPlatformRules] = useState<Record<Platform, string>>(guidelines.voice.platformRules);

  const [primaryColor, setPrimaryColor] = useState(guidelines.colors.primary);
  const [secondaryColor, setSecondaryColor] = useState(guidelines.colors.secondary);
  const [accentColor, setAccentColor] = useState(guidelines.colors.accent);

  const [headingFont, setHeadingFont] = useState(guidelines.fonts.heading);
  const [bodyFont, setBodyFont] = useState(guidelines.fonts.body);



  const toneOptions = [
    'Formal',
    'Friendly',
    'Playful',
    'Authoritative',
    'Inspiring',
    'Concise',
    'Professional',
    'Conversational',
    'Informative',
    'Trustworthy'
  ];

  const toggleTone = (tone: string) => {
    if (selectedTones.includes(tone)) {
      setSelectedTones(selectedTones.filter(t => t !== tone));
    } else {
      setSelectedTones([...selectedTones, tone]);
    }
  };

  const handleSaveAndContinue = () => {
    saveGuidelines(
      {
        ...guidelines,
        voice: {
          ...guidelines.voice,
          tones: selectedTones,
          customToneDescription: customTone,
          examplePositive,
          exampleNegative,
          platformRules
        },
        colors: {
          ...guidelines.colors,
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor
        },
        fonts: {
          heading: headingFont,
          body: bodyFont
        }
      },
      'Updated brand setup parameters during initial onboarding.'
    );
    navigate('/app/home');
  };

  return (
    <div className="min-h-screen bg-[#F2F5F3] font-sans pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-stone-200 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0A4A3D] text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Initial Knowledge Base
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#12201C] tracking-tight">
              Teach Plumbline your brand
            </h1>
            <p className="text-sm text-[#68756F] mt-1">
              Configure your brand identity, voice, and platform-specific rules. You can return here anytime from Brand Knowledge.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/home')}
              className="px-4 py-2 text-xs font-semibold text-[#68756F] hover:text-[#12201C]"
            >
              Skip for now
            </button>
            <button
              onClick={handleSaveAndContinue}
              className="px-6 py-2.5 rounded-xl bg-[#0A4A3D] hover:bg-[#063028] text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
            >
              Finish setup and open dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SECTION (7 cols): Define brand identity */}
          <div className="lg:col-span-7 space-y-6">
            {/* A. Voice and Tone */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-plumb-subtle">
              <h2 className="text-base font-bold text-[#12201C] mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0A4A3D] flex items-center justify-center text-xs">
                  A
                </span>
                Voice and Tone Tags
              </h2>
              <p className="text-xs text-[#68756F] mb-4">
                Select descriptors that capture your brand's overarching personality across all communication.
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {toneOptions.map(t => {
                  const isSelected = selectedTones.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTone(t)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#0A4A3D] text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isSelected ? `✓ ${t}` : `+ ${t}`}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#12201C] mb-1">
                  Custom Tone Statement
                </label>
                <textarea
                  rows={2}
                  value={customTone}
                  onChange={e => setCustomTone(e.target.value)}
                  placeholder="Describe nuances, e.g. clear, helpful, customer-focused language..."
                  className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]/20 focus:border-[#0A4A3D]"
                />
              </div>
            </div>

            {/* B. Brand Voice Examples */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-plumb-subtle">
              <h2 className="text-base font-bold text-[#12201C] mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0A4A3D] flex items-center justify-center text-xs">
                  B
                </span>
                Brand Voice Examples
              </h2>
              <p className="text-xs text-[#68756F] mb-4">
                Provide reference copy to guide the AI auditing engine during content evaluations.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#167A58] mb-1">
                    ✓ Example of a post that sounds like your brand:
                  </label>
                  <textarea
                    rows={2}
                    value={examplePositive}
                    onChange={e => setExamplePositive(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-emerald-200 bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-[#167A58]/20 focus:border-[#167A58]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#C2413B] mb-1">
                    ✕ Example of content that should NOT sound like your brand:
                  </label>
                  <textarea
                    rows={2}
                    value={exampleNegative}
                    onChange={e => setExampleNegative(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-red-200 bg-red-50/30 focus:outline-none focus:ring-2 focus:ring-[#C2413B]/20 focus:border-[#C2413B]"
                  />
                </div>
              </div>
            </div>

            {/* C. Platform-specific Tone */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-plumb-subtle">
              <h2 className="text-base font-bold text-[#12201C] mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0A4A3D] flex items-center justify-center text-xs">
                  C
                </span>
                Platform-Specific Tone Rules
              </h2>
              <p className="text-xs text-[#68756F] mb-4">
                Tailor how your brand adapts to different social networks without diluting core identity.
              </p>

              <div className="space-y-3">
                {[
                  { key: 'linkedin', label: 'LinkedIn', desc: 'Formal, authoritative, academic & industry partnerships' },
                  { key: 'instagram', label: 'Instagram', desc: 'Friendly, open, visual, engaging community dialogue' },
                  { key: 'x', label: 'X (Twitter)', desc: 'Concise, informative, timely announcements' },
                  { key: 'threads', label: 'Meta Threads', desc: 'Conversational, approachable campus culture' }
                ].map(p => (
                  <div key={p.key} className="p-3 rounded-xl border border-stone-200 bg-stone-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#12201C]">{p.label}</span>
                      <span className="text-[11px] text-[#68756F]">{p.desc}</span>
                    </div>
                    <input
                      type="text"
                      value={platformRules[p.key as Platform] || ''}
                      onChange={e =>
                        setPlatformRules({
                          ...platformRules,
                          [p.key as Platform]: e.target.value
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]/20 focus:border-[#0A4A3D]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* D. Style & Identity */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-plumb-subtle">
              <h2 className="text-base font-bold text-[#12201C] mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0A4A3D] flex items-center justify-center text-xs">
                  D
                </span>
                Colors & Typography
              </h2>
              <p className="text-xs text-[#68756F] mb-4">
                Approved visual palette and typography for automated creative and banner checks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-xl border border-stone-200">
                  <label className="block text-[11px] font-semibold text-[#12201C] mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 border border-stone-200 rounded"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-stone-200">
                  <label className="block text-[11px] font-semibold text-[#12201C] mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 border border-stone-200 rounded"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-stone-200">
                  <label className="block text-[11px] font-semibold text-[#12201C] mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 border border-stone-200 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Font selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#12201C] mb-1">
                    Heading Font
                  </label>
                  <select
                    value={headingFont}
                    onChange={e => setHeadingFont(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                  >
                    <option value="Inter">Inter (Sans-Serif)</option>
                    <option value="Merriweather">Merriweather (Academic Serif)</option>
                    <option value="Playfair Display">Playfair Display (Editorial)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#12201C] mb-1">
                    Body Font
                  </label>
                  <select
                    value={bodyFont}
                    onChange={e => setBodyFont(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                  >
                    <option value="Inter">Inter (Clean)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Source Sans Pro">Source Sans Pro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: document-ingestion capability notice */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-plumb-subtle sticky top-24">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-[#0A4A3D]" />
                <h2 className="text-base font-bold text-[#12201C]">Brand knowledge</h2>
              </div>
              <p className="text-xs text-[#68756F] leading-relaxed">
                Brand voice, terminology, approved facts, and visual identity are saved in this workspace. Automatic PDF/document parsing is not enabled in this test build, so no document is shown as uploaded or indexed unless a real ingestion service is added.
              </p>
              <div className="mt-5 p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs text-[#68756F]">
                <div className="font-semibold text-[#12201C]">Where to add verified information</div>
                <p>Use Brand Knowledge to add preferred terminology, approved factual claims and their sources, colours, fonts, and brand assets.</p>
                <button
                  onClick={() => navigate('/app/brand-knowledge')}
                  className="mt-2 px-4 py-2 rounded-lg bg-[#0A4A3D] text-white font-semibold"
                >
                  Open Brand Knowledge
                </button>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-[#68756F] leading-relaxed">
                AI-generated suggestions require a configured Groq API key. Suggestions never publish automatically; a person must review and approve content first.
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
                <button
                  onClick={handleSaveAndContinue}
                  className="px-5 py-2.5 rounded-xl bg-[#0A4A3D] hover:bg-[#063028] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  Save & Open Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

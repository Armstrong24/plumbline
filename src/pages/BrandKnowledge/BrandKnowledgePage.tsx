import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  History,
  FileText,
  AlertTriangle,
  CheckCircle,
  Upload,
  Sparkles,
  ShieldCheck,
  Eye,
  Type,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  TerminologyRule,
  ApprovedFact,
  BrandAsset,
  Platform
} from '../../types';

export const BrandKnowledgePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentRole } = useAuth();
  const {
    guidelines,
    guidelineVersions,
    saveGuidelines,
    restoreGuidelineVersion
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<
    'voice' | 'terminology' | 'facts' | 'colors' | 'assets' | 'documents' | 'versions'
  >('voice');

  // Working state copy
  const [workingVoice, setWorkingVoice] = useState(guidelines.voice);
  const [workingTerminology, setWorkingTerminology] = useState<TerminologyRule[]>(guidelines.terminology);
  const [workingFacts, setWorkingFacts] = useState<ApprovedFact[]>(guidelines.facts);
  const [workingColors, setWorkingColors] = useState(guidelines.colors);
  const [workingFonts, setWorkingFonts] = useState(guidelines.fonts);
  const [workingAssets, setWorkingAssets] = useState<BrandAsset[]>(guidelines.assets);

  // Modals
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');

  // Add Term Modal
  const [addTermModalOpen, setAddTermModalOpen] = useState(false);
  const [newContext, setNewContext] = useState('');
  const [newPreferred, setNewPreferred] = useState('');
  const [newBanned, setNewBanned] = useState('');
  const [newExplanation, setNewExplanation] = useState('');

  // Add Fact Modal
  const [addFactModalOpen, setAddFactModalOpen] = useState(false);
  const [newFactText, setNewFactText] = useState('');
  const [newFactSource, setNewFactSource] = useState('');
  const [newFactCategory, setNewFactCategory] = useState('Accreditation');
  const [newFactOwner, setNewFactOwner] = useState('Content owner');

  const handleSaveNewVersionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveGuidelines(
      {
        ...guidelines,
        voice: workingVoice,
        terminology: workingTerminology,
        facts: workingFacts,
        colors: workingColors,
        fonts: workingFonts,
        assets: workingAssets
      },
      changeSummary || 'Updated terminology and verified facts.'
    );
    setSaveModalOpen(false);
    setChangeSummary('');
    alert(`Successfully published new Brand Guidelines version! Historical reviews remain locked to their original version.`);
  };

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPreferred || !newBanned) return;

    const newRule: TerminologyRule = {
      id: `term-${Date.now()}`,
      context: newContext || 'General',
      preferredTerm: newPreferred,
      bannedTerm: newBanned,
      explanation: newExplanation,
      platforms: ['all']
    };

    setWorkingTerminology([...workingTerminology, newRule]);
    setAddTermModalOpen(false);
    setNewContext('');
    setNewPreferred('');
    setNewBanned('');
    setNewExplanation('');
  };

  const handleDeleteTerm = (id: string) => {
    setWorkingTerminology(workingTerminology.filter(t => t.id !== id));
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactText || !newFactSource) return;

    const newFact: ApprovedFact = {
      id: `fact-${Date.now()}`,
      fact: newFactText,
      source: newFactSource,
      category: newFactCategory,
      approvalStatus: 'approved',
      approvalOwner: newFactOwner,
      version: guidelines.version,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setWorkingFacts([...workingFacts, newFact]);
    setAddFactModalOpen(false);
    setNewFactText('');
    setNewFactSource('');
  };

  const toggleFactStatus = (id: string) => {
    setWorkingFacts(
      workingFacts.map(f => {
        if (f.id === id) {
          return {
            ...f,
            approvalStatus: f.approvalStatus === 'approved' ? 'outdated' : 'approved'
          };
        }
        return f;
      })
    );
  };

  const handleDeleteFact = (id: string) => {
    setWorkingFacts(workingFacts.filter(f => f.id !== id));
  };

  const handleRestoreVersion = (version: string) => {
    if (confirm(`Restore rules from ${version}? A new version will be created to record this restoration.`)) {
      restoreGuidelineVersion(version);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#0A4A3D] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Active Guideline: {guidelines.version}
            </span>
            <span className="text-xs text-stone-400">
              Last updated: {new Date(guidelines.lastUpdated).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12201C] tracking-tight">
            Edit brand guidelines
          </h1>
          <p className="text-sm text-[#68756F] mt-1">
            Changes create a new version. Past reviews keep the version they used.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/home')}
            className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-600"
          >
            Discard
          </button>
          <button
            onClick={() => setSaveModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0A4A3D] hover:bg-[#063028] text-white text-xs font-semibold shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save new version
          </button>
        </div>
      </div>

      {/* Critical Rule Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950 text-emerald-100 text-xs flex items-center justify-between gap-4 shadow-plumb-subtle">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>
            <strong className="text-white">Strict Immutability Guarantee:</strong> Modifying rules will not silently rewrite or invalidate historical post reviews. Previous campaigns remain linked to their original guideline snapshot.
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-stone-200 pb-2">
        {[
          { id: 'voice', label: 'Voice and Tone', icon: Sparkles },
          { id: 'terminology', label: 'Terminology', icon: BookOpen },
          { id: 'facts', label: 'Approved Facts', icon: CheckCircle },
          { id: 'colors', label: 'Colours and Fonts', icon: Palette },
          { id: 'assets', label: 'Logos and Assets', icon: ImageIcon },
          { id: 'documents', label: 'Rulebook PDF', icon: FileText },
          { id: 'versions', label: 'Version History', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#0A4A3D] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Voice and Tone */}
      {activeTab === 'voice' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-plumb-subtle space-y-5">
            <h3 className="text-base font-bold text-[#12201C]">Brand Voice & Personality</h3>

            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1">
                Overarching Voice Statement
              </label>
              <textarea
                rows={3}
                value={workingVoice.customToneDescription}
                onChange={e =>
                  setWorkingVoice({ ...workingVoice, customToneDescription: e.target.value })
                }
                className="w-full p-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#167A58] mb-1">
                  ✓ Example of a post that sounds like your brand
                </label>
                <textarea
                  rows={3}
                  value={workingVoice.examplePositive}
                  onChange={e =>
                    setWorkingVoice({ ...workingVoice, examplePositive: e.target.value })
                  }
                  className="w-full p-3 text-xs rounded-xl border border-emerald-200 bg-emerald-50/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C2413B] mb-1">
                  ✕ Content that should NOT sound like your brand
                </label>
                <textarea
                  rows={3}
                  value={workingVoice.exampleNegative}
                  onChange={e =>
                    setWorkingVoice({ ...workingVoice, exampleNegative: e.target.value })
                  }
                  className="w-full p-3 text-xs rounded-xl border border-red-200 bg-red-50/20"
                />
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-stone-100">
              <h4 className="text-xs font-bold text-[#12201C] uppercase tracking-wider">
                Platform Tone Rules
              </h4>

              {[
                { p: 'linkedin', name: 'LinkedIn' },
                { p: 'instagram', name: 'Instagram' },
                { p: 'x', name: 'X (formerly Twitter)' },
                { p: 'facebook', name: 'Facebook' },
                { p: 'threads', name: 'Meta Threads' }
              ].map(item => (
                <div key={item.p} className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="w-28 font-bold text-xs text-[#12201C]">{item.name}</span>
                  <input
                    type="text"
                    value={workingVoice.platformRules[item.p as Platform] || ''}
                    onChange={e =>
                      setWorkingVoice({
                        ...workingVoice,
                        platformRules: {
                          ...workingVoice.platformRules,
                          [item.p as Platform]: e.target.value
                        }
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Terminology Table */}
      {activeTab === 'terminology' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-plumb-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#12201C]">Brand Terminology Dictionary</h3>
                <p className="text-xs text-[#68756F]">
                  Exact matching rules used by the AI auditor to flag discouraged or informal language.
                </p>
              </div>

              <button
                onClick={() => setAddTermModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#0A4A3D] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Term Rule
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-[#68756F] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Context</th>
                    <th className="py-3 px-3">Preferred Term</th>
                    <th className="py-3 px-3">Banned / Discouraged</th>
                    <th className="py-3 px-3">Explanation & Rule</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {workingTerminology.map(term => (
                    <tr key={term.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-semibold text-[#12201C]">{term.context}</td>
                      <td className="py-3 px-3 font-bold text-[#167A58]">{term.preferredTerm}</td>
                      <td className="py-3 px-3 font-bold text-[#C2413B] line-through">{term.bannedTerm}</td>
                      <td className="py-3 px-3 text-stone-600 max-w-sm">{term.explanation}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteTerm(term.id)}
                          className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                          title="Delete term"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Approved Facts Table */}
      {activeTab === 'facts' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-plumb-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#12201C]">Approved Facts & Claims Repository</h3>
                <p className="text-xs text-[#68756F]">
                  Verified statutory claims used to cross-reference statements before publishing.
                </p>
              </div>

              <button
                onClick={() => setAddFactModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#0A4A3D] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Approved Fact
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-[#68756F] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Verified Fact</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Source Document</th>
                    <th className="py-3 px-3">Owner</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {workingFacts.map(fact => (
                    <tr key={fact.id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-medium text-[#12201C] max-w-sm">{fact.fact}</td>
                      <td className="py-3 px-3 text-stone-600">{fact.category}</td>
                      <td className="py-3 px-3 text-[11px] font-mono text-stone-500">{fact.source}</td>
                      <td className="py-3 px-3 text-stone-600">{fact.approvalOwner}</td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleFactStatus(fact.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            fact.approvalStatus === 'approved'
                              ? 'bg-emerald-100 text-[#167A58]'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                          title="Click to toggle status"
                        >
                          {fact.approvalStatus}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteFact(fact.id)}
                          className="p-1 text-stone-400 hover:text-red-600"
                          title="Delete fact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Colours and Fonts */}
      {activeTab === 'colors' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-plumb-subtle space-y-6">
            <h3 className="text-base font-bold text-[#12201C]">Brand Palette & Typography</h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { key: 'primary', label: 'Primary Brand Color', val: workingColors.primary },
                { key: 'secondary', label: 'Secondary Green', val: workingColors.secondary },
                { key: 'accent', label: 'Accent / Warning Amber', val: workingColors.accent },
                { key: 'background', label: 'Mineral Background', val: workingColors.background }
              ].map(c => (
                <div key={c.key} className="p-4 rounded-xl border border-stone-200 text-xs space-y-2">
                  <div
                    className="w-full h-12 rounded-lg border border-stone-200 shadow-xs"
                    style={{ backgroundColor: c.val }}
                  />
                  <div className="font-semibold text-[#12201C]">{c.label}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={c.val}
                      onChange={e =>
                        setWorkingColors({ ...workingColors, [c.key]: e.target.value })
                      }
                      className="w-6 h-6 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={c.val}
                      onChange={e =>
                        setWorkingColors({ ...workingColors, [c.key]: e.target.value })
                      }
                      className="w-full font-mono text-[11px] px-2 py-1 border border-stone-200 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
              <div>
                <label className="block text-xs font-semibold text-[#12201C] mb-1">Heading Font</label>
                <select
                  value={workingFonts.heading}
                  onChange={e => setWorkingFonts({ ...workingFonts, heading: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                >
                  <option value="Inter">Inter (Sans-Serif)</option>
                  <option value="Merriweather">Merriweather (Academic)</option>
                  <option value="Playfair Display">Playfair Display</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#12201C] mb-1">Body Font</label>
                <select
                  value={workingFonts.body}
                  onChange={e => setWorkingFonts({ ...workingFonts, body: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Logos and Assets */}
      {activeTab === 'assets' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-plumb-subtle space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#12201C]">Official Crest & Asset Library</h3>
                <p className="text-xs text-[#68756F]">
                  Approved vector logos, banners, and social media templates.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {workingAssets.map(asset => (
                <div key={asset.id} className="p-4 rounded-xl border border-stone-200 space-y-3 bg-stone-50/50">
                  <div className="h-28 rounded-lg bg-stone-900 overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#12201C] truncate">{asset.name}</div>
                    <div className="flex items-center justify-between text-[11px] text-[#68756F]">
                      <span className="capitalize">{asset.variant} variant</span>
                      <span>{asset.size}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-[10px]">
                    <span className="text-[#167A58] font-bold">✓ Approved</span>
                    <span className="text-stone-400">{asset.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Rulebook PDF */}
      {activeTab === 'documents' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-plumb-subtle space-y-5">
            <div>
              <h3 className="text-base font-bold text-[#12201C]">Brand Rulebook Source Documents</h3>
              <p className="text-xs text-[#68756F]">
                Documents attached to the workspace. Automatic document parsing is not enabled in this test build.
              </p>
            </div>

            {guidelines.rulebookDocuments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-xs text-stone-600">
                No documents have been added. Add verified facts and terminology in the other Brand Knowledge tabs; document parsing is not yet available.
              </div>
            ) : <div className="space-y-3">
              {guidelines.rulebookDocuments.map(doc => (
                <div key={doc.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#0A4A3D]" />
                    <div>
                      <div className="text-xs font-bold text-[#12201C]">{doc.filename}</div>
                      <div className="text-[11px] text-stone-500">
                        {doc.size} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-[#167A58] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Attached
                  </span>
                </div>
              ))}
            </div>}
          </div>
        </div>
      )}

      {/* TAB 7: Version History */}
      {activeTab === 'versions' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-plumb-subtle space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#12201C]">Guideline Version History</h3>
              <p className="text-xs text-[#68756F]">
                Immutable timeline of guideline amendments. Previous versions are kept intact.
              </p>
            </div>

            <div className="divide-y divide-stone-100">
              {guidelineVersions.map(ver => (
                <div key={ver.version} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0A4A3D] bg-emerald-50 px-2 py-0.5 rounded">
                        {ver.version}
                      </span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-600 font-medium">
                        Edited by <strong>{ver.editor}</strong>
                      </span>
                      <span className="text-stone-400 font-mono text-[11px]">
                        ({new Date(ver.timestamp).toLocaleDateString()})
                      </span>
                    </div>
                    <p className="text-stone-700 max-w-2xl">{ver.summary}</p>
                  </div>

                  {ver.version !== guidelines.version && (
                    <button
                      onClick={() => handleRestoreVersion(ver.version)}
                      className="px-3.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#0A4A3D]" />
                      Restore this version
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save New Version Modal */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Publish New Brand Guidelines Version"
        subtitle="Creating a new version permanently records your amendments."
      >
        <form onSubmit={handleSaveNewVersionSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#12201C] mb-1">
              Summary of Modifications
            </label>
            <textarea
              rows={3}
              required
              value={changeSummary}
              onChange={e => setChangeSummary(e.target.value)}
              placeholder="e.g. Added a verified company fact and updated preferred terminology..."
              className="w-full p-3 text-xs rounded-xl border border-stone-200"
            />
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#0A4A3D]">
            This will create the next version of the active brand guidelines. Historical posts will continue to evaluate against the version they were drafted with.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSaveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0A4A3D] text-white text-xs font-semibold"
            >
              Publish New Version
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Term Modal */}
      <Modal
        isOpen={addTermModalOpen}
        onClose={() => setAddTermModalOpen(false)}
        title="Add Terminology Rule"
        subtitle="Define preferred phrasing and disallowed vocabulary."
      >
        <form onSubmit={handleAddTerm} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#12201C] mb-1">Rule Context</label>
            <input
              type="text"
              required
              value={newContext}
              onChange={e => setNewContext(e.target.value)}
              placeholder="e.g. University Accreditation or Student Body"
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#167A58] mb-1">Preferred Term</label>
            <input
              type="text"
              required
              value={newPreferred}
              onChange={e => setNewPreferred(e.target.value)}
              placeholder="e.g. Students"
              className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200 bg-emerald-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#C2413B] mb-1">Banned / Discouraged Term</label>
            <input
              type="text"
              required
              value={newBanned}
              onChange={e => setNewBanned(e.target.value)}
              placeholder="e.g. Kids"
              className="w-full px-3 py-2 text-xs rounded-xl border border-red-200 bg-red-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#12201C] mb-1">Explanation</label>
            <textarea
              rows={2}
              value={newExplanation}
              onChange={e => setNewExplanation(e.target.value)}
              placeholder="Explain why this rule exists..."
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddTermModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0A4A3D] text-white text-xs font-semibold"
            >
              Add Term
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Fact Modal */}
      <Modal
        isOpen={addFactModalOpen}
        onClose={() => setAddFactModalOpen(false)}
        title="Add Approved Verified Fact"
        subtitle="Enter officially verified company or institutional information."
      >
        <form onSubmit={handleAddFact} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#12201C] mb-1">Verified Fact Statement</label>
            <textarea
              rows={3}
              required
              value={newFactText}
              onChange={e => setNewFactText(e.target.value)}
              placeholder="e.g. Our organisation holds [accreditation] status, verified by [official source] on [date]..."
              className="w-full p-2.5 text-xs rounded-xl border border-stone-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1">Source Document</label>
              <input
                type="text"
                required
                value={newFactSource}
                onChange={e => setNewFactSource(e.target.value)}
                placeholder="Certificate # or Charter §"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1">Category</label>
              <input
                type="text"
                value={newFactCategory}
                onChange={e => setNewFactCategory(e.target.value)}
                placeholder="Accreditation / Rankings"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddFactModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0A4A3D] text-white text-xs font-semibold"
            >
              Save Fact
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

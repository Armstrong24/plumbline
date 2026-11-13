import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Users, User, ArrowRight, ArrowLeft, Building2 } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { workspaceStorage } from '../../services/workspaceStorage';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Q1
  const [roleDesc, setRoleDesc] = useState('Workspace owner');
  const [roleOther, setRoleOther] = useState('');

  // Q2
  const [mainUses, setMainUses] = useState<string[]>([]);
  const [mainUseOther, setMainUseOther] = useState('');

  // Q3
  const [teamSize, setTeamSize] = useState('Just me');

  // Q4
  const [orgType, setOrgType] = useState('Small business');
  const [orgOther, setOrgOther] = useState('');

  // Q5
  const [referral, setReferral] = useState('Other');
  const [referralOther, setReferralOther] = useState('');

  // Q6
  const [workspaceStructure, setWorkspaceStructure] = useState<'manager' | 'independent'>('manager');

  const toggleMainUse = (item: string) => {
    if (mainUses.includes(item)) {
      setMainUses(mainUses.filter(u => u !== item));
    } else {
      setMainUses([...mainUses, item]);
    }
  };

  const handleFinish = () => {
    workspaceStorage.setOnboardingCompleted(true);
    // Proceed to brand setup
    navigate('/brand-setup');
  };

  return (
    <div className="min-h-screen bg-[#F2F5F3] flex flex-col justify-between py-8 px-4 sm:px-6 font-sans">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0A4A3D] flex items-center justify-center text-white">
            <div className="flex flex-col items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 mb-0.5"></div>
              <div className="w-0.5 h-3 bg-white"></div>
              <div className="w-2.5 h-2.5 bg-amber-400 rotate-45 transform origin-center -mt-0.5"></div>
            </div>
          </div>
          <span className="font-bold text-[#12201C] text-lg">Plumbline</span>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i + 1 === step
                  ? 'w-7 bg-[#0A4A3D]'
                  : i + 1 < step
                  ? 'w-2 bg-[#167A58]'
                  : 'w-2 bg-stone-300'
              }`}
            />
          ))}
          <span className="text-xs text-[#68756F] font-semibold ml-2">
            Step {step} of {totalSteps}
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl mx-auto w-full bg-white rounded-2xl p-8 sm:p-10 shadow-plumb-card border border-stone-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#12201C] tracking-tight">
            Let's tailor Plumbline to you
          </h1>
          <p className="text-sm text-[#68756F] mt-1">
            Tell us a little about yourself so we can customise your workspace.
          </p>
        </div>

        {/* STEP 1: Role */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-[#12201C]">
              1. What best describes your role?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                'Student',
                'Designer',
                'Social Media Manager',
                'Marketing Manager',
                'Intern',
                'Freelancer',
                'Content Creator',
                'Business Owner',
                'Other'
              ].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRoleDesc(opt)}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                    roleDesc === opt
                      ? 'border-[#0A4A3D] bg-emerald-50 text-[#0A4A3D] ring-1 ring-[#0A4A3D]'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {roleDesc === 'Other' && (
              <div className="pt-2">
                <input
                  type="text"
                  value={roleOther}
                  onChange={e => setRoleOther(e.target.value)}
                  placeholder="Please specify your role..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Main Uses */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-[#12201C]">
              2. What will you mainly use this app for? (Select all that apply)
            </h3>
            <div className="space-y-2">
              {[
                'Plan and schedule social media content.',
                'Track social media performance.',
                'Monitor brand mentions and media coverage.',
                'Manage multiple social accounts.',
                'Discover trends and content ideas.',
                'Collaborate with a team.',
                'Explore the app / try it out.',
                'Other'
              ].map(opt => {
                const selected = mainUses.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleMainUse(opt)}
                    className={`w-full p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                      selected
                        ? 'border-[#0A4A3D] bg-emerald-50 text-[#0A4A3D] font-semibold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        selected
                          ? 'bg-[#0A4A3D] border-[#0A4A3D] text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {mainUses.includes('Other') && (
              <input
                type="text"
                value={mainUseOther}
                onChange={e => setMainUseOther(e.target.value)}
                placeholder="Please describe other use cases..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]"
              />
            )}
          </div>
        )}

        {/* STEP 3: Team Size */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-[#12201C]">
              3. How many people will use this app with you?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Just me.',
                '2–5 people.',
                '6–20 people.',
                '21–50 people.',
                '50+ people.',
                "I'm not sure yet."
              ].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTeamSize(opt)}
                  className={`p-3.5 rounded-xl border text-xs font-medium text-left transition-all ${
                    teamSize === opt
                      ? 'border-[#0A4A3D] bg-emerald-50 text-[#0A4A3D] ring-1 ring-[#0A4A3D]'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Org Type */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-[#12201C]">
              4. What type of organisation do you work with?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Individual / Personal brand.",
                'Freelancer / solo creator.',
                'Small business.',
                'Startup.',
                'Agency.',
                'Large company.',
                'Nonprofit.',
                'Other.'
              ].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOrgType(opt)}
                  className={`p-3.5 rounded-xl border text-xs font-medium text-left transition-all ${
                    orgType === opt
                      ? 'border-[#0A4A3D] bg-emerald-50 text-[#0A4A3D] ring-1 ring-[#0A4A3D]'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {orgType === 'Other.' && (
              <input
                type="text"
                value={orgOther}
                onChange={e => setOrgOther(e.target.value)}
                placeholder="Specify organisation type..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]"
              />
            )}
          </div>
        )}

        {/* STEP 5: Referral Source */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-semibold text-[#12201C]">
              5. Where did you first hear about us?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                'Instagram',
                'TikTok',
                'LinkedIn',
                'X / Twitter',
                'YouTube',
                'Google search',
                'Friend or colleague',
                'Blog or article',
                'Other'
              ].map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setReferral(opt)}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                    referral === opt
                      ? 'border-[#0A4A3D] bg-emerald-50 text-[#0A4A3D] ring-1 ring-[#0A4A3D]'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {referral === 'Other' && (
              <input
                type="text"
                value={referralOther}
                onChange={e => setReferralOther(e.target.value)}
                placeholder="Tell us where..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]"
              />
            )}
          </div>
        )}

        {/* STEP 6: Workspace Structure */}
        {step === 6 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h3 className="text-sm font-semibold text-[#12201C]">
                6. Would you like to have people working under you who can create and edit posts for your approval?
              </h3>
              <p className="text-xs text-[#68756F] mt-1">
                This configures the manager-employee governance hierarchy for your workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Option A: Manager Workspace */}
              <button
                type="button"
                onClick={() => setWorkspaceStructure('manager')}
                className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 ${
                  workspaceStructure === 'manager'
                    ? 'border-[#0A4A3D] bg-emerald-50/70 ring-2 ring-[#0A4A3D]'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#0A4A3D] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#12201C]">YES — Manager workspace</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-[#0A4A3D]">
                      Recommended for Teams
                    </span>
                  </div>
                  <p className="text-xs text-[#68756F] mt-1.5 leading-relaxed">
                    I manage a team. My employees can create and edit drafts, but only authorised managers can approve and publish posts.
                  </p>
                </div>
              </button>

              {/* Option B: Independent Workspace */}
              <button
                type="button"
                onClick={() => setWorkspaceStructure('independent')}
                className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 ${
                  workspaceStructure === 'independent'
                    ? 'border-[#0A4A3D] bg-emerald-50/70 ring-2 ring-[#0A4A3D]'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-stone-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-[#12201C]">NO — Independent workspace</span>
                  <p className="text-xs text-[#68756F] mt-1.5 leading-relaxed">
                    I manage my own content independently without a team approval hierarchy.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-5 border-t border-stone-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#0A4A3D] hover:bg-[#063028] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-[#0A4A3D] hover:bg-[#063028] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              Finish & Open Brand Setup
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-stone-400 mt-6">
        Workspace Initialisation • Plumbline
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!termsAgreed) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password, workspaceId.trim() || undefined);
      setLoading(false);
      // Navigate to onboarding after successful registration
      navigate('/onboarding');
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white font-sans">
      {/* Left Column: Brand Hero */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0A4A3D] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-300 mb-0.5"></div>
              <div className="w-0.5 h-4 bg-white"></div>
              <div className="w-3 h-3 bg-amber-400 rotate-45 transform origin-center -mt-0.5"></div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Plumbline</h1>
            <p className="text-xs text-emerald-200">Brand Governance & Publishing Platform</p>
          </div>
        </div>

        <div className="relative z-10 my-auto py-8 max-w-md">
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Establish your brand guardrails in minutes.
          </h2>
          <p className="mt-4 text-emerald-100 text-sm leading-relaxed">
            Protect brand reputation, streamline multi-channel social workflows, and catch unapproved claims before they go live.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Centralized Brand Guidelines & verified facts repository',
              'AI tone auditing tailored to LinkedIn, Instagram, X & Threads',
              'Clear creator and reviewer approval workflows',
              'Zero automated rewriting — reviewers maintain complete sovereignty'
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-emerald-300/80">
          Plumbline · Workspace registration
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-[#F2F5F3]">
        <div className="max-w-xl mx-auto w-full bg-white rounded-2xl p-8 sm:p-10 shadow-plumb-card border border-stone-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#12201C] tracking-tight">Create your account</h2>
            <p className="text-sm text-[#68756F] mt-1">
              Create a workspace as an owner, or join an existing workspace using its ID.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]/20 focus:border-[#0A4A3D]"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]/20 focus:border-[#0A4A3D]"
                  placeholder="r.sharma@organization.com"
                />
              </div>
            </div>


            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1">
                Join an existing workspace (optional)
              </label>
              <input
                type="text"
                value={workspaceId}
                onChange={e => setWorkspaceId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]/20 focus:border-[#0A4A3D]"
                placeholder="Leave blank to create a new workspace"
              />
              <p className="text-[11px] text-stone-500 mt-1">Ask your workspace owner for the ID shown on their Profile page.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#12201C] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]/20 focus:border-[#0A4A3D]"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#12201C] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]/20 focus:border-[#0A4A3D]"
                    placeholder="Repeat password"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600">
                <input
                  type="checkbox"
                  required
                  checked={termsAgreed}
                  onChange={e => setTermsAgreed(e.target.checked)}
                  className="rounded border-stone-300 text-[#0A4A3D] focus:ring-[#0A4A3D] mt-0.5"
                />
                <span>
                  I agree to Plumbline's Terms of Service and acknowledge that uploaded materials are governed by our confidential enterprise data policies.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-[#0A4A3D] hover:bg-[#063028] text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? 'Creating workspace...' : 'Continue to Onboarding'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#68756F]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0A4A3D] hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

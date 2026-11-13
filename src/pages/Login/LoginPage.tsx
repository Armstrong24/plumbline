import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/app/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white font-sans">
      <div className="hidden lg:flex lg:col-span-5 bg-[#0A4A3D] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full border border-emerald-800/40" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center"><ShieldCheck className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-bold">Plumbline</h1><p className="text-xs text-emerald-200">Brand Governance & Publishing</p></div>
        </div>
        <div className="relative z-10 my-auto py-12 max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight">Every post, true to your brand, before it goes live.</h2>
          <p className="mt-6 text-emerald-100 leading-relaxed">Bring your team, brand rules and social channels into one review-first publishing workspace.</p>
        </div>
        <div className="relative z-10 text-xs text-emerald-300/80">Plumbline · Workspace sign in</div>
      </div>

      <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-[#F2F5F3]">
        <div className="max-w-md mx-auto w-full bg-white rounded-2xl p-8 sm:p-10 shadow-plumb-card border border-stone-200">
          <h2 className="text-2xl font-bold text-[#12201C]">Sign in</h2>
          <p className="text-sm text-[#68756F] mt-1 mb-7">Use the email and password for your Plumbline account.</p>
          {error && <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1">Email address</label>
              <div className="relative"><Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]/20" placeholder="you@company.com" /></div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#12201C] mb-1">Password</label>
              <div className="relative"><Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]/20" placeholder="Your password" /></div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0A4A3D] hover:bg-[#063028] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign in to workspace'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-[#68756F]">New to Plumbline? <Link to="/register" className="text-[#0A4A3D] font-semibold hover:underline">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
};

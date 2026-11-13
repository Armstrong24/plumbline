import React from 'react';
import { User, Shield, CalendarDays, Mail, Building2, FileText, CheckCircle2, Share2, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Badge } from '../../components/common/Badge';

function formatDate(value?: string): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleString();
}

export const ProfilePage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const { workspace, teamMembers, posts, channels } = useWorkspace();
  const findings = posts.flatMap(post => post.findings);
  const acceptedFindings = findings.filter(item => ['accepted', 'fixed', 'resolved'].includes(item.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12201C] tracking-tight flex items-center gap-2">
          <User className="w-7 h-7 text-[#0A4A3D]" /> Profile & Account
        </h1>
        <p className="text-sm text-[#68756F] mt-1">Account details and activity recorded in this Plumbline workspace.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-5 bg-white rounded-2xl p-6 border border-stone-200 shadow-plumb-subtle space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-900/20 flex items-center justify-center text-xl font-bold text-[#0A4A3D]">
              {(currentUser.name || currentUser.email || '?').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#12201C]">{currentUser.name || 'Signed-in user'}</h2>
              <div className="text-xs text-[#68756F]">{currentUser.email}</div>
              <div className="mt-1.5"><Badge variant="primary" size="sm">{currentRole}</Badge></div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-stone-100 text-xs text-stone-700">
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="text-[#68756F] flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</span>
              <span className="font-semibold text-[#12201C]">{currentUser.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="text-[#68756F] flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Account role</span>
              <span className="font-semibold text-[#12201C] capitalize">{currentRole}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="text-[#68756F] flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> Workspace</span>
              <span className="font-semibold text-[#12201C]">{workspace.name || 'My Workspace'}</span>
            </div>
            <div className="py-2 border-t border-stone-100">
              <div className="text-[#68756F] mb-1">Workspace ID — share this with colleagues to join</div>
              <div className="font-mono text-[11px] break-all bg-stone-50 border border-stone-200 rounded-lg p-2 select-all">{currentUser.workspaceId}</div>
            </div>
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="text-[#68756F] flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" /> Account created</span>
              <span className="font-semibold text-[#12201C]">{formatDate(currentUser.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-1">
              <span className="text-[#68756F] flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" /> Last sign-in</span>
              <span className="font-semibold text-[#12201C]">{formatDate(currentUser.lastLogin)}</span>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-plumb-subtle space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#12201C]">Workspace activity</h3>
              <p className="text-xs text-[#68756F]">Counts are calculated from records actually created in this workspace.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <FileText className="w-4 h-4 mx-auto text-[#0A4A3D] mb-2" />
                <div className="text-2xl font-bold text-[#12201C]">{posts.length}</div>
                <div className="text-[11px] text-[#68756F]">Posts created</div>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-700 mb-2" />
                <div className="text-2xl font-bold text-emerald-800">{posts.filter(post => post.status === 'published').length}</div>
                <div className="text-[11px] text-[#68756F]">Posts published</div>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <Shield className="w-4 h-4 mx-auto text-[#0A4A3D] mb-2" />
                <div className="text-2xl font-bold text-[#12201C]">{acceptedFindings}</div>
                <div className="text-[11px] text-[#68756F]">Findings resolved</div>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <Share2 className="w-4 h-4 mx-auto text-[#0A4A3D] mb-2" />
                <div className="text-2xl font-bold text-[#12201C]">{channels.filter(channel => channel.status === 'connected').length}</div>
                <div className="text-[11px] text-[#68756F]">Connected accounts</div>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <Users className="w-4 h-4 mx-auto text-[#0A4A3D] mb-2" />
                <div className="text-2xl font-bold text-[#12201C]">{teamMembers.length}</div>
                <div className="text-[11px] text-[#68756F]">Local workspace users</div>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5">
            <h3 className="text-sm font-bold text-[#12201C]">Account and workspace storage</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">Sign-in accounts, social OAuth connections, drafts, comments, brand guidelines, and workspace activity are synchronized through the local backend and shared with other users who register using the same Workspace ID. Social accounts remain private to the user who connected them. This is a single-server test setup, not a production deployment.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

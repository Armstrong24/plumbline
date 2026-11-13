import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle,
  Filter,
  ArrowRight,
  ShieldAlert,
  Search,
  Share2,
  User,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Badge } from '../../components/common/Badge';
import { PostStatus, Platform } from '../../types';

export const ReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentRole } = useAuth();
  const { posts } = useWorkspace();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter(post => {
    if (statusFilter !== 'all' && post.status !== statusFilter) return false;
    if (platformFilter !== 'all' && !post.platforms.includes(platformFilter as Platform)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.campaign.toLowerCase().includes(q) ||
        post.creatorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'in_review':
        return <Badge variant="warning">In Review</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'changes_requested':
        return <Badge variant="danger">Revisions Needed</Badge>;
      case 'published':
        return <Badge variant="primary">Published</Badge>;
      case 'draft':
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#12201C] tracking-tight flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-[#0A4A3D]" />
            {currentRole === 'employee' ? 'My Submissions & Approval Trail' : 'Review & Approval Queue'}
          </h1>
          <p className="text-sm text-[#68756F] mt-1">
            {currentRole === 'employee'
              ? 'View feedback, contested findings, and manager decisions on your campaign drafts.'
              : 'Inspect evidence-backed AI findings, contestations, and sign off on campaign publishing.'}
          </p>
        </div>

        <button
          onClick={() => navigate('/app/create')}
          className="px-5 py-2.5 rounded-xl bg-[#0A4A3D] hover:bg-[#063028] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create new submission
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-plumb-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Submissions' },
            { id: 'in_review', label: 'Awaiting Review' },
            { id: 'changes_requested', label: 'Revisions Requested' },
            { id: 'approved', label: 'Approved' },
            { id: 'published', label: 'Published' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#0A4A3D] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Platform */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search posts or creators..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]"
            />
          </div>

          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4A3D]"
          >
            <option value="all">All Platforms</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="x">X</option>
            <option value="facebook">Facebook</option>
            <option value="threads">Threads</option>
          </select>
        </div>
      </div>

      {/* Posts Table / Cards */}
      <div className="space-y-4">
        {filteredPosts.map(post => {
          const openFindings = post.findings.filter(f => f.status === 'open' || f.status === 'contested');

          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl p-6 border border-stone-200 shadow-plumb-subtle hover:border-stone-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200 mt-0.5">
                  {post.mediaUrls[0] ? (
                    <img
                      src={post.mediaUrls[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                      No Art
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#0A4A3D] bg-emerald-50 px-2 py-0.5 rounded">
                      {post.campaign}
                    </span>
                    <h3 className="text-sm font-bold text-[#12201C]">{post.title}</h3>
                    {getStatusBadge(post.status)}
                    <span className="text-[10px] font-mono text-stone-400">
                      Version {post.version}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-1 italic">
                    "{post.originalDescription}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#68756F] pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      Creator: <strong className="text-[#12201C]">{post.creatorName}</strong>
                    </span>
                    <span>•</span>
                    <span className="capitalize">
                      Platforms: <strong>{post.platforms.join(', ')}</strong>
                    </span>
                    <span>•</span>
                    {openFindings.length > 0 ? (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        {openFindings.length} open AI findings
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        0 active findings
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Column */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                <button
                  onClick={() => navigate(`/app/review/${post.id}`)}
                  className="px-5 py-2.5 rounded-xl bg-[#0A4A3D] hover:bg-[#063028] text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <span>{currentRole === 'employee' ? 'Inspect Details' : 'Open Review Studio'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-400">
            <CheckSquare className="w-10 h-10 mx-auto mb-2 text-stone-300" />
            <h4 className="text-sm font-semibold text-stone-700">No submissions found</h4>
            <p className="text-xs mt-1">Try clearing filters or compose a new post.</p>
          </div>
        )}
      </div>
    </div>
  );
};

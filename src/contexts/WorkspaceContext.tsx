import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Workspace,
  BrandGuidelines,
  GuidelineVersionHistory,
  Post,
  CommentItem,
  ChannelConnection,
  TeamMember,
  AuditFinding,
  Platform
} from '../types';
import { workspaceStorage } from '../services/workspaceStorage';
import { apiClient, SocialConnection } from '../services/api/client';
import { useAuth } from './AuthContext';

interface PublishResult {
  succeeded: number;
  failed: number;
  errors: string[];
}

interface WorkspaceContextType {
  workspace: Workspace;
  guidelines: BrandGuidelines;
  guidelineVersions: GuidelineVersionHistory[];
  posts: Post[];
  comments: CommentItem[];
  channels: ChannelConnection[];
  teamMembers: TeamMember[];
  isCleanWorkspace: boolean;
  createPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'reviewTrail'>) => Post;
  updatePost: (post: Post) => void;
  submitPostForApproval: (postId: string, notes?: string) => void;
  approvePost: (postId: string, comment?: string) => void;
  requestChanges: (postId: string, reason: string) => void;
  publishPost: (postId: string) => Promise<PublishResult>;
  updateFindingStatus: (postId: string, findingId: string, status: AuditFinding['status'], reason?: string) => void;
  replyToComment: (commentId: string, replyText: string) => Promise<void>;
  moderateComment: (commentId: string, action: 'report' | 'block' | 'delete', reason?: string) => void;
  syncSocialComments: () => Promise<number>;
  saveGuidelines: (guidelines: BrandGuidelines, changeSummary: string) => void;
  restoreGuidelineVersion: (version: string) => void;
  startCleanWorkspace: (organizationName: string, brandName: string) => void;
  refreshData: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const PLATFORM_NAMES: Record<Platform, string> = {
  linkedin: 'LinkedIn', instagram: 'Instagram', x: 'X', facebook: 'Facebook Pages', threads: 'Threads', youtube: 'YouTube'
};

function mapConnection(connection: SocialConnection): ChannelConnection {
  return {
    id: connection.id,
    platform: connection.platform,
    accountId: connection.accountId,
    name: PLATFORM_NAMES[connection.platform],
    status: 'connected',
    accountName: connection.accountName,
    accountHandle: connection.accountHandle,
    lastSync: connection.connectedAt,
    capabilities: connection.capabilities
  };
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace>(() => workspaceStorage.getWorkspace());
  const [guidelines, setGuidelines] = useState<BrandGuidelines>(() => workspaceStorage.getGuidelines());
  const [guidelineVersions, setGuidelineVersions] = useState<GuidelineVersionHistory[]>(() => workspaceStorage.getGuidelineVersions());
  const [posts, setPosts] = useState<Post[]>(() => workspaceStorage.getPosts());
  const [comments, setComments] = useState<CommentItem[]>(() => workspaceStorage.getComments());
  const [channels, setChannels] = useState<ChannelConnection[]>(() => workspaceStorage.getChannels());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => workspaceStorage.getTeamMembers());

  const refreshData = () => {
    setWorkspace(workspaceStorage.getWorkspace());
    setGuidelines(workspaceStorage.getGuidelines());
    setGuidelineVersions(workspaceStorage.getGuidelineVersions());
    setPosts(workspaceStorage.getPosts());
    setComments(workspaceStorage.getComments());
    setChannels(workspaceStorage.getChannels());
  };

  const refreshConnections = async () => {
    if (!isAuthenticated) return;
    try {
      const connected = await apiClient.getSocialConnections();
      const connectedByPlatform = new Map<Platform, ChannelConnection>();
      for (const item of connected) {
        if (!connectedByPlatform.has(item.platform)) connectedByPlatform.set(item.platform, mapConnection(item));
      }
      const catalogue = workspaceStorage.getChannels().map(channel => connectedByPlatform.get(channel.platform) || {
        ...channel, status: 'not_connected' as const, accountName: '', accountHandle: '', lastSync: 'Not connected'
      });
      workspaceStorage.saveChannels(catalogue);
      setChannels(catalogue);
    } catch {
      // Keep last known local display if the API is temporarily unreachable.
    }
  };

  useEffect(() => {
    let active = true;
    workspaceStorage.setPersistenceHandler(null);
    if (currentUser.id) {
      workspaceStorage.setCurrentUser(currentUser);
      setTeamMembers(workspaceStorage.getTeamMembers());
    }
    if (!isAuthenticated || !currentUser.id) {
      refreshData();
      return () => { active = false; };
    }

    const hydrateWorkspace = async () => {
      try {
        const sharedData = await apiClient.getWorkspaceData();
        if (!active) return;
        workspaceStorage.hydrateWorkspaceData(sharedData);
      } catch {
        // Local cache remains available when the API cannot be reached.
      }
      if (!active) return;
      refreshData();
      try {
        const members = await apiClient.getWorkspaceMembers();
        if (active) setTeamMembers(members.map(member => ({ ...member, role: member.role as TeamMember['role'], status: member.status as TeamMember['status'] })));
      } catch {
        // Fall back to the cached list of local members.
      }
      if (active) {
        let saveQueue: Promise<unknown> = Promise.resolve();
        workspaceStorage.setPersistenceHandler(() => {
          const snapshot = workspaceStorage.getWorkspaceSnapshot();
          saveQueue = saveQueue.catch(() => undefined).then(() => apiClient.saveWorkspaceData(snapshot));
          void saveQueue.catch(() => undefined);
        });
        void refreshConnections();
      }
    };

    void hydrateWorkspace();
    return () => { active = false; workspaceStorage.setPersistenceHandler(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id, isAuthenticated]);

  const createPost = (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'reviewTrail'>): Post => {
    const timestamp = new Date().toISOString();
    const newPost: Post = {
      ...postData,
      id: `post-${crypto.randomUUID()}`,
      version: 'v1',
      createdAt: timestamp,
      updatedAt: timestamp,
      reviewTrail: [{
        id: `rev-${crypto.randomUUID()}`,
        version: 'v1',
        timestamp,
        userName: currentUser.name,
        userRole: currentUser.role === 'manager' || currentUser.role === 'owner' || currentUser.role === 'admin' ? 'Manager' : 'Social Media Creator',
        action: 'Created post draft',
        comment: 'Initial draft composition.'
      }]
    };
    workspaceStorage.addPost(newPost);
    refreshData();
    return newPost;
  };

  const updatePost = (updated: Post) => {
    workspaceStorage.updatePost({ ...updated, updatedAt: new Date().toISOString() });
    refreshData();
  };

  const submitPostForApproval = (postId: string, notes?: string) => {
    const post = workspaceStorage.getPostById(postId);
    if (!post) return;
    const nextVer = `v${Math.max(1, Number(post.version.replace('v', '')) || 1) + 1}`;
    post.status = 'in_review';
    post.version = nextVer;
    post.updatedAt = new Date().toISOString();
    post.reviewTrail.push({
      id: `rev-${crypto.randomUUID()}`, version: nextVer, timestamp: post.updatedAt,
      userName: currentUser.name,
      userRole: currentUser.role === 'manager' || currentUser.role === 'owner' || currentUser.role === 'admin' ? 'Manager' : 'Social Media Creator',
      action: 'Submitted for approval', comment: notes || 'Submitted draft for review.'
    });
    workspaceStorage.updatePost(post);
    refreshData();
  };

  const approvePost = (postId: string, comment?: string) => {
    const post = workspaceStorage.getPostById(postId);
    if (!post) return;
    post.status = 'approved';
    post.updatedAt = new Date().toISOString();
    post.reviewTrail.push({
      id: `rev-${crypto.randomUUID()}`, version: post.version, timestamp: post.updatedAt,
      userName: currentUser.name, userRole: 'Manager', action: 'Approved for publishing',
      comment: comment || 'Approved by a workspace reviewer.'
    });
    workspaceStorage.updatePost(post);
    refreshData();
  };

  const requestChanges = (postId: string, reason: string) => {
    const post = workspaceStorage.getPostById(postId);
    if (!post) return;
    post.status = 'changes_requested';
    post.updatedAt = new Date().toISOString();
    post.reviewTrail.push({
      id: `rev-${crypto.randomUUID()}`, version: post.version, timestamp: post.updatedAt,
      userName: currentUser.name, userRole: 'Manager', action: 'Requested revisions', comment: reason
    });
    workspaceStorage.updatePost(post);
    refreshData();
  };

  const publishPost = async (postId: string): Promise<PublishResult> => {
    const post = workspaceStorage.getPostById(postId);
    if (!post) throw new Error('This draft could not be found. Refresh the page and try again.');
    if (post.status !== 'approved' && post.status !== 'published') {
      throw new Error('A post must be approved before it can be published.');
    }
    const alreadyPublished = new Set((post.dispatches || []).filter(item => item.status === 'published').map(item => item.platform));
    const targets = post.platforms.filter(platform => !alreadyPublished.has(platform));
    if (targets.length === 0) return { succeeded: 0, failed: 0, errors: ['Every selected platform already has a successful publish record.'] };

    const results = await Promise.all(targets.map(async platform => {
      const channel = channels.find(item => item.platform === platform && item.status === 'connected');
      if (!channel) return { platform, ok: false as const, error: `${PLATFORM_NAMES[platform]} is not connected.` };
      const variant = post.platformVariants[platform];
      const content = (variant?.description || post.originalDescription || '').trim();
      if (!content) return { platform, ok: false as const, error: `${PLATFORM_NAMES[platform]} has no post text.` };
      const media = post.mediaUrls.find(url => /^https:\/\//i.test(url));
      try {
        const result = await apiClient.publishSocial(platform, {
          text: content,
          title: variant?.title || post.title,
          image_url: platform === 'instagram' || platform === 'threads' || platform === 'facebook' ? media : undefined,
          account_id: channel.accountId
        });
        return { platform, ok: true as const, result, channel };
      } catch (error) {
        return { platform, ok: false as const, error: error instanceof Error ? error.message : 'Platform request failed.' };
      }
    }));

    const timestamp = new Date().toISOString();
    const newDispatches = results.map(result => result.ok ? {
      platform: result.platform,
      status: 'published' as const,
      timestamp,
      targetAccount: result.channel.accountHandle || result.channel.accountName,
      dispatchId: result.result.dispatchId || result.result.id,
      liveUrl: result.result.permalink
    } : {
      platform: result.platform,
      status: 'failed' as const,
      timestamp,
      targetAccount: channels.find(item => item.platform === result.platform)?.accountHandle || '',
      dispatchId: `failed-${result.platform}-${Date.now()}`
    });

    post.dispatches = [...(post.dispatches || []).filter(item => item.status === 'published'), ...newDispatches];
    const failedResults = results.filter(item => !item.ok);
    const succeededCount = results.length - failedResults.length;
    const allSelectedPublished = post.platforms.every(platform => post.dispatches?.some(dispatch => dispatch.platform === platform && dispatch.status === 'published'));
    post.status = allSelectedPublished ? 'published' : 'approved';
    post.updatedAt = timestamp;
    post.reviewTrail.push({
      id: `rev-${crypto.randomUUID()}`, version: post.version, timestamp,
      userName: currentUser.name, userRole: 'Manager',
      action: allSelectedPublished ? 'Published to connected channels' : 'Publishing attempt completed',
      comment: `${succeededCount} successful, ${failedResults.length} failed. ${failedResults.map(item => `${PLATFORM_NAMES[item.platform]}: ${item.error}`).join(' | ')}`
    });
    workspaceStorage.updatePost(post);
    refreshData();
    return {
      succeeded: succeededCount,
      failed: failedResults.length,
      errors: failedResults.map(item => `${PLATFORM_NAMES[item.platform]}: ${item.error}`)
    };
  };

  const updateFindingStatus = (postId: string, findingId: string, status: AuditFinding['status'], reason?: string) => {
    workspaceStorage.updateFindingStatus(postId, findingId, status, reason);
    refreshData();
  };

  const replyToComment = async (commentId: string, replyText: string) => {
    const comment = comments.find(item => item.id === commentId) || workspaceStorage.getComments().find(item => item.id === commentId);
    if (!comment) throw new Error('Comment not found. Sync comments and try again.');
    if (!replyText.trim()) throw new Error('Enter a reply before sending.');
    await apiClient.replyToSocialComment(comment.id, comment.platform, replyText.trim(), comment.sourceAccountId);
    workspaceStorage.replyToComment(commentId, replyText.trim());
    refreshData();
  };

  const moderateComment = (commentId: string, action: 'report' | 'block' | 'delete', reason?: string) => {
    // This is an internal Plumbline triage label only. Platform moderation APIs vary and are not called here.
    workspaceStorage.moderateComment(commentId, action, reason);
    refreshData();
  };

  const syncSocialComments = async (): Promise<number> => {
    const remote = await apiClient.getSocialComments();
    const existing = new Map(workspaceStorage.getComments().map(comment => [`${comment.platform}:${comment.id}`, comment]));
    const syncedFromCurrentAccounts: CommentItem[] = remote.map((item: any) => {
      const previous = existing.get(`${item.platform}:${String(item.id)}`);
      return {
        id: String(item.id),
        platform: item.platform as Platform,
        sourceAccountId: item.accountId,
        authorName: item.authorName || 'Social account user',
        authorAvatar: '',
        authorHandle: item.authorHandle || '',
        text: item.text || '',
        timeReceived: item.timeReceived || new Date().toISOString(),
        likes: Number(item.likes || 0),
        replyCount: Number(item.replyCount || 0),
        status: item.notice ? 'flagged' : previous?.status || 'needs_reply',
        suggestedReply: previous?.suggestedReply || '',
        suggestedReplySource: previous?.suggestedReplySource || '',
        replyDraft: previous?.replyDraft,
        moderationReason: item.notice ? 'Platform connection or permission notice' : previous?.moderationReason
      };
    });
    const merged = new Map<string, CommentItem>(existing);
    for (const item of syncedFromCurrentAccounts) merged.set(`${item.platform}:${item.id}`, item);
    const normalized = Array.from(merged.values()).sort((a, b) => b.timeReceived.localeCompare(a.timeReceived));
    workspaceStorage.saveComments(normalized);
    setComments(normalized);
    return syncedFromCurrentAccounts.filter(item => !item.id.startsWith('permission-')).length;
  };

  const saveGuidelines = (newGuidelines: BrandGuidelines, changeSummary: string) => {
    const currentVerNum = parseInt(newGuidelines.version.replace('v', ''), 10) || 0;
    const nextVersion = `v${currentVerNum + 1}`;
    const updatedGuidelines: BrandGuidelines = {
      ...newGuidelines,
      version: nextVersion,
      lastUpdated: new Date().toISOString(),
      updatedBy: `${currentUser.name} (${currentUser.role})`
    };
    const newHistoryItem: GuidelineVersionHistory = {
      version: nextVersion, editor: currentUser.name, timestamp: new Date().toISOString(),
      summary: changeSummary || 'Updated brand guidelines and approved knowledge.', changesCount: 1
    };
    workspaceStorage.saveGuidelines(updatedGuidelines);
    workspaceStorage.saveGuidelineVersions([newHistoryItem, ...workspaceStorage.getGuidelineVersions()]);
    refreshData();
  };

  const restoreGuidelineVersion = (version: string) => {
    const historyItem = guidelineVersions.find(item => item.version === version);
    if (!historyItem) return;
    const currentVerNum = parseInt(guidelines.version.replace('v', ''), 10) || 0;
    const nextVersion = `v${currentVerNum + 1}`;
    const updated: BrandGuidelines = {
      ...guidelines, version: nextVersion, lastUpdated: new Date().toISOString(),
      updatedBy: `${currentUser.name} (restored from ${version})`
    };
    const historyEntry: GuidelineVersionHistory = {
      version: nextVersion, editor: currentUser.name, timestamp: new Date().toISOString(),
      summary: `Restored rules and facts from ${version}.`, changesCount: 1
    };
    workspaceStorage.saveGuidelines(updated);
    workspaceStorage.saveGuidelineVersions([historyEntry, ...guidelineVersions]);
    refreshData();
  };

  const startCleanWorkspace = (organizationName: string, brandName: string) => {
    workspaceStorage.startCleanWorkspace(organizationName, brandName);
    refreshData();
  };

  return (
    <WorkspaceContext.Provider value={{
      workspace, guidelines, guidelineVersions, posts, comments, channels, teamMembers,
      isCleanWorkspace: workspaceStorage.isCleanWorkspace(), createPost, updatePost, submitPostForApproval,
      approvePost, requestChanges, publishPost, updateFindingStatus, replyToComment, moderateComment,
      syncSocialComments, saveGuidelines, restoreGuidelineVersion,
      startCleanWorkspace, refreshData
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};

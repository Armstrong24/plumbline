export type UserRole =
  | 'admin'
  | 'manager'
  | 'approver'
  | 'employee'
  | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workspaceId: string;
  avatar?: string;
  employeeId?: string;
  dateOfBirth?: string;
  department?: string;
  createdAt: string;
  lastLogin: string;
}

export interface Workspace {
  id: string;
  name: string;
  organization: string;
  type: 'manager_workspace' | 'independent';
  ownerId: string;
  memberCount: number;
}

export type Platform =
  | 'linkedin'
  | 'instagram'
  | 'x'
  | 'facebook'
  | 'threads'
  | 'youtube';

export interface BrandVoice {
  tones: string[];
  customToneDescription: string;
  examplePositive: string;
  exampleNegative: string;
  platformRules: Record<Platform, string>;
}

export interface TerminologyRule {
  id: string;
  context: string;
  preferredTerm: string;
  bannedTerm: string;
  explanation: string;
  platforms: Platform[] | ['all'];
}

export interface ApprovedFact {
  id: string;
  fact: string;
  source: string;
  category: string;
  approvalStatus: 'approved' | 'outdated' | 'pending';
  approvalOwner: string;
  version: string;
  lastUpdated: string;
  validUntil?: string;
}

export interface BrandAsset {
  id: string;
  name: string;
  type: 'logo' | 'template' | 'graphic';
  variant: 'primary' | 'monochrome' | 'light' | 'dark';
  url: string;
  size: string;
  updatedAt: string;
}

export interface GuidelineVersionHistory {
  version: string;
  editor: string;
  timestamp: string;
  summary: string;
  changesCount: number;
}

export interface BrandGuidelines {
  id: string;
  version: string;
  lastUpdated: string;
  updatedBy: string;
  voice: BrandVoice;
  terminology: TerminologyRule[];
  facts: ApprovedFact[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  assets: BrandAsset[];
  rulebookDocuments: {
    id: string;
    filename: string;
    size: string;
    uploadedAt: string;
  }[];
}

export type FindingSeverity = 'critical' | 'warning' | 'suggestion';

export type FindingStatus =
  | 'open'
  | 'accepted'
  | 'rejected'
  | 'contested'
  | 'fixed'
  | 'resolved';

export type FindingCategory =
  | 'unsupported_claim'
  | 'outdated_info'
  | 'tone_mismatch'
  | 'terminology'
  | 'incorrect_messaging'
  | 'visual_mismatch'
  | 'wrong_logo'
  | 'incorrect_colours'
  | 'accessibility'
  | 'alt_text_missing';

export interface AuditFinding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  issueTitle: string;
  description: string;
  affectedContent: string;
  sourceReference: string;
  guidelineVersion: string;
  suggestedCorrection: string;
  confidence: number;
  status: FindingStatus;
  userAction?: 'accepted' | 'rejected' | 'contested';
  contestedReason?: string;
}

export interface BrandRiskScore {
  overallScore: number; // 0 - 100
  riskCategory: 'low' | 'medium' | 'high';
  breakdown: {
    unsupportedClaims: number;
    visualAssets: number;
    messagingViolations: number;
    terminology: number;
    accessibility: number;
    toneInconsistencies: number;
  };
  criticalCount: number;
  warningCount: number;
  suggestionCount: number;
}

export interface AISuggestionItem {
  id: string;
  original: string;
  suggestion: string;
  explanation: string;
  sourceRef: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface PostPlatformVariant {
  platform: Platform;
  title: string;
  description: string;
  targetTone: string;
  suggestions: AISuggestionItem[];
}

export type PostStatus =
  | 'draft'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'published';

export interface ReviewTrailItem {
  id: string;
  version: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  comment?: string;
  changesSummary?: string;
}

export interface Post {
  id: string;
  campaign: string;
  title: string;
  originalDescription: string;
  creatorId: string;
  creatorName: string;
  creatorRole: string;
  platforms: Platform[];
  mediaUrls: string[];
  mediaType: 'image' | 'video';
  platformVariants: Partial<Record<Platform, PostPlatformVariant>>;
  status: PostStatus;
  brandRiskScore: BrandRiskScore;
  findings: AuditFinding[];
  reviewTrail: ReviewTrailItem[];
  version: string;
  assignedReviewer?: string;
  dispatches?: PostPublicationDispatch[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  id: string;
  platform: Platform;
  sourceAccountId?: string;
  authorName: string;
  authorAvatar: string;
  authorHandle: string;
  text: string;
  timeReceived: string;
  likes: number;
  replyCount: number;
  status: 'new' | 'needs_reply' | 'flagged' | 'replied';
  suggestedReply: string;
  suggestedReplySource: string;
  replyDraft?: string;
  moderationReason?: string;
}

export interface PostPublicationDispatch {
  platform: Platform;
  status: 'published' | 'queued' | 'failed';
  timestamp: string;
  targetAccount: string;
  dispatchId: string;
  liveUrl?: string;
}

export interface GroqConfig {
  apiKey: string;
  model: string;
  isActive: boolean;
}

export interface ChannelConnection {
  id: string;
  platform: Platform;
  accountId?: string;
  name: string;
  status:
    | 'connected'
    | 'not_connected'
    | 'expired'
    | 'permission_required'
    | 'extension_required';
  accountName: string;
  accountHandle: string;
  lastSync: string;
  capabilities: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'active' | 'pending' | 'deactivated';
  draftCount: number;
  pendingSubmissions: number;
  lastActive: string;
}

export interface GrowthMetrics {
  reach: number;
  engagementRate: number;
  followerGrowth: number;
  bestPostTitle: string;
  bestPostPlatform: Platform;
  bestPostReach: number;
  bestPostEngagement: number;
}

export interface GovernanceMetrics {
  draftsChecked: number;
  issuesFixedBeforeReview: number;
  avgApprovalTimeHours: number;
  contestedFlags: number;
  repeatViolations: number;
  mostViolatedRules: { rule: string; count: number }[];
  errorRateByTeam: { team: string; rate: number }[];
  ambiguousRule: {
    ruleTitle: string;
    timesContested: number;
    description: string;
  };
}

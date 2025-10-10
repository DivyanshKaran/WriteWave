// Community Types - Forum, Study Groups, Social, and Community-related types

// Study Group Types
export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  maxMembers: number;
  currentMembers: number;
  isPublic: boolean;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  joined?: boolean;
}

export interface StudyGroupMembership {
  groupId: string;
  groupName: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
  active: boolean;
}

// Discussion Types
export interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  category: string;
  tags: string[];
  replies: number;
  views: number;
  likes: number;
  liked: boolean;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionCreateRequest {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

// Post Types
export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  discussionId: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  liked: boolean;
  replies: number;
}

export interface PostCreateRequest {
  content: string;
  discussionId: string;
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  postId: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  liked: boolean;
}

export interface CommentCreateRequest {
  content: string;
  postId: string;
}

// User Connection Types
export interface UserConnection {
  userId: string;
  username: string;
  avatar?: string;
  status: 'pending' | 'accepted' | 'blocked';
  connectedAt?: string;
}

// Community Store State
export interface CommunityState {
  // Discussions
  discussions: Discussion[];
  currentDiscussion: Discussion | null;
  discussionPosts: Record<string, Post[]>;
  postComments: Record<string, Comment[]>;
  
  // Study Groups
  studyGroups: StudyGroup[];
  userStudyGroups: StudyGroupMembership[];
  currentStudyGroup: StudyGroup | null;
  
  // Social
  connections: UserConnection[];
  pendingConnections: UserConnection[];
  
  // Filters and search
  selectedCategory: string;
  searchQuery: string;
  sortBy: 'recent' | 'popular' | 'trending';
  
  // Loading states
  isLoading: boolean;
  isPosting: boolean;
  isJoining: boolean;
  
  // Actions
  loadDiscussions: (filters?: { category?: string; limit?: number; offset?: number }) => Promise<void>;
  loadDiscussion: (id: string) => Promise<void>;
  createDiscussion: (data: DiscussionCreateRequest) => Promise<void>;
  loadPosts: (discussionId: string) => Promise<void>;
  createPost: (data: PostCreateRequest) => Promise<void>;
  loadComments: (postId: string) => Promise<void>;
  createComment: (data: CommentCreateRequest) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  
  // Study Group actions
  loadStudyGroups: (filters?: { category?: string; difficulty?: string }) => Promise<void>;
  joinStudyGroup: (groupId: string) => Promise<void>;
  leaveStudyGroup: (groupId: string) => Promise<void>;
  createStudyGroup: (data: StudyGroupCreateRequest) => Promise<void>;
  
  // Social actions
  loadConnections: () => Promise<void>;
  sendConnectionRequest: (userId: string) => Promise<void>;
  acceptConnection: (userId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  
  // Filter actions
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'recent' | 'popular' | 'trending') => void;
}

// Study Group Create Request
export interface StudyGroupCreateRequest {
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  maxMembers: number;
  isPublic: boolean;
}

// Community Categories
export interface CommunityCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  discussionCount: number;
  memberCount: number;
}

// Community Moderation
export interface ModerationAction {
  id: string;
  type: 'warning' | 'mute' | 'ban' | 'delete';
  targetType: 'discussion' | 'post' | 'comment' | 'user';
  targetId: string;
  reason: string;
  moderator: {
    id: string;
    name: string;
  };
  createdAt: string;
  expiresAt?: string;
  active: boolean;
}

// Community Analytics
export interface CommunityAnalytics {
  userId: string;
  period: string;
  metrics: {
    discussionsCreated: number;
    postsCreated: number;
    commentsCreated: number;
    likesReceived: number;
    likesGiven: number;
    studyGroupsJoined: number;
    connectionsMade: number;
  };
  engagement: {
    averagePostsPerDay: number;
    averageCommentsPerDay: number;
    responseRate: number;
    communityRank: number;
  };
  insights: string[];
}

// Community Notification
export interface CommunityNotification {
  id: string;
  type: 'discussion_reply' | 'post_like' | 'comment_like' | 'study_group_invite' | 'connection_request';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data: {
    discussionId?: string;
    postId?: string;
    commentId?: string;
    studyGroupId?: string;
    userId?: string;
  };
}

// Community Leaderboard
export interface CommunityLeaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: Array<{
    userId: string;
    username: string;
    avatar?: string;
    score: number;
    rank: number;
    metrics: {
      discussions: number;
      posts: number;
      comments: number;
      likes: number;
    };
  }>;
  userRank?: number;
  totalUsers: number;
}

// Community Report
export interface CommunityReport {
  id: string;
  type: 'spam' | 'harassment' | 'inappropriate_content' | 'other';
  targetType: 'discussion' | 'post' | 'comment' | 'user';
  targetId: string;
  reason: string;
  description: string;
  reporter: {
    id: string;
    name: string;
  };
  createdAt: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  moderator?: {
    id: string;
    name: string;
  };
  resolution?: string;
  resolvedAt?: string;
}

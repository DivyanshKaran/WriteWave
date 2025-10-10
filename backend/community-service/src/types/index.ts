// Core Types and Interfaces for Community Service

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// User Types
export interface User {
  id: string;
  externalUserId: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  reputation: number;
  isModerator: boolean;
  isBanned: boolean;
  banReason?: string;
  banExpiresAt?: Date;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  externalUserId: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  avatar?: string;
  bio?: string;
}

// Forum Types
export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  postCount?: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  categoryId: string;
  authorId: string;
  isPinned: boolean;
  isLocked: boolean;
  isDeleted: boolean;
  viewCount: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
  category?: ForumCategory;
  author?: User;
  comments?: Comment[];
  userVote?: VoteType;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  categoryId: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  categoryId?: string;
  isPinned?: boolean;
  isLocked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
  isDeleted: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
  replies?: Comment[];
  userVote?: VoteType;
}

export interface CreateCommentRequest {
  content: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export enum VoteType {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE'
}

// Study Group Types
export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  slug: string;
  ownerId: string;
  isPublic: boolean;
  maxMembers: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner?: User;
  members?: StudyGroupMember[];
  memberCount?: number;
  userRole?: GroupRole;
}

export interface StudyGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  isActive: boolean;
  user?: User;
}

export interface CreateStudyGroupRequest {
  name: string;
  description?: string;
  isPublic: boolean;
  maxMembers?: number;
}

export interface UpdateStudyGroupRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  maxMembers?: number;
}

export interface StudyGroupChallenge {
  id: string;
  groupId: string;
  title: string;
  description: string;
  type: ChallengeType;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
  type: ChallengeType;
  startDate: Date;
  endDate: Date;
}

export enum GroupRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER'
}

export enum ChallengeType {
  DAILY_STREAK = 'DAILY_STREAK',
  WEEKLY_GOAL = 'WEEKLY_GOAL',
  MONTHLY_CHALLENGE = 'MONTHLY_CHALLENGE',
  CUSTOM = 'CUSTOM'
}

// Social Features Types
export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  sender?: User;
  receiver?: User;
}

export interface CreateFriendRequestRequest {
  receiverId: string;
  message?: string;
}

export interface UpdateFriendRequestRequest {
  status: FriendRequestStatus;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  createdAt: Date;
  user?: User;
  friend?: User;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower?: User;
  following?: User;
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: any;
  groupId?: string;
  createdAt: Date;
  user?: User;
  group?: StudyGroup;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementType: AchievementType;
  title: string;
  description: string;
  icon?: string;
  points: number;
  unlockedAt: Date;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  message?: string;
  status: MentorshipStatus;
  createdAt: Date;
  updatedAt: Date;
  mentor?: User;
  mentee?: User;
}

export interface CreateMentorshipRequestRequest {
  mentorId: string;
  message?: string;
}

export enum FriendRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED'
}

export enum ActivityType {
  POST_CREATED = 'POST_CREATED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  FRIEND_ADDED = 'FRIEND_ADDED',
  GROUP_JOINED = 'GROUP_JOINED',
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED',
  MILESTONE_REACHED = 'MILESTONE_REACHED'
}

export enum AchievementType {
  FIRST_POST = 'FIRST_POST',
  HELPFUL_MEMBER = 'HELPFUL_MEMBER',
  ACTIVE_PARTICIPANT = 'ACTIVE_PARTICIPANT',
  STUDY_GROUP_LEADER = 'STUDY_GROUP_LEADER',
  MENTOR = 'MENTOR',
  STREAK_MASTER = 'STREAK_MASTER',
  KNOWLEDGE_SHARER = 'KNOWLEDGE_SHARER',
  COMMUNITY_BUILDER = 'COMMUNITY_BUILDER'
}

export enum MentorshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  userId: string;
  type: LeaderboardType;
  score: number;
  rank?: number;
  period?: string;
  category?: string;
  updatedAt: Date;
  user?: User;
}

export interface LeaderboardQuery {
  type: LeaderboardType;
  period?: string;
  category?: string;
  limit?: number;
}

export enum LeaderboardType {
  REPUTATION = 'REPUTATION',
  POSTS_COUNT = 'POSTS_COUNT',
  COMMENTS_COUNT = 'COMMENTS_COUNT',
  STUDY_STREAK = 'STUDY_STREAK',
  CHARACTERS_LEARNED = 'CHARACTERS_LEARNED',
  GROUPS_JOINED = 'GROUPS_JOINED',
  ACHIEVEMENTS_COUNT = 'ACHIEVEMENTS_COUNT'
}

// Moderation Types
export interface Report {
  id: string;
  reporterId: string;
  reportedId?: string;
  postId?: string;
  commentId?: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  moderatorId?: string;
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  reporter?: User;
  reported?: User;
  post?: Post;
  comment?: Comment;
}

export interface CreateReportRequest {
  reportedId?: string;
  postId?: string;
  commentId?: string;
  reason: ReportReason;
  description?: string;
}

export interface UpdateReportRequest {
  status: ReportStatus;
  moderatorNotes?: string;
}

export enum ReportReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  HATE_SPEECH = 'HATE_SPEECH',
  COPYRIGHT_VIOLATION = 'COPYRIGHT_VIOLATION',
  OTHER = 'OTHER'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED'
}

// Search Types
export interface SearchQuery {
  q: string;
  type?: 'posts' | 'comments' | 'users' | 'groups';
  category?: string;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  posts?: Post[];
  comments?: Comment[];
  users?: User[];
  groups?: StudyGroup[];
  total: number;
  pagination: PaginationMeta;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
  userId?: string;
}

export interface NotificationData {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

// Cache Types
export interface CacheConfig {
  ttl: number;
  key: string;
  tags?: string[];
}

export interface LeaderboardCache {
  type: LeaderboardType;
  period?: string;
  category?: string;
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// JWT Types
export interface JWTPayload {
  userId: string;
  externalUserId: string;
  username: string;
  email: string;
  isModerator: boolean;
  iat?: number;
  exp?: number;
}

// File Upload Types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export interface UploadConfig {
  maxSize: number;
  allowedTypes: string[];
  destination: string;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Content Moderation Types
export interface ModerationResult {
  isApproved: boolean;
  confidence: number;
  reasons: string[];
  suggestions?: string[];
}

export interface ContentFilter {
  type: 'spam' | 'inappropriate' | 'hate_speech' | 'harassment';
  confidence: number;
  detected: boolean;
  details?: any;
}

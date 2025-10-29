// Core Types and Interfaces for Community Service
import { 
  VoteType as PrismaVoteType,
  GroupRole as PrismaGroupRole,
  ChallengeType as PrismaChallengeType,
  FriendRequestStatus as PrismaFriendRequestStatus,
  ReportReason as PrismaReportReason,
  ReportStatus as PrismaReportStatus,
  ActivityType as PrismaActivityType,
  AchievementType as PrismaAchievementType,
  LeaderboardType as PrismaLeaderboardType,
  MentorshipStatus as PrismaMentorshipStatus
} from '@prisma/client';

// Re-export Prisma enums as both types and values
export const VoteType = PrismaVoteType;
export const GroupRole = PrismaGroupRole;
export const ChallengeType = PrismaChallengeType;
export const FriendRequestStatus = PrismaFriendRequestStatus;
export const ReportReason = PrismaReportReason;
export const ReportStatus = PrismaReportStatus;
export const ActivityType = PrismaActivityType;
export const AchievementType = PrismaAchievementType;
export const LeaderboardType = PrismaLeaderboardType;
export const MentorshipStatus = PrismaMentorshipStatus;

export type VoteType = PrismaVoteType;
export type GroupRole = PrismaGroupRole;
export type ChallengeType = PrismaChallengeType;
export type FriendRequestStatus = PrismaFriendRequestStatus;
export type ReportReason = PrismaReportReason;
export type ReportStatus = PrismaReportStatus;
export type ActivityType = PrismaActivityType;
export type AchievementType = PrismaAchievementType;
export type LeaderboardType = PrismaLeaderboardType;
export type MentorshipStatus = PrismaMentorshipStatus;

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
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  reputation: number;
  isModerator: boolean;
  isBanned: boolean;
  banReason: string | null;
  banExpiresAt: Date | null;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Simplified user profile for Prisma queries that don't include all fields
export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatar?: string | null;
  reputation?: number;
  lastActiveAt?: Date;
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
  description: string | null;
  slug: string;
  icon: string | null;
  color: string | null;
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
  author?: UserProfile;
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
  parentId: string | null;
  isDeleted: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
  author?: UserProfile;
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

// Study Group Types
export interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  ownerId: string;
  isPublic: boolean;
  maxMembers: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  owner?: UserProfile;
  members?: StudyGroupMember[];
  memberCount?: number;
  userRole?: GroupRole;
}

export interface StudyGroupMember {
  id: string;
  groupId?: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  isActive?: boolean;
  user?: UserProfile;
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

// Social Features Types
export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
  sender?: UserProfile;
  receiver?: UserProfile;
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
  user?: UserProfile;
  friend?: UserProfile;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower?: UserProfile;
  following?: UserProfile;
}

// Simplified study group for Prisma queries that don't include all fields
export interface StudyGroupProfile {
  id: string;
  name: string;
  slug: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description: string | null;
  metadata?: any;
  groupId: string | null;
  createdAt: Date;
  user?: UserProfile;
  group?: StudyGroupProfile | null;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementType: AchievementType;
  title: string;
  description: string;
  icon: string | null;
  points: number;
  unlockedAt: Date;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  message: string | null;
  status: MentorshipStatus;
  createdAt: Date;
  updatedAt: Date;
  mentor?: UserProfile;
  mentee?: UserProfile;
}

export interface CreateMentorshipRequestRequest {
  mentorId: string;
  message?: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  id: string;
  userId: string;
  type: LeaderboardType;
  score: number;
  rank: number | null;
  period: string | null;
  category: string | null;
  updatedAt: Date;
  user?: UserProfile;
}

export interface LeaderboardQuery {
  type: LeaderboardType;
  period?: string;
  category?: string;
  limit?: number;
}

// Moderation Types
// Simplified post for Prisma queries that don't include all fields
export interface PostProfile {
  id: string;
  slug: string;
  title: string;
  content?: string;
  author?: UserProfile;
}

// Simplified comment for Prisma queries that don't include all fields
export interface CommentProfile {
  id: string;
  content: string;
  author?: UserProfile;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string | null;
  postId: string | null;
  commentId: string | null;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  moderatorId: string | null;
  moderatorNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  reporter?: UserProfile;
  reported?: UserProfile | null;
  post?: PostProfile | null;
  comment?: CommentProfile | null;
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

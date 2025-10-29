export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  contentHtml?: string;
  published: boolean;
  featured: boolean;
  trending: boolean;
  views: number;
  likes: number;
  comments: number;
  readTime: number;
  authorId: string;
  authorName: string;
  authorUsername: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  tags: ArticleTag[];
}

export interface ArticleTag {
  id: string;
  articleId: string;
  tag: string;
}

export interface ArticleComment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  content: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  replies?: ArticleComment[];
}

export interface ArticleLike {
  id: string;
  articleId: string;
  userId: string;
  createdAt: Date;
}

export interface ArticleBookmark {
  id: string;
  articleId: string;
  userId: string;
  createdAt: Date;
}

export interface ArticleView {
  id: string;
  articleId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface TagStats {
  id: string;
  tag: string;
  count: number;
  views: number;
  likes: number;
  updatedAt: Date;
}

// Request/Response DTOs
export interface CreateArticleRequest {
  title: string;
  excerpt?: string;
  content: string;
  tags: string[];
  published?: boolean;
}

export interface UpdateArticleRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  tags?: string[];
  published?: boolean;
  featured?: boolean;
  trending?: boolean;
}

export interface ArticleResponse {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  contentHtml?: string;
  published: boolean;
  featured: boolean;
  trending: boolean;
  views: number;
  likes: number;
  comments: number;
  readTime: number;
  author: {
    id: string;
    name: string;
    username: string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface ArticleListResponse {
  articles: ArticleResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ArticleQuery {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  author?: string;
  featured?: boolean;
  trending?: boolean;
  published?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CommentRequest {
  content: string;
  parentId?: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
  };
  parentId?: string;
  replies?: CommentResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TagResponse {
  tag: string;
  count: number;
  views: number;
  likes: number;
}

export interface ArticleStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageReadTime: number;
  topTags: TagResponse[];
  recentArticles: ArticleResponse[];
}

export interface UserArticleStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageReadTime: number;
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: ValidationError[];
  };
}

// Success response type
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

// Pagination
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import slugify from 'slugify';

// Configure marked for better security
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Configure DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

export const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const renderMarkdown = (content: string): string => {
  const html = marked(content);
  return purify.sanitize(html);
};

export const extractExcerpt = (content: string, maxLength: number = 160): string => {
  // Remove markdown syntax and HTML tags
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
};

export const validateTags = (tags: string[]): string[] => {
  return tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length <= 50)
    .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
    .slice(0, 10); // Limit to 10 tags
};

export const generateArticleSlug = async (title: string, existingSlugs: string[] = []): Promise<string> => {
  let baseSlug = createSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

export const formatArticleResponse = (article: any, userId?: string): any => {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    contentHtml: article.contentHtml,
    published: article.published,
    featured: article.featured,
    trending: article.trending,
    views: article.views,
    likes: article.likes,
    comments: article.comments,
    readTime: article.readTime,
    author: {
      id: article.authorId,
      name: article.authorName,
      username: article.authorUsername,
    },
    tags: article.tags?.map((tag: any) => tag.tag) || [],
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    publishedAt: article.publishedAt,
    isLiked: article.likes?.some((like: any) => like.userId === userId) || false,
    isBookmarked: article.bookmarks?.some((bookmark: any) => bookmark.userId === userId) || false,
  };
};

export const formatCommentResponse = (comment: any): any => {
  return {
    id: comment.id,
    content: comment.content,
    author: {
      id: comment.userId,
      name: comment.userName,
      username: comment.userName.toLowerCase().replace(/\s+/g, '_'),
    },
    parentId: comment.parentId,
    replies: comment.replies?.map(formatCommentResponse) || [],
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
};

export const paginate = (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

export const createPaginationMeta = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const isValidObjectId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0;
};

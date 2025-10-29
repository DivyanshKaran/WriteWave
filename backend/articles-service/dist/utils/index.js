"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidObjectId = exports.sanitizeInput = exports.createPaginationMeta = exports.paginate = exports.formatCommentResponse = exports.formatArticleResponse = exports.generateArticleSlug = exports.validateTags = exports.extractExcerpt = exports.renderMarkdown = exports.calculateReadTime = exports.createSlug = exports.AppError = void 0;
const marked_1 = require("marked");
const jsdom_1 = require("jsdom");
const dompurify_1 = __importDefault(require("dompurify"));
const slugify_1 = __importDefault(require("slugify"));
marked_1.marked.setOptions({
    breaks: true,
    gfm: true,
});
const window = new jsdom_1.JSDOM('').window;
const purify = (0, dompurify_1.default)(window);
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const createSlug = (title) => {
    return (0, slugify_1.default)(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
    });
};
exports.createSlug = createSlug;
const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};
exports.calculateReadTime = calculateReadTime;
const renderMarkdown = (content) => {
    const html = (0, marked_1.marked)(content);
    return purify.sanitize(html);
};
exports.renderMarkdown = renderMarkdown;
const extractExcerpt = (content, maxLength = 160) => {
    const plainText = content
        .replace(/#{1,6}\s+/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<[^>]*>/g, '')
        .replace(/\n+/g, ' ')
        .trim();
    if (plainText.length <= maxLength) {
        return plainText;
    }
    return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
};
exports.extractExcerpt = extractExcerpt;
const validateTags = (tags) => {
    return tags
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0 && tag.length <= 50)
        .filter((tag, index, arr) => arr.indexOf(tag) === index)
        .slice(0, 10);
};
exports.validateTags = validateTags;
const generateArticleSlug = async (title, existingSlugs = []) => {
    let baseSlug = (0, exports.createSlug)(title);
    let slug = baseSlug;
    let counter = 1;
    while (existingSlugs.includes(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
};
exports.generateArticleSlug = generateArticleSlug;
const formatArticleResponse = (article, userId) => {
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
        tags: article.tags?.map((tag) => tag.tag) || [],
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        publishedAt: article.publishedAt,
        isLiked: article.likes?.some((like) => like.userId === userId) || false,
        isBookmarked: article.bookmarks?.some((bookmark) => bookmark.userId === userId) || false,
    };
};
exports.formatArticleResponse = formatArticleResponse;
const formatCommentResponse = (comment) => {
    return {
        id: comment.id,
        content: comment.content,
        author: {
            id: comment.userId,
            name: comment.userName,
            username: comment.userName.toLowerCase().replace(/\s+/g, '_'),
        },
        parentId: comment.parentId,
        replies: comment.replies?.map(exports.formatCommentResponse) || [],
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
    };
};
exports.formatCommentResponse = formatCommentResponse;
const paginate = (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return { offset, limit };
};
exports.paginate = paginate;
const createPaginationMeta = (page, limit, total) => {
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
exports.createPaginationMeta = createPaginationMeta;
const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
};
exports.sanitizeInput = sanitizeInput;
const isValidObjectId = (id) => {
    return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0;
};
exports.isValidObjectId = isValidObjectId;
//# sourceMappingURL=index.js.map
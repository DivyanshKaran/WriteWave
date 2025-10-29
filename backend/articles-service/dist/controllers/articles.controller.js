"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.getUserArticleStats = exports.getArticleStats = exports.getPopularTags = exports.getUserArticles = exports.getFeaturedArticles = exports.getTrendingArticles = exports.getComments = exports.addComment = exports.toggleBookmark = exports.toggleLike = exports.deleteArticle = exports.updateArticle = exports.getArticleById = exports.getArticles = exports.createArticle = void 0;
const articles_service_1 = require("../services/articles.service");
const utils_1 = require("../utils");
const joi_1 = __importDefault(require("joi"));
const articlesService = new articles_service_1.ArticlesService();
const createArticleSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).max(200).required(),
    excerpt: joi_1.default.string().max(500).optional(),
    content: joi_1.default.string().min(1).max(50000).required(),
    tags: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
    published: joi_1.default.boolean().optional()
});
const updateArticleSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).max(200).optional(),
    excerpt: joi_1.default.string().max(500).optional(),
    content: joi_1.default.string().min(1).max(50000).optional(),
    tags: joi_1.default.array().items(joi_1.default.string().max(50)).max(10).optional(),
    published: joi_1.default.boolean().optional(),
    featured: joi_1.default.boolean().optional(),
    trending: joi_1.default.boolean().optional()
});
const commentSchema = joi_1.default.object({
    content: joi_1.default.string().min(1).max(1000).required(),
    parentId: joi_1.default.string().optional()
});
const querySchema = joi_1.default.object({
    page: joi_1.default.number().min(1).default(1),
    limit: joi_1.default.number().min(1).max(100).default(10),
    search: joi_1.default.string().max(100).optional(),
    tags: joi_1.default.array().items(joi_1.default.string()).optional(),
    author: joi_1.default.string().max(100).optional(),
    featured: joi_1.default.boolean().optional(),
    trending: joi_1.default.boolean().optional(),
    published: joi_1.default.boolean().default(true),
    sortBy: joi_1.default.string().valid('createdAt', 'updatedAt', 'views', 'likes', 'publishedAt').default('createdAt'),
    sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc')
});
const createArticle = async (req, res, next) => {
    try {
        const { error, value } = createArticleSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    details: error.details.map(d => ({
                        field: d.path.join('.'),
                        message: d.message
                    }))
                }
            });
            return;
        }
        const data = value;
        const user = req.user;
        const article = await articlesService.createArticle(data, user.id, user.name, user.username);
        res.status(201).json({
            success: true,
            data: article,
            message: 'Article created successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createArticle = createArticle;
const getArticles = async (req, res, next) => {
    try {
        const { error, value } = querySchema.validate(req.query);
        if (error) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    details: error.details.map(d => ({
                        field: d.path.join('.'),
                        message: d.message
                    }))
                }
            });
            return;
        }
        const query = value;
        const user = req.user;
        const result = await articlesService.getArticles(query, user?.id);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getArticles = getArticles;
const getArticleById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const article = await articlesService.getArticleById(id, user?.id);
        res.json({
            success: true,
            data: article
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getArticleById = getArticleById;
const updateArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error, value } = updateArticleSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    details: error.details.map(d => ({
                        field: d.path.join('.'),
                        message: d.message
                    }))
                }
            });
            return;
        }
        const data = value;
        const user = req.user;
        const article = await articlesService.updateArticle(id, data, user.id);
        res.json({
            success: true,
            data: article,
            message: 'Article updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateArticle = updateArticle;
const deleteArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        await articlesService.deleteArticle(id, user.id);
        res.json({
            success: true,
            message: 'Article deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteArticle = deleteArticle;
const toggleLike = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const result = await articlesService.toggleLike(id, user.id);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleLike = toggleLike;
const toggleBookmark = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const result = await articlesService.toggleBookmark(id, user.id);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleBookmark = toggleBookmark;
const addComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error, value } = commentSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    details: error.details.map(d => ({
                        field: d.path.join('.'),
                        message: d.message
                    }))
                }
            });
            return;
        }
        const data = value;
        const user = req.user;
        const comment = await articlesService.addComment(id, data, user.id, user.name);
        res.status(201).json({
            success: true,
            data: comment,
            message: 'Comment added successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addComment = addComment;
const getComments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 10;
        const result = await articlesService.getComments(id, page, limit);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getComments = getComments;
const getTrendingArticles = async (req, res, next) => {
    try {
        const limit = parseInt(req.query['limit']) || 10;
        const articles = await articlesService.getTrendingArticles(limit);
        res.json({
            success: true,
            data: articles
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTrendingArticles = getTrendingArticles;
const getFeaturedArticles = async (req, res, next) => {
    try {
        const limit = parseInt(req.query['limit']) || 10;
        const articles = await articlesService.getFeaturedArticles(limit);
        res.json({
            success: true,
            data: articles
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFeaturedArticles = getFeaturedArticles;
const getUserArticles = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const published = req.query['published'] === 'true' ? true :
            req.query['published'] === 'false' ? false : undefined;
        const articles = await articlesService.getUserArticles(userId, published);
        res.json({
            success: true,
            data: articles
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserArticles = getUserArticles;
const getPopularTags = async (req, res, next) => {
    try {
        const limit = parseInt(req.query['limit']) || 20;
        const tags = await articlesService.getPopularTags(limit);
        res.json({
            success: true,
            data: tags
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPopularTags = getPopularTags;
const getArticleStats = async (_req, res, next) => {
    try {
        const stats = await articlesService.getArticleStats();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getArticleStats = getArticleStats;
const getUserArticleStats = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const stats = await articlesService.getUserArticleStats(userId);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserArticleStats = getUserArticleStats;
const errorHandler = (error, _req, res, _next) => {
    console.error('Articles Controller Error:', error);
    if (error instanceof utils_1.AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: {
                message: error.message,
                code: error.statusCode.toString()
            }
        });
        return;
    }
    if (error.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            error: {
                message: 'Validation error',
                details: error.details?.map((d) => ({
                    field: d.path?.join('.'),
                    message: d.message
                })) || []
            }
        });
        return;
    }
    if (error.code === 'P2002') {
        res.status(409).json({
            success: false,
            error: {
                message: 'Resource already exists',
                code: 'DUPLICATE_ENTRY'
            }
        });
        return;
    }
    if (error.code === 'P2025') {
        res.status(404).json({
            success: false,
            error: {
                message: 'Resource not found',
                code: 'NOT_FOUND'
            }
        });
        return;
    }
    res.status(500).json({
        success: false,
        error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR'
        }
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=articles.controller.js.map
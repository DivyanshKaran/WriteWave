"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesService = void 0;
const models_1 = require("../models");
const utils_1 = require("../utils");
const kafka_1 = require("../../../shared/utils/kafka");
class ArticlesService {
    async createArticle(data, userId, userName, userUsername) {
        try {
            const { title, excerpt, content, tags, published = false } = data;
            const sanitizedTitle = (0, utils_1.sanitizeInput)(title);
            const sanitizedExcerpt = excerpt ? (0, utils_1.sanitizeInput)(excerpt) : (0, utils_1.extractExcerpt)(content);
            const sanitizedContent = (0, utils_1.sanitizeInput)(content);
            const validatedTags = (0, utils_1.validateTags)(tags);
            const existingSlugs = await models_1.prisma.article.findMany({
                select: { slug: true }
            }).then(articles => articles.map(a => a.slug));
            const slug = await (0, utils_1.generateArticleSlug)(sanitizedTitle, existingSlugs);
            const readTime = (0, utils_1.calculateReadTime)(sanitizedContent);
            const contentHtml = (0, utils_1.renderMarkdown)(sanitizedContent);
            const article = await models_1.prisma.article.create({
                data: {
                    title: sanitizedTitle,
                    slug,
                    excerpt: sanitizedExcerpt,
                    content: sanitizedContent,
                    contentHtml,
                    published,
                    readTime,
                    authorId: userId,
                    authorName: userName,
                    authorUsername: userUsername,
                    publishedAt: published ? new Date() : null,
                    tags: {
                        create: validatedTags.map(tag => ({ tag }))
                    }
                },
                include: {
                    tags: true,
                    likes: true,
                    bookmarks: true
                }
            });
            try {
                await (0, kafka_1.publish)(kafka_1.Topics.ARTICLES_EVENTS, article.id, {
                    type: 'article.created',
                    id: article.id,
                    articleId: article.id,
                    authorId: userId,
                    title: article.title,
                    tags: validatedTags,
                    published,
                    occurredAt: new Date().toISOString(),
                });
            }
            catch { }
            await this.updateTagStats(validatedTags);
            return (0, utils_1.formatArticleResponse)(article);
        }
        catch (error) {
            throw new utils_1.AppError('Failed to create article', 500);
        }
    }
    async getArticles(query, userId) {
        try {
            const { page = 1, limit = 10, search, tags, author, featured, trending, published = true, sortBy = 'createdAt', sortOrder = 'desc' } = query;
            const { offset } = (0, utils_1.paginate)(page, limit);
            const where = {
                published
            };
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { excerpt: { contains: search, mode: 'insensitive' } },
                    { content: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (tags && tags.length > 0) {
                where.tags = {
                    some: {
                        tag: { in: tags }
                    }
                };
            }
            if (author) {
                where.authorUsername = { contains: author, mode: 'insensitive' };
            }
            if (featured !== undefined) {
                where.featured = featured;
            }
            if (trending !== undefined) {
                where.trending = trending;
            }
            const orderBy = {};
            orderBy[sortBy] = sortOrder;
            const [articles, total] = await Promise.all([
                models_1.prisma.article.findMany({
                    where,
                    orderBy,
                    skip: offset,
                    take: limit,
                    include: {
                        tags: true,
                        likes: userId ? { where: { userId } } : false,
                        bookmarks: userId ? { where: { userId } } : false
                    }
                }),
                models_1.prisma.article.count({ where })
            ]);
            const formattedArticles = articles.map(article => (0, utils_1.formatArticleResponse)(article, userId));
            const paginationMeta = (0, utils_1.createPaginationMeta)(page, limit, total);
            return {
                articles: formattedArticles,
                ...paginationMeta
            };
        }
        catch (error) {
            throw new utils_1.AppError('Failed to fetch articles', 500);
        }
    }
    async getArticleById(idOrSlug, userId) {
        try {
            const article = await models_1.prisma.article.findFirst({
                where: {
                    OR: [
                        { id: idOrSlug },
                        { slug: idOrSlug }
                    ]
                },
                include: {
                    tags: true,
                    likes: userId ? { where: { userId } } : false,
                    bookmarks: userId ? { where: { userId } } : false
                }
            });
            if (!article) {
                throw new utils_1.AppError('Article not found', 404);
            }
            await this.incrementViewCount(article.id, userId);
            return (0, utils_1.formatArticleResponse)(article, userId);
        }
        catch (error) {
            if (error instanceof utils_1.AppError)
                throw error;
            throw new utils_1.AppError('Failed to fetch article', 500);
        }
    }
    async updateArticle(id, data, userId) {
        try {
            const article = await models_1.prisma.article.findUnique({
                where: { id },
                include: { tags: true }
            });
            if (!article) {
                throw new utils_1.AppError('Article not found', 404);
            }
            if (article.authorId !== userId) {
                throw new utils_1.AppError('Unauthorized to update this article', 403);
            }
            const updateData = {};
            if (data.title) {
                updateData.title = (0, utils_1.sanitizeInput)(data.title);
                updateData.slug = await (0, utils_1.generateArticleSlug)(updateData.title, await models_1.prisma.article.findMany({ where: { id: { not: id } } })
                    .then(articles => articles.map(a => a.slug)));
            }
            if (data.excerpt) {
                updateData.excerpt = (0, utils_1.sanitizeInput)(data.excerpt);
            }
            if (data.content) {
                updateData.content = (0, utils_1.sanitizeInput)(data.content);
                updateData.contentHtml = (0, utils_1.renderMarkdown)(updateData.content);
                updateData.readTime = (0, utils_1.calculateReadTime)(updateData.content);
                if (!data.excerpt) {
                    updateData.excerpt = (0, utils_1.extractExcerpt)(updateData.content);
                }
            }
            if (data.published !== undefined) {
                updateData.published = data.published;
                if (data.published && !article.publishedAt) {
                    updateData.publishedAt = new Date();
                }
            }
            if (data.featured !== undefined) {
                updateData.featured = data.featured;
            }
            if (data.trending !== undefined) {
                updateData.trending = data.trending;
            }
            if (data.tags) {
                const validatedTags = (0, utils_1.validateTags)(data.tags);
                await models_1.prisma.articleTag.deleteMany({
                    where: { articleId: id }
                });
                updateData.tags = {
                    create: validatedTags.map(tag => ({ tag }))
                };
                await this.updateTagStats(validatedTags);
            }
            const updatedArticle = await models_1.prisma.article.update({
                where: { id },
                data: updateData,
                include: {
                    tags: true,
                    likes: { where: { userId } },
                    bookmarks: { where: { userId } }
                }
            });
            try {
                await (0, kafka_1.publish)(kafka_1.Topics.ARTICLES_EVENTS, updatedArticle.id, {
                    type: 'article.updated',
                    id: updatedArticle.id,
                    changes: Object.keys(data),
                    occurredAt: new Date().toISOString(),
                });
            }
            catch { }
            return (0, utils_1.formatArticleResponse)(updatedArticle, userId);
        }
        catch (error) {
            if (error instanceof utils_1.AppError)
                throw error;
            throw new utils_1.AppError('Failed to update article', 500);
        }
    }
    async deleteArticle(id, userId) {
        try {
            const article = await models_1.prisma.article.findUnique({
                where: { id }
            });
            if (!article) {
                throw new utils_1.AppError('Article not found', 404);
            }
            if (article.authorId !== userId) {
                throw new utils_1.AppError('Unauthorized to delete this article', 403);
            }
            await models_1.prisma.article.delete({
                where: { id }
            });
        }
        catch (error) {
            if (error instanceof utils_1.AppError)
                throw error;
            throw new utils_1.AppError('Failed to delete article', 500);
        }
    }
    async toggleLike(articleId, userId) {
        try {
            if (!userId) {
                throw new utils_1.AppError('User ID is required', 400);
            }
            const existingLike = await models_1.prisma.articleLike.findUnique({
                where: {
                    articleId_userId: {
                        articleId,
                        userId
                    }
                }
            });
            if (existingLike) {
                await models_1.prisma.articleLike.delete({
                    where: { id: existingLike.id }
                });
                await models_1.prisma.article.update({
                    where: { id: articleId },
                    data: { likeCount: { decrement: 1 } }
                });
                try {
                    await (0, kafka_1.publish)(kafka_1.Topics.ARTICLES_EVENTS, articleId, { type: 'article.unliked', id: articleId, userId, occurredAt: new Date().toISOString() });
                }
                catch { }
                return { liked: false, likes: await this.getArticleLikes(articleId) };
            }
            else {
                await models_1.prisma.articleLike.create({
                    data: { articleId, userId }
                });
                await models_1.prisma.article.update({
                    where: { id: articleId },
                    data: { likeCount: { increment: 1 } }
                });
                const article = await models_1.prisma.article.findUnique({
                    where: { id: articleId },
                    select: { authorId: true }
                });
                try {
                    await (0, kafka_1.publish)(kafka_1.Topics.ARTICLES_EVENTS, articleId, { type: 'article.liked', id: articleId, articleId, userId, authorId: article?.authorId, occurredAt: new Date().toISOString() });
                }
                catch { }
                return { liked: true, likes: await this.getArticleLikes(articleId) };
            }
        }
        catch (error) {
            throw new utils_1.AppError('Failed to toggle like', 500);
        }
    }
    async toggleBookmark(articleId, userId) {
        try {
            if (!userId) {
                throw new utils_1.AppError('User ID is required', 400);
            }
            const existingBookmark = await models_1.prisma.articleBookmark.findUnique({
                where: {
                    articleId_userId: {
                        articleId,
                        userId
                    }
                }
            });
            if (existingBookmark) {
                await models_1.prisma.articleBookmark.delete({
                    where: { id: existingBookmark.id }
                });
                return { bookmarked: false };
            }
            else {
                await models_1.prisma.articleBookmark.create({
                    data: { articleId, userId }
                });
                return { bookmarked: true };
            }
        }
        catch (error) {
            throw new utils_1.AppError('Failed to toggle bookmark', 500);
        }
    }
    async addComment(articleId, data, userId, userName) {
        try {
            if (!userId) {
                throw new utils_1.AppError('User ID is required', 400);
            }
            if (!userName) {
                throw new utils_1.AppError('User name is required', 400);
            }
            const comment = await models_1.prisma.articleComment.create({
                data: {
                    articleId,
                    userId,
                    userName,
                    content: (0, utils_1.sanitizeInput)(data.content),
                    parentId: data.parentId || null
                },
                include: {
                    replies: true
                }
            });
            await models_1.prisma.article.update({
                where: { id: articleId },
                data: { commentCount: { increment: 1 } }
            });
            return (0, utils_1.formatCommentResponse)(comment);
        }
        catch (error) {
            throw new utils_1.AppError('Failed to add comment', 500);
        }
    }
    async getComments(articleId, page = 1, limit = 10) {
        try {
            const { offset } = (0, utils_1.paginate)(page, limit);
            const [comments, total] = await Promise.all([
                models_1.prisma.articleComment.findMany({
                    where: {
                        articleId,
                        parentId: null
                    },
                    orderBy: { createdAt: 'desc' },
                    skip: offset,
                    take: limit,
                    include: {
                        replies: {
                            orderBy: { createdAt: 'asc' }
                        }
                    }
                }),
                models_1.prisma.articleComment.count({
                    where: {
                        articleId,
                        parentId: null
                    }
                })
            ]);
            return {
                comments: comments.map(utils_1.formatCommentResponse),
                total
            };
        }
        catch (error) {
            throw new utils_1.AppError('Failed to fetch comments', 500);
        }
    }
    async getTrendingArticles(limit = 10) {
        try {
            const articles = await models_1.prisma.article.findMany({
                where: {
                    published: true,
                    trending: true
                },
                orderBy: [
                    { viewCount: 'desc' },
                    { likeCount: 'desc' },
                    { createdAt: 'desc' }
                ],
                take: limit,
                include: {
                    tags: true,
                    likes: false,
                    bookmarks: false
                }
            });
            return articles.map(article => (0, utils_1.formatArticleResponse)(article));
        }
        catch (error) {
            throw new utils_1.AppError('Failed to fetch trending articles', 500);
        }
    }
    async getFeaturedArticles(limit = 10) {
        try {
            const articles = await models_1.prisma.article.findMany({
                where: {
                    published: true,
                    featured: true
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                include: {
                    tags: true,
                    likes: false,
                    bookmarks: false
                }
            });
            return articles.map(article => (0, utils_1.formatArticleResponse)(article));
        }
        catch (error) {
            throw new utils_1.AppError('Failed to fetch featured articles', 500);
        }
    }
    async getUserArticles(userId, published) {
        try {
            if (!userId) {
                throw new utils_1.AppError('User ID is required', 400);
            }
            const where = { authorId: userId };
            if (published !== undefined) {
                where.published = published;
            }
            const articles = await models_1.prisma.article.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    tags: true,
                    likes: false,
                    bookmarks: false
                }
            });
            return articles.map(article => (0, utils_1.formatArticleResponse)(article));
        }
        catch (error) {
            throw new utils_1.AppError('Failed to fetch user articles', 500);
        }
    }
    async getPopularTags(limit = 20) {
        try {
            const tags = await models_1.prisma.tagStats.findMany({
                orderBy: [
                    { count: 'desc' },
                    { views: 'desc' }
                ],
                take: limit
            });
            return tags.map(tag => ({
                tag: tag.tag,
                count: tag.count,
                views: tag.views,
                likes: tag.likes
            }));
        }
        catch (error) {
            throw new utils_1.AppError('Failed to fetch popular tags', 500);
        }
    }
    async getArticleStats() {
        try {
            const [totalArticles, publishedArticles, draftArticles, totalViews, totalLikes, totalComments, averageReadTime, topTags, recentArticles] = await Promise.all([
                models_1.prisma.article.count(),
                models_1.prisma.article.count({ where: { published: true } }),
                models_1.prisma.article.count({ where: { published: false } }),
                models_1.prisma.article.aggregate({ _sum: { viewCount: true } }).then(r => r._sum.viewCount || 0),
                models_1.prisma.article.aggregate({ _sum: { likeCount: true } }).then(r => r._sum.likeCount || 0),
                models_1.prisma.article.aggregate({ _sum: { commentCount: true } }).then(r => r._sum.commentCount || 0),
                models_1.prisma.article.aggregate({ _avg: { readTime: true } }).then(r => Math.round(r._avg.readTime || 0)),
                this.getPopularTags(10),
                models_1.prisma.article.findMany({
                    where: { published: true },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: { tags: true }
                })
            ]);
            return {
                totalArticles,
                publishedArticles,
                draftArticles,
                totalViews,
                totalLikes,
                totalComments,
                averageReadTime,
                topTags,
                recentArticles: recentArticles.map(article => (0, utils_1.formatArticleResponse)(article))
            };
        }
        catch (error) {
            throw new utils_1.AppError('Failed to fetch article statistics', 500);
        }
    }
    async getUserArticleStats(userId) {
        try {
            if (!userId) {
                throw new utils_1.AppError('User ID is required', 400);
            }
            const [totalArticles, publishedArticles, draftArticles, totalViews, totalLikes, totalComments, averageReadTime] = await Promise.all([
                models_1.prisma.article.count({ where: { authorId: userId } }),
                models_1.prisma.article.count({ where: { authorId: userId, published: true } }),
                models_1.prisma.article.count({ where: { authorId: userId, published: false } }),
                models_1.prisma.article.aggregate({
                    where: { authorId: userId },
                    _sum: { viewCount: true }
                }).then(r => r._sum?.viewCount || 0),
                models_1.prisma.article.aggregate({
                    where: { authorId: userId },
                    _sum: { likeCount: true }
                }).then(r => r._sum?.likeCount || 0),
                models_1.prisma.article.aggregate({
                    where: { authorId: userId },
                    _sum: { commentCount: true }
                }).then(r => r._sum?.commentCount || 0),
                models_1.prisma.article.aggregate({
                    where: { authorId: userId },
                    _avg: { readTime: true }
                }).then(r => Math.round(r._avg?.readTime || 0))
            ]);
            return {
                totalArticles,
                publishedArticles,
                draftArticles,
                totalViews,
                totalLikes,
                totalComments,
                averageReadTime
            };
        }
        catch (error) {
            throw new utils_1.AppError('Failed to fetch user article statistics', 500);
        }
    }
    async incrementViewCount(articleId, userId) {
        try {
            await models_1.prisma.articleView.create({
                data: {
                    articleId,
                    userId: userId || null,
                    ipAddress: null,
                    userAgent: null
                }
            });
            await models_1.prisma.article.update({
                where: { id: articleId },
                data: { viewCount: { increment: 1 } }
            });
        }
        catch (error) {
            console.error('Failed to track view:', error);
        }
    }
    async getArticleLikes(articleId) {
        const article = await models_1.prisma.article.findUnique({
            where: { id: articleId },
            select: { likeCount: true }
        });
        return article?.likeCount || 0;
    }
    async updateTagStats(tags) {
        try {
            for (const tag of tags) {
                await models_1.prisma.tagStats.upsert({
                    where: { tag },
                    update: { count: { increment: 1 } },
                    create: { tag, count: 1 }
                });
            }
        }
        catch (error) {
            console.error('Failed to update tag stats:', error);
        }
    }
}
exports.ArticlesService = ArticlesService;
//# sourceMappingURL=articles.service.js.map
import { prisma } from '../models';
import { 
  ArticleQuery, 
  CreateArticleRequest, 
  UpdateArticleRequest,
  ArticleResponse,
  ArticleListResponse,
  CommentRequest,
  CommentResponse,
  TagResponse,
  ArticleStats,
  UserArticleStats
} from '../types';
import { 
  AppError, 
  calculateReadTime, 
  renderMarkdown, 
  extractExcerpt, 
  validateTags,
  generateArticleSlug,
  formatArticleResponse,
  formatCommentResponse,
  paginate,
  createPaginationMeta,
  sanitizeInput
} from '../utils';
import { publish, Topics } from '../../../shared/utils/kafka';

export class ArticlesService {
  // Create a new article
  async createArticle(data: CreateArticleRequest, userId: string, userName: string, userUsername: string): Promise<ArticleResponse> {
    try {
      const { title, excerpt, content, tags, published = false } = data;

      // Validate and sanitize input
      const sanitizedTitle = sanitizeInput(title);
      const sanitizedExcerpt = excerpt ? sanitizeInput(excerpt) : extractExcerpt(content);
      const sanitizedContent = sanitizeInput(content);
      const validatedTags = validateTags(tags);

      // Generate slug
      const existingSlugs = await prisma.article.findMany({
        select: { slug: true }
      }).then(articles => articles.map(a => a.slug));
      
      const slug = await generateArticleSlug(sanitizedTitle, existingSlugs);

      // Calculate read time
      const readTime = calculateReadTime(sanitizedContent);

      // Render markdown to HTML
      const contentHtml = renderMarkdown(sanitizedContent);

      // Create article
      const article = await prisma.article.create({
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

      // Emit article.created
      try {
        await publish(Topics.ARTICLES_EVENTS, article.id, {
          type: 'article.created',
          id: article.id,
          articleId: article.id,
          authorId: userId,
          title: article.title,
          tags: validatedTags,
          published,
          occurredAt: new Date().toISOString(),
        });
      } catch {}

      // Update tag statistics
      await this.updateTagStats(validatedTags);

      return formatArticleResponse(article);
    } catch (error) {
      throw new AppError('Failed to create article', 500);
    }
  }

  // Get articles with filtering and pagination
  async getArticles(query: ArticleQuery, userId?: string | undefined): Promise<ArticleListResponse> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        tags,
        author,
        featured,
        trending,
        published = true,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = query;

      const { offset } = paginate(page, limit);

      // Build where clause
      const where: any = {
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

      // Build orderBy clause
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Get articles
      const [articles, total] = await Promise.all([
        prisma.article.findMany({
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
        prisma.article.count({ where })
      ]);

      const formattedArticles = articles.map(article => formatArticleResponse(article, userId));
      const paginationMeta = createPaginationMeta(page, limit, total);

      return {
        articles: formattedArticles,
        ...paginationMeta
      };
    } catch (error) {
      throw new AppError('Failed to fetch articles', 500);
    }
  }

  // Get a single article by ID or slug
  async getArticleById(idOrSlug: string, userId?: string | undefined): Promise<ArticleResponse> {
    try {
      const article = await prisma.article.findFirst({
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
        throw new AppError('Article not found', 404);
      }

      // Increment view count
      await this.incrementViewCount(article.id, userId);

      return formatArticleResponse(article, userId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch article', 500);
    }
  }

  // Update an article
  async updateArticle(id: string, data: UpdateArticleRequest, userId?: string | undefined): Promise<ArticleResponse> {
    try {
      const article = await prisma.article.findUnique({
        where: { id },
        include: { tags: true }
      });

      if (!article) {
        throw new AppError('Article not found', 404);
      }

      if (article.authorId !== userId) {
        throw new AppError('Unauthorized to update this article', 403);
      }

      const updateData: any = {};

      if (data.title) {
        updateData.title = sanitizeInput(data.title);
        updateData.slug = await generateArticleSlug(
          updateData.title,
          await prisma.article.findMany({ where: { id: { not: id } } })
            .then(articles => articles.map(a => a.slug))
        );
      }

      if (data.excerpt) {
        updateData.excerpt = sanitizeInput(data.excerpt);
      }

      if (data.content) {
        updateData.content = sanitizeInput(data.content);
        updateData.contentHtml = renderMarkdown(updateData.content);
        updateData.readTime = calculateReadTime(updateData.content);
        
        if (!data.excerpt) {
          updateData.excerpt = extractExcerpt(updateData.content);
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

      // Handle tags update
      if (data.tags) {
        const validatedTags = validateTags(data.tags);
        
        // Delete existing tags
        await prisma.articleTag.deleteMany({
          where: { articleId: id }
        });

        // Create new tags
        updateData.tags = {
          create: validatedTags.map(tag => ({ tag }))
        };

        // Update tag statistics
        await this.updateTagStats(validatedTags);
      }

      const updatedArticle = await prisma.article.update({
        where: { id },
        data: updateData,
        include: {
          tags: true,
          likes: { where: { userId } },
          bookmarks: { where: { userId } }
        }
      });

      // Emit article.updated
      try {
        await publish(Topics.ARTICLES_EVENTS, updatedArticle.id, {
          type: 'article.updated',
          id: updatedArticle.id,
          changes: Object.keys(data),
          occurredAt: new Date().toISOString(),
        });
      } catch {}

      return formatArticleResponse(updatedArticle, userId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update article', 500);
    }
  }

  // Delete an article
  async deleteArticle(id: string, userId?: string | undefined): Promise<void> {
    try {
      const article = await prisma.article.findUnique({
        where: { id }
      });

      if (!article) {
        throw new AppError('Article not found', 404);
      }

      if (article.authorId !== userId) {
        throw new AppError('Unauthorized to delete this article', 403);
      }

      await prisma.article.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete article', 500);
    }
  }

  // Like/Unlike an article
  async toggleLike(articleId: string, userId?: string | undefined): Promise<{ liked: boolean; likes: number }> {
    try {
      if (!userId) {
        throw new AppError('User ID is required', 400);
      }

      const existingLike = await prisma.articleLike.findUnique({
        where: {
          articleId_userId: {
            articleId,
            userId
          }
        }
      });

      if (existingLike) {
        // Unlike
        await prisma.articleLike.delete({
          where: { id: existingLike.id }
        });
        
        await prisma.article.update({
          where: { id: articleId },
          data: { likeCount: { decrement: 1 } }
        });

        // Emit article.unliked
        try { await publish(Topics.ARTICLES_EVENTS, articleId, { type: 'article.unliked', id: articleId, userId, occurredAt: new Date().toISOString() }); } catch {}

        return { liked: false, likes: await this.getArticleLikes(articleId) };
      } else {
        // Like
        await prisma.articleLike.create({
          data: { articleId, userId }
        });
        
        await prisma.article.update({
          where: { id: articleId },
          data: { likeCount: { increment: 1 } }
        });

        // Get article to fetch authorId
        const article = await prisma.article.findUnique({
          where: { id: articleId },
          select: { authorId: true }
        });

        // Emit article.liked
        try { await publish(Topics.ARTICLES_EVENTS, articleId, { type: 'article.liked', id: articleId, articleId, userId, authorId: article?.authorId, occurredAt: new Date().toISOString() }); } catch {}

        return { liked: true, likes: await this.getArticleLikes(articleId) };
      }
    } catch (error) {
      throw new AppError('Failed to toggle like', 500);
    }
  }

  // Bookmark/Unbookmark an article
  async toggleBookmark(articleId: string, userId?: string | undefined): Promise<{ bookmarked: boolean }> {
    try {
      if (!userId) {
        throw new AppError('User ID is required', 400);
      }

      const existingBookmark = await prisma.articleBookmark.findUnique({
        where: {
          articleId_userId: {
            articleId,
            userId
          }
        }
      });

      if (existingBookmark) {
        // Unbookmark
        await prisma.articleBookmark.delete({
          where: { id: existingBookmark.id }
        });
        return { bookmarked: false };
      } else {
        // Bookmark
        await prisma.articleBookmark.create({
          data: { articleId, userId }
        });
        return { bookmarked: true };
      }
    } catch (error) {
      throw new AppError('Failed to toggle bookmark', 500);
    }
  }

  // Add a comment
  async addComment(articleId: string, data: CommentRequest, userId?: string | undefined, userName?: string): Promise<CommentResponse> {
    try {
      if (!userId) {
        throw new AppError('User ID is required', 400);
      }

      if (!userName) {
        throw new AppError('User name is required', 400);
      }

      const comment = await prisma.articleComment.create({
        data: {
          articleId,
          userId,
          userName,
          content: sanitizeInput(data.content),
          parentId: data.parentId || null
        },
        include: {
          replies: true
        }
      });

      // Increment comment count
      await prisma.article.update({
        where: { id: articleId },
        data: { commentCount: { increment: 1 } }
      });

      return formatCommentResponse(comment);
    } catch (error) {
      throw new AppError('Failed to add comment', 500);
    }
  }

  // Get comments for an article
  async getComments(articleId: string, page: number = 1, limit: number = 10): Promise<{ comments: CommentResponse[]; total: number }> {
    try {
      const { offset } = paginate(page, limit);

      const [comments, total] = await Promise.all([
        prisma.articleComment.findMany({
          where: { 
            articleId,
            parentId: null // Only top-level comments
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
        prisma.articleComment.count({
          where: { 
            articleId,
            parentId: null
          }
        })
      ]);

      return {
        comments: comments.map(formatCommentResponse),
        total
      };
    } catch (error) {
      throw new AppError('Failed to fetch comments', 500);
    }
  }

  // Get trending articles
  async getTrendingArticles(limit: number = 10): Promise<ArticleResponse[]> {
    try {
      const articles = await prisma.article.findMany({
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

      return articles.map(article => formatArticleResponse(article));
    } catch (error) {
      throw new AppError('Failed to fetch trending articles', 500);
    }
  }

  // Get featured articles
  async getFeaturedArticles(limit: number = 10): Promise<ArticleResponse[]> {
    try {
      const articles = await prisma.article.findMany({
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

      return articles.map(article => formatArticleResponse(article));
    } catch (error) {
      throw new AppError('Failed to fetch featured articles', 500);
    }
  }

  // Get user's articles
  async getUserArticles(userId?: string | undefined, published?: boolean): Promise<ArticleResponse[]> {
    try {
      if (!userId) {
        throw new AppError('User ID is required', 400);
      }

      const where: any = { authorId: userId };
      if (published !== undefined) {
        where.published = published;
      }

      const articles = await prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          tags: true,
          likes: false,
          bookmarks: false
        }
      });

      return articles.map(article => formatArticleResponse(article));
    } catch (error) {
      throw new AppError('Failed to fetch user articles', 500);
    }
  }

  // Get popular tags
  async getPopularTags(limit: number = 20): Promise<TagResponse[]> {
    try {
      const tags = await prisma.tagStats.findMany({
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
    } catch (error) {
      throw new AppError('Failed to fetch popular tags', 500);
    }
  }

  // Get article statistics
  async getArticleStats(): Promise<ArticleStats> {
    try {
      const [
        totalArticles,
        publishedArticles,
        draftArticles,
        totalViews,
        totalLikes,
        totalComments,
        averageReadTime,
        topTags,
        recentArticles
      ] = await Promise.all([
        prisma.article.count(),
        prisma.article.count({ where: { published: true } }),
        prisma.article.count({ where: { published: false } }),
        prisma.article.aggregate({ _sum: { viewCount: true } }).then(r => r._sum.viewCount || 0),
        prisma.article.aggregate({ _sum: { likeCount: true } }).then(r => r._sum.likeCount || 0),
        prisma.article.aggregate({ _sum: { commentCount: true } }).then(r => r._sum.commentCount || 0),
        prisma.article.aggregate({ _avg: { readTime: true } }).then(r => Math.round(r._avg.readTime || 0)),
        this.getPopularTags(10),
        prisma.article.findMany({
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
        recentArticles: recentArticles.map(article => formatArticleResponse(article))
      };
    } catch (error) {
      throw new AppError('Failed to fetch article statistics', 500);
    }
  }

  // Get user article statistics
  async getUserArticleStats(userId?: string | undefined): Promise<UserArticleStats> {
    try {
      if (!userId) {
        throw new AppError('User ID is required', 400);
      }

      const [
        totalArticles,
        publishedArticles,
        draftArticles,
        totalViews,
        totalLikes,
        totalComments,
        averageReadTime
      ] = await Promise.all([
        prisma.article.count({ where: { authorId: userId } }),
        prisma.article.count({ where: { authorId: userId, published: true } }),
        prisma.article.count({ where: { authorId: userId, published: false } }),
        prisma.article.aggregate({ 
          where: { authorId: userId },
          _sum: { viewCount: true } 
        }).then(r => r._sum?.viewCount || 0),
        prisma.article.aggregate({ 
          where: { authorId: userId },
          _sum: { likeCount: true } 
        }).then(r => r._sum?.likeCount || 0),
        prisma.article.aggregate({ 
          where: { authorId: userId },
          _sum: { commentCount: true } 
        }).then(r => r._sum?.commentCount || 0),
        prisma.article.aggregate({ 
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
    } catch (error) {
      throw new AppError('Failed to fetch user article statistics', 500);
    }
  }

  // Private helper methods
  private async incrementViewCount(articleId: string, userId?: string): Promise<void> {
    try {
      // Record the view
      await prisma.articleView.create({
        data: {
          articleId,
          userId: userId || null,
          ipAddress: null, // Would be extracted from request
          userAgent: null  // Would be extracted from request
        }
      });

      // Increment view count
      await prisma.article.update({
        where: { id: articleId },
        data: { viewCount: { increment: 1 } }
      });
    } catch (error) {
      // Don't throw error for view tracking failures
      console.error('Failed to track view:', error);
    }
  }

  private async getArticleLikes(articleId: string): Promise<number> {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { likeCount: true }
    });
    return article?.likeCount || 0;
  }

  private async updateTagStats(tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        await prisma.tagStats.upsert({
          where: { tag },
          update: { count: { increment: 1 } },
          create: { tag, count: 1 }
        });
      }
    } catch (error) {
      console.error('Failed to update tag stats:', error);
    }
  }
}

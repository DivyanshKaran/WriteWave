import { prisma } from '@/models';
import { 
  Post, 
  Comment, 
  ForumCategory, 
  CreatePostRequest, 
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  VoteType,
  PaginationQuery,
  SearchQuery
} from '@/types';
import { AppError } from '@/utils/errors';
import { createSlug } from '@/utils/helpers';
import { contentModeration } from '@/utils/moderation';

export class ForumService {
  // Categories
  async getCategories(): Promise<ForumCategory[]> {
    return prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { posts: { where: { isDeleted: false } } }
        }
      }
    });
  }

  async getCategory(slug: string): Promise<ForumCategory | null> {
    return prisma.forumCategory.findUnique({
      where: { slug, isActive: true },
      include: {
        _count: {
          select: { posts: { where: { isDeleted: false } } }
        }
      }
    });
  }

  // Posts
  async getPosts(categoryId?: string, pagination: PaginationQuery = {}): Promise<{ posts: Post[], total: number }> {
    const { page = 1, limit = 20, sortBy = 'lastActivityAt', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;

    const where: any = { isDeleted: false };
    if (categoryId) where.categoryId = categoryId;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              reputation: true,
            },
          },
          category: true,
          _count: {
            select: { comments: { where: { isDeleted: false } } }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      }),
      prisma.post.count({ where })
    ]);

    return { posts, total };
  }

  async getPost(postId: string, userId?: string): Promise<Post | null> {
    const post = await prisma.getPostWithDetails(postId, userId);
    
    if (post && !post.isDeleted) {
      // Increment view count
      await prisma.post.update({
        where: { id: postId },
        data: { viewCount: { increment: 1 } }
      });
    }

    return post;
  }

  async createPost(data: CreatePostRequest, authorId: string): Promise<Post> {
    // Content moderation
    const moderationResult = await contentModeration.checkContent(data.title + ' ' + data.content);
    if (!moderationResult.isApproved) {
      throw new AppError('Content violates community guidelines', 400);
    }

    const slug = createSlug(data.title);
    
    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      throw new AppError('A post with this title already exists', 400);
    }

    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        slug,
        categoryId: data.categoryId,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        category: true,
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId: authorId,
        type: 'POST_CREATED',
        title: 'Created a new post',
        description: `Posted "${data.title}" in ${post.category.name}`,
        metadata: { postId: post.id, categoryId: post.categoryId }
      }
    });

    return post;
  }

  async updatePost(postId: string, data: UpdatePostRequest, userId: string): Promise<Post> {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.authorId !== userId) {
      throw new AppError('Not authorized to update this post', 403);
    }

    if (post.isDeleted) {
      throw new AppError('Cannot update deleted post', 400);
    }

    // Content moderation for updates
    if (data.title || data.content) {
      const content = (data.title || post.title) + ' ' + (data.content || post.content);
      const moderationResult = await contentModeration.checkContent(content);
      if (!moderationResult.isApproved) {
        throw new AppError('Content violates community guidelines', 400);
      }
    }

    const updateData: any = { ...data };
    if (data.title) {
      updateData.slug = createSlug(data.title);
    }

    return prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        category: true,
      },
    });
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.authorId !== userId) {
      throw new AppError('Not authorized to delete this post', 403);
    }

    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true }
    });
  }

  async pinPost(postId: string, userId: string): Promise<Post> {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check if user is moderator or admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isModerator) {
      throw new AppError('Not authorized to pin posts', 403);
    }

    return prisma.post.update({
      where: { id: postId },
      data: { isPinned: !post.isPinned },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        category: true,
      },
    });
  }

  // Comments
  async getComments(postId: string, pagination: PaginationQuery = {}): Promise<{ comments: Comment[], total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId, isDeleted: false, parentId: null },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              reputation: true,
            },
          },
          replies: {
            where: { isDeleted: false },
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                  reputation: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.comment.count({ where: { postId, isDeleted: false, parentId: null } })
    ]);

    return { comments, total };
  }

  async createComment(data: CreateCommentRequest, authorId: string): Promise<Comment> {
    // Verify post exists
    const post = await prisma.post.findUnique({ where: { id: data.postId } });
    if (!post || post.isDeleted) {
      throw new AppError('Post not found', 404);
    }

    if (post.isLocked) {
      throw new AppError('Comments are disabled for this post', 400);
    }

    // Content moderation
    const moderationResult = await contentModeration.checkContent(data.content);
    if (!moderationResult.isApproved) {
      throw new AppError('Content violates community guidelines', 400);
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        authorId,
        parentId: data.parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
      },
    });

    // Update post comment count and last activity
    await prisma.post.update({
      where: { id: data.postId },
      data: {
        commentCount: { increment: 1 },
        lastActivityAt: new Date(),
      }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId: authorId,
        type: 'COMMENT_ADDED',
        title: 'Added a comment',
        description: `Commented on "${post.title}"`,
        metadata: { postId: data.postId, commentId: comment.id }
      }
    });

    return comment;
  }

  async updateComment(commentId: string, data: UpdateCommentRequest, userId: string): Promise<Comment> {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.authorId !== userId) {
      throw new AppError('Not authorized to update this comment', 403);
    }

    if (comment.isDeleted) {
      throw new AppError('Cannot update deleted comment', 400);
    }

    // Content moderation
    const moderationResult = await contentModeration.checkContent(data.content);
    if (!moderationResult.isApproved) {
      throw new AppError('Content violates community guidelines', 400);
    }

    return prisma.comment.update({
      where: { id: commentId },
      data: { content: data.content },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
      },
    });
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.authorId !== userId) {
      throw new AppError('Not authorized to delete this comment', 403);
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true }
    });

    // Update post comment count
    await prisma.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } }
    });
  }

  // Voting
  async votePost(postId: string, userId: string, voteType: VoteType): Promise<void> {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) {
      throw new AppError('Post not found', 404);
    }

    if (post.authorId === userId) {
      throw new AppError('Cannot vote on your own post', 400);
    }

    const existingVote = await prisma.postVote.findUnique({
      where: { postId_userId: { postId, userId } }
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        // Remove vote
        await prisma.postVote.delete({
          where: { id: existingVote.id }
        });

        // Update post vote count
        const increment = voteType === VoteType.UPVOTE ? -1 : 1;
        await prisma.post.update({
          where: { id: postId },
          data: {
            upvotes: voteType === VoteType.UPVOTE ? { decrement: 1 } : undefined,
            downvotes: voteType === VoteType.DOWNVOTE ? { decrement: 1 } : undefined,
          }
        });
      } else {
        // Change vote
        await prisma.postVote.update({
          where: { id: existingVote.id },
          data: { type: voteType }
        });

        // Update post vote count
        await prisma.post.update({
          where: { id: postId },
          data: {
            upvotes: voteType === VoteType.UPVOTE ? { increment: 1 } : { decrement: 1 },
            downvotes: voteType === VoteType.DOWNVOTE ? { increment: 1 } : { decrement: 1 },
          }
        });
      }
    } else {
      // Create new vote
      await prisma.postVote.create({
        data: { postId, userId, type: voteType }
      });

      // Update post vote count
      await prisma.post.update({
        where: { id: postId },
        data: {
          upvotes: voteType === VoteType.UPVOTE ? { increment: 1 } : undefined,
          downvotes: voteType === VoteType.DOWNVOTE ? { increment: 1 } : undefined,
        }
      });
    }

    // Update author reputation
    const reputationChange = voteType === VoteType.UPVOTE ? 1 : -1;
    await prisma.user.update({
      where: { id: post.authorId },
      data: { reputation: { increment: reputationChange } }
    });
  }

  async voteComment(commentId: string, userId: string, voteType: VoteType): Promise<void> {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.isDeleted) {
      throw new AppError('Comment not found', 404);
    }

    if (comment.authorId === userId) {
      throw new AppError('Cannot vote on your own comment', 400);
    }

    const existingVote = await prisma.commentVote.findUnique({
      where: { commentId_userId: { commentId, userId } }
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        // Remove vote
        await prisma.commentVote.delete({
          where: { id: existingVote.id }
        });

        // Update comment vote count
        await prisma.comment.update({
          where: { id: commentId },
          data: {
            upvotes: voteType === VoteType.UPVOTE ? { decrement: 1 } : undefined,
            downvotes: voteType === VoteType.DOWNVOTE ? { decrement: 1 } : undefined,
          }
        });
      } else {
        // Change vote
        await prisma.commentVote.update({
          where: { id: existingVote.id },
          data: { type: voteType }
        });

        // Update comment vote count
        await prisma.comment.update({
          where: { id: commentId },
          data: {
            upvotes: voteType === VoteType.UPVOTE ? { increment: 1 } : { decrement: 1 },
            downvotes: voteType === VoteType.DOWNVOTE ? { increment: 1 } : { decrement: 1 },
          }
        });
      }
    } else {
      // Create new vote
      await prisma.commentVote.create({
        data: { commentId, userId, type: voteType }
      });

      // Update comment vote count
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          upvotes: voteType === VoteType.UPVOTE ? { increment: 1 } : undefined,
          downvotes: voteType === VoteType.DOWNVOTE ? { increment: 1 } : undefined,
        }
      });
    }

    // Update author reputation
    const reputationChange = voteType === VoteType.UPVOTE ? 1 : -1;
    await prisma.user.update({
      where: { id: comment.authorId },
      data: { reputation: { increment: reputationChange } }
    });
  }

  // Search
  async searchPosts(query: SearchQuery): Promise<{ posts: Post[], total: number }> {
    const { q, category, author, dateFrom, dateTo, page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    const posts = await prisma.searchPosts(q, {
      categoryId: category,
      authorId: author,
      dateFrom,
      dateTo,
      limit,
      offset,
    });

    const total = await prisma.post.count({
      where: {
        isDeleted: false,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ],
        ...(category && { categoryId: category }),
        ...(author && { authorId: author }),
        ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
        ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
      }
    });

    return { posts, total };
  }
}

export const forumService = new ForumService();

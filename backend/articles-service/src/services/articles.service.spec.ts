import { ArticlesService } from './articles.service';

// Mock prisma model methods used by the service
const prisma = {
  article: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  articleTag: { deleteMany: jest.fn() },
  articleLike: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
  articleBookmark: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
  articleComment: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  articleView: { create: jest.fn() },
  tagStats: { upsert: jest.fn(), findMany: jest.fn() },
} as any;

jest.mock('../models', () => ({ prisma }));

// Mock shared kafka publish
const publish = jest.fn();
jest.mock('../../../shared/utils/kafka', () => ({
  publish: (...args: any[]) => publish(...args),
  Topics: { ARTICLES_EVENTS: 'articles.events' },
}));

// Mock utils with simple deterministic behavior
jest.mock('../utils', () => ({
  AppError: class AppError extends Error { constructor(message: string, public status: number){ super(message); } },
  calculateReadTime: (content: string) => Math.ceil(content.length / 100),
  renderMarkdown: (md: string) => `<p>${md}</p>`,
  extractExcerpt: (content: string) => content.slice(0, 100),
  validateTags: (tags: string[] = []) => tags,
  generateArticleSlug: async (title: string, existing: string[]) => {
    const base = title.toLowerCase().replace(/\s+/g, '-');
    let slug = base; let i = 1;
    while (existing.includes(slug)) { slug = `${base}-${i++}`; }
    return slug;
  },
  formatArticleResponse: (article: any, _userId?: string) => ({ id: article.id || 'a1', title: article.title, slug: article.slug, likeCount: article.likeCount || 0, published: article.published ?? true }),
  formatCommentResponse: (comment: any) => ({ id: comment.id || 'c1', content: comment.content, replies: comment.replies || [] }),
  paginate: (page: number, limit: number) => ({ offset: (page - 1) * limit, limit }),
  createPaginationMeta: (page: number, limit: number, total: number) => ({ page, limit, total, totalPages: Math.ceil(total / limit) }),
  sanitizeInput: (s: string) => s,
}));

describe('ArticlesService', () => {
  const service = new ArticlesService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an article and emits event', async () => {
    prisma.article.findMany.mockResolvedValueOnce([]);
    prisma.article.create.mockResolvedValueOnce({ id: 'a1', title: 'T', slug: 't', tags: [], likes: [], bookmarks: [] });
    prisma.tagStats.upsert.mockResolvedValue({});

    const res = await service.createArticle({ title: 'T', content: 'Hello world', tags: ['tag1'], published: true }, 'u1', 'User', 'user');
    expect(res.slug).toBe('t');
    expect(prisma.article.create).toHaveBeenCalled();
    expect(publish).toHaveBeenCalled();
  });

  it('gets articles with pagination and formatting', async () => {
    prisma.article.findMany.mockResolvedValueOnce([{ id: 'a1', title: 'T', slug: 't', tags: [], likeCount: 0 }]);
    prisma.article.count.mockResolvedValueOnce(1);

    const res = await service.getArticles({ page: 1, limit: 10 });
    expect(res.articles.length).toBe(1);
    expect(res.total).toBe(1);
  });

  it('fetches article by id and increments view', async () => {
    prisma.article.findFirst.mockResolvedValueOnce({ id: 'a1', title: 'T', slug: 't', tags: [] });
    prisma.articleView.create.mockResolvedValueOnce({});
    prisma.article.update.mockResolvedValueOnce({});

    const res = await service.getArticleById('a1');
    expect(res.id).toBe('a1');
    expect(prisma.articleView.create).toHaveBeenCalled();
    expect(prisma.article.update).toHaveBeenCalled();
  });

  it('toggles like from none to liked', async () => {
    prisma.articleLike.findUnique.mockResolvedValueOnce(null);
    prisma.articleLike.create.mockResolvedValueOnce({});
    prisma.article.update.mockResolvedValueOnce({});
    prisma.article.findUnique.mockResolvedValueOnce({ authorId: 'u2' });
    prisma.article.aggregate.mockResolvedValueOnce({ _sum: { likeCount: 1 } });

    const res = await service.toggleLike('a1', 'u1');
    expect(res.liked).toBe(true);
    expect(res.likes).toBe(1);
  });

  it('toggles bookmark on and off', async () => {
    prisma.articleBookmark.findUnique.mockResolvedValueOnce(null);
    prisma.articleBookmark.create.mockResolvedValueOnce({});
    const on = await service.toggleBookmark('a1', 'u1');
    expect(on.bookmarked).toBe(true);

    prisma.articleBookmark.findUnique.mockResolvedValueOnce({ id: 'b1' });
    prisma.articleBookmark.delete.mockResolvedValueOnce({});
    const off = await service.toggleBookmark('a1', 'u1');
    expect(off.bookmarked).toBe(false);
  });

  it('adds a comment and increments count', async () => {
    prisma.articleComment.create.mockResolvedValueOnce({ id: 'c1', content: 'Nice', replies: [] });
    prisma.article.update.mockResolvedValueOnce({});
    const res = await service.addComment('a1', { content: 'Nice' }, 'u1', 'User');
    expect(res.id).toBe('c1');
  });
});



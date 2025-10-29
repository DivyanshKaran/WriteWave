import { ArticleQuery, CreateArticleRequest, UpdateArticleRequest, ArticleResponse, ArticleListResponse, CommentRequest, CommentResponse, TagResponse, ArticleStats, UserArticleStats } from '../types';
export declare class ArticlesService {
    createArticle(data: CreateArticleRequest, userId: string, userName: string, userUsername: string): Promise<ArticleResponse>;
    getArticles(query: ArticleQuery, userId?: string | undefined): Promise<ArticleListResponse>;
    getArticleById(idOrSlug: string, userId?: string | undefined): Promise<ArticleResponse>;
    updateArticle(id: string, data: UpdateArticleRequest, userId?: string | undefined): Promise<ArticleResponse>;
    deleteArticle(id: string, userId?: string | undefined): Promise<void>;
    toggleLike(articleId: string, userId?: string | undefined): Promise<{
        liked: boolean;
        likes: number;
    }>;
    toggleBookmark(articleId: string, userId?: string | undefined): Promise<{
        bookmarked: boolean;
    }>;
    addComment(articleId: string, data: CommentRequest, userId?: string | undefined, userName?: string): Promise<CommentResponse>;
    getComments(articleId: string, page?: number, limit?: number): Promise<{
        comments: CommentResponse[];
        total: number;
    }>;
    getTrendingArticles(limit?: number): Promise<ArticleResponse[]>;
    getFeaturedArticles(limit?: number): Promise<ArticleResponse[]>;
    getUserArticles(userId?: string | undefined, published?: boolean): Promise<ArticleResponse[]>;
    getPopularTags(limit?: number): Promise<TagResponse[]>;
    getArticleStats(): Promise<ArticleStats>;
    getUserArticleStats(userId?: string | undefined): Promise<UserArticleStats>;
    private incrementViewCount;
    private getArticleLikes;
    private updateTagStats;
}
//# sourceMappingURL=articles.service.d.ts.map
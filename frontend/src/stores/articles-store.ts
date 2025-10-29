import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Article, ArticleComment, SearchFilters } from '@/types';

interface ArticlesState {
  articles: Article[];
  featuredArticles: Article[];
  trendingArticles: Article[];
  currentArticle: Article | null;
  comments: ArticleComment[];
  searchQuery: string;
  filters: SearchFilters;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ArticlesActions {
  setArticles: (articles: Article[]) => void;
  addArticle: (article: Article) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  removeArticle: (id: string) => void;
  setCurrentArticle: (article: Article | null) => void;
  setComments: (comments: ArticleComment[]) => void;
  addComment: (comment: ArticleComment) => void;
  updateComment: (id: string, updates: Partial<ArticleComment>) => void;
  removeComment: (id: string) => void;
  setFeaturedArticles: (articles: Article[]) => void;
  setTrendingArticles: (articles: Article[]) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setSearching: (searching: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<ArticlesState['pagination']>) => void;
  likeArticle: (id: string) => void;
  unlikeArticle: (id: string) => void;
  clearArticles: () => void;
  clearError: () => void;
}

type ArticlesStore = ArticlesState & ArticlesActions;

const defaultFilters: SearchFilters = {
  sortBy: 'relevance',
  sortOrder: 'desc',
};

export const useArticlesStore = create<ArticlesStore>()(
  persist(
    (set, get) => ({
      // State
      articles: [],
      featuredArticles: [],
      trendingArticles: [],
      currentArticle: null,
      comments: [],
      searchQuery: '',
      filters: defaultFilters,
      isLoading: false,
      isSearching: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },

      // Actions
      setArticles: (articles) => set({ articles }),

      addArticle: (article) => set((state) => ({
        articles: [article, ...state.articles],
      })),

      updateArticle: (id, updates) => set((state) => ({
        articles: state.articles.map((article) =>
          article.id === id ? { ...article, ...updates } : article
        ),
        currentArticle: state.currentArticle?.id === id 
          ? { ...state.currentArticle, ...updates }
          : state.currentArticle,
      })),

      removeArticle: (id) => set((state) => ({
        articles: state.articles.filter((article) => article.id !== id),
        currentArticle: state.currentArticle?.id === id ? null : state.currentArticle,
      })),

      setCurrentArticle: (article) => set({ currentArticle: article }),

      setComments: (comments) => set({ comments }),

      addComment: (comment) => set((state) => ({
        comments: [comment, ...state.comments],
      })),

      updateComment: (id, updates) => set((state) => ({
        comments: state.comments.map((comment) =>
          comment.id === id ? { ...comment, ...updates } : comment
        ),
      })),

      removeComment: (id) => set((state) => ({
        comments: state.comments.filter((comment) => comment.id !== id),
      })),

      setFeaturedArticles: (articles) => set({ featuredArticles: articles }),

      setTrendingArticles: (articles) => set({ trendingArticles: articles }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
      })),

      clearFilters: () => set({ 
        filters: defaultFilters,
        searchQuery: '',
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setSearching: (isSearching) => set({ isSearching }),

      setError: (error) => set({ error }),

      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination },
      })),

      likeArticle: (id) => set((state) => ({
        articles: state.articles.map((article) =>
          article.id === id 
            ? { ...article, likes: article.likes + 1 }
            : article
        ),
        currentArticle: state.currentArticle?.id === id
          ? { ...state.currentArticle, likes: state.currentArticle.likes + 1 }
          : state.currentArticle,
      })),

      unlikeArticle: (id) => set((state) => ({
        articles: state.articles.map((article) =>
          article.id === id 
            ? { ...article, likes: Math.max(0, article.likes - 1) }
            : article
        ),
        currentArticle: state.currentArticle?.id === id
          ? { ...state.currentArticle, likes: Math.max(0, state.currentArticle.likes - 1) }
          : state.currentArticle,
      })),

      clearArticles: () => set({
        articles: [],
        currentArticle: null,
        comments: [],
        searchQuery: '',
        filters: defaultFilters,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'articles-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        featuredArticles: state.featuredArticles,
        trendingArticles: state.trendingArticles,
        filters: state.filters,
      }),
    }
  )
);

// Selectors for better performance
export const useArticles = () => useArticlesStore((state) => ({
  articles: state.articles,
  featuredArticles: state.featuredArticles,
  trendingArticles: state.trendingArticles,
  currentArticle: state.currentArticle,
  isLoading: state.isLoading,
  isSearching: state.isSearching,
  error: state.error,
  pagination: state.pagination,
}));

export const useArticlesActions = () => useArticlesStore((state) => ({
  setArticles: state.setArticles,
  addArticle: state.addArticle,
  updateArticle: state.updateArticle,
  removeArticle: state.removeArticle,
  setCurrentArticle: state.setCurrentArticle,
  setComments: state.setComments,
  addComment: state.addComment,
  updateComment: state.updateComment,
  removeComment: state.removeComment,
  setFeaturedArticles: state.setFeaturedArticles,
  setTrendingArticles: state.setTrendingArticles,
  setSearchQuery: state.setSearchQuery,
  setFilters: state.setFilters,
  clearFilters: state.clearFilters,
  setLoading: state.setLoading,
  setSearching: state.setSearching,
  setError: state.setError,
  setPagination: state.setPagination,
  likeArticle: state.likeArticle,
  unlikeArticle: state.unlikeArticle,
  clearArticles: state.clearArticles,
  clearError: state.clearError,
}));

export const useArticleComments = () => useArticlesStore((state) => state.comments);

export const useArticleFilters = () => useArticlesStore((state) => ({
  searchQuery: state.searchQuery,
  filters: state.filters,
}));

import { useState, useCallback, useEffect } from 'react';
import { articlesService } from '@/lib/api-client';
import { transformArticle, Article } from '@/lib/data-transformers';
import { usePagination } from './usePagination';
import { useDebounce } from './useDebounce';

export interface ArticlesState {
  articles: Article[];
  featuredArticles: Article[];
  trendingArticles: Article[];
  isLoading: boolean;
  error: string | null;
}

export interface ArticlesActions {
  fetchArticles: (filters?: ArticleFilters) => Promise<void>;
  fetchArticle: (id: string) => Promise<Article>;
  createArticle: (articleData: CreateArticleData) => Promise<Article>;
  updateArticle: (id: string, articleData: Partial<CreateArticleData>) => Promise<Article>;
  deleteArticle: (id: string) => Promise<void>;
  likeArticle: (id: string) => Promise<void>;
  unlikeArticle: (id: string) => Promise<void>;
  searchArticles: (query: string) => Promise<void>;
  clearSearch: () => void;
}

interface ArticleFilters {
  tags?: string[];
  author?: string;
  trending?: boolean;
  featured?: boolean;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface CreateArticleData {
  title: string;
  excerpt?: string;
  content: string;
  tags: string[];
  isPublished?: boolean;
}

/**
 * Hook for managing articles state and operations
 */
export function useArticles(): ArticlesState & ArticlesActions {
  const [state, setState] = useState<ArticlesState>({
    articles: [],
    featuredArticles: [],
    trendingArticles: [],
    isLoading: false,
    error: null,
  });

  const pagination = usePagination({ initialLimit: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch articles with filters
  const fetchArticles = useCallback(async (filters: ArticleFilters = {}) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      
      const response = await articlesService.getArticles(params);
      const articles = response.data.map(transformArticle);
      
      setState(prev => ({
        ...prev,
        articles,
        isLoading: false,
        error: null,
      }));
      
      pagination.setTotal(response.meta?.total || 0);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch articles',
      }));
    }
  }, [pagination]);

  // Fetch single article
  const fetchArticle = useCallback(async (id: string): Promise<Article> => {
    try {
      const response = await articlesService.getArticle(id);
      return transformArticle(response.data);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch article');
    }
  }, []);

  // Create new article
  const createArticle = useCallback(async (articleData: CreateArticleData): Promise<Article> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await articlesService.createArticle(articleData);
      const newArticle = transformArticle(response.data);
      
      setState(prev => ({
        ...prev,
        articles: [newArticle, ...prev.articles],
        isLoading: false,
        error: null,
      }));
      
      return newArticle;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to create article',
      }));
      throw error;
    }
  }, []);

  // Update article
  const updateArticle = useCallback(async (
    id: string, 
    articleData: Partial<CreateArticleData>
  ): Promise<Article> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await articlesService.updateArticle(id, articleData);
      const updatedArticle = transformArticle(response.data);
      
      setState(prev => ({
        ...prev,
        articles: prev.articles.map(article => 
          article.id === id ? updatedArticle : article
        ),
        isLoading: false,
        error: null,
      }));
      
      return updatedArticle;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to update article',
      }));
      throw error;
    }
  }, []);

  // Delete article
  const deleteArticle = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await articlesService.deleteArticle(id);
      
      setState(prev => ({
        ...prev,
        articles: prev.articles.filter(article => article.id !== id),
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to delete article',
      }));
      throw error;
    }
  }, []);

  // Like article
  const likeArticle = useCallback(async (id: string) => {
    try {
      await articlesService.likeArticle(id);
      
      setState(prev => ({
        ...prev,
        articles: prev.articles.map(article =>
          article.id === id 
            ? { ...article, likes: article.likes + 1 }
            : article
        ),
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to like article');
    }
  }, []);

  // Unlike article
  const unlikeArticle = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/articles/${id}/like`);
      
      setState(prev => ({
        ...prev,
        articles: prev.articles.map(article =>
          article.id === id 
            ? { ...article, likes: Math.max(0, article.likes - 1) }
            : article
        ),
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to unlike article');
    }
  }, []);

  // Search articles
  const searchArticles = useCallback(async (query: string) => {
    setSearchQuery(query);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Fetch featured and trending articles
  const fetchFeaturedArticles = useCallback(async () => {
    try {
      const response = await articlesService.getFeaturedArticles();
      const featuredArticles = response.data.map(transformArticle);
      
      setState(prev => ({
        ...prev,
        featuredArticles,
      }));
    } catch (error) {
      console.error('Failed to fetch featured articles:', error);
    }
  }, []);

  const fetchTrendingArticles = useCallback(async () => {
    try {
      const response = await articlesService.getTrendingArticles();
      const trendingArticles = response.data.map(transformArticle);
      
      setState(prev => ({
        ...prev,
        trendingArticles,
      }));
    } catch (error) {
      console.error('Failed to fetch trending articles:', error);
    }
  }, []);

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearchQuery) {
      fetchArticles({ query: debouncedSearchQuery });
    }
  }, [debouncedSearchQuery, fetchArticles]);

  // Initial data fetch
  useEffect(() => {
    fetchArticles();
    fetchFeaturedArticles();
    fetchTrendingArticles();
  }, [fetchArticles, fetchFeaturedArticles, fetchTrendingArticles]);

  return {
    ...state,
    ...pagination,
    fetchArticles,
    fetchArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    likeArticle,
    unlikeArticle,
    searchArticles,
    clearSearch,
  };
}

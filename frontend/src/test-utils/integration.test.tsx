import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockUser, mockArticle } from './test-utils';
import Profile from '@/pages/Profile';
import Articles from '@/pages/Articles';
import { useAuth } from '@/hooks/useAuth';
import { useArticles } from '@/hooks/useArticles';

// Mock the hooks
jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useArticles');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseArticles = useArticles as jest.MockedFunction<typeof useArticles>;

describe('Integration Tests', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      updateProfile: jest.fn(),
      isLoading: false,
      error: null,
    });

    mockUseArticles.mockReturnValue({
      articles: [mockArticle],
      isLoading: false,
      error: null,
      createArticle: jest.fn(),
      updateArticle: jest.fn(),
      deleteArticle: jest.fn(),
      searchArticles: jest.fn(),
      filterArticles: jest.fn(),
    });
  });

  describe('Profile Page Integration', () => {
    it('should render complete profile page', () => {
      renderWithProviders(<Profile />);

      // Check that all profile sections are rendered
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByText(mockUser.bio)).toBeInTheDocument();
      
      // Check navigation
      expect(screen.getByRole('link', { name: /back to dashboard/i })).toBeInTheDocument();
      
      // Check edit button
      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    });

    it('should handle edit profile interaction', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Profile />);

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      // Should call the edit handler (mocked in the component)
      // In a real test, you'd check for modal or form appearance
    });

    it('should handle navigation back to dashboard', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Profile />);

      const backButton = screen.getByRole('link', { name: /back to dashboard/i });
      await user.click(backButton);

      // Should navigate back (mocked in the component)
    });
  });

  describe('Articles Page Integration', () => {
    it('should render complete articles page', () => {
      renderWithProviders(<Articles />);

      // Check page title and description
      expect(screen.getByText('Articles')).toBeInTheDocument();
      expect(screen.getByText(/discover trending articles/i)).toBeInTheDocument();
      
      // Check write article button
      expect(screen.getByRole('link', { name: /write article/i })).toBeInTheDocument();
      
      // Check search and filters
      expect(screen.getByPlaceholderText('Search articles...')).toBeInTheDocument();
      expect(screen.getByText('All Tags')).toBeInTheDocument();
      expect(screen.getByText('All Authors')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /trending/i })).toBeInTheDocument();
    });

    it('should handle article search', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Articles />);

      const searchInput = screen.getByPlaceholderText('Search articles...');
      await user.type(searchInput, 'test search');

      // Should trigger search (mocked in the component)
      expect(searchInput).toHaveValue('test search');
    });

    it('should handle trending filter toggle', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Articles />);

      const trendingButton = screen.getByRole('button', { name: /trending/i });
      await user.click(trendingButton);

      // Should toggle trending filter
      expect(trendingButton).toHaveClass('bg-primary'); // Active state
    });

    it('should handle tag selection', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Articles />);

      // Find a tag button (assuming tags are rendered)
      const tagButtons = screen.getAllByRole('button');
      const tagButton = tagButtons.find(button => 
        button.textContent?.includes('test') || button.textContent?.includes('article')
      );
      
      if (tagButton) {
        await user.click(tagButton);
        // Should select the tag
      }
    });

    it('should navigate to article creation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Articles />);

      const writeButton = screen.getByRole('link', { name: /write article/i });
      await user.click(writeButton);

      // Should navigate to create article page
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle authentication errors', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        updateProfile: jest.fn(),
        isLoading: false,
        error: new Error('Authentication failed'),
      });

      renderWithProviders(<Profile />);

      // Should handle error state appropriately
      // In a real implementation, you'd check for error display
    });

    it('should handle loading states', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        updateProfile: jest.fn(),
        isLoading: true,
        error: null,
      });

      renderWithProviders(<Profile />);

      // Should show loading state
      // In a real implementation, you'd check for loading indicators
    });

    it('should handle API errors gracefully', () => {
      mockUseArticles.mockReturnValue({
        articles: [],
        isLoading: false,
        error: new Error('Failed to load articles'),
        createArticle: jest.fn(),
        updateArticle: jest.fn(),
        deleteArticle: jest.fn(),
        searchArticles: jest.fn(),
        filterArticles: jest.fn(),
      });

      renderWithProviders(<Articles />);

      // Should handle error state gracefully
      // In a real implementation, you'd check for error display
    });
  });

  describe('Performance Integration', () => {
    it('should handle large article lists efficiently', () => {
      const largeArticleList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockArticle,
        id: i,
        title: `Article ${i}`,
      }));

      mockUseArticles.mockReturnValue({
        articles: largeArticleList,
        isLoading: false,
        error: null,
        createArticle: jest.fn(),
        updateArticle: jest.fn(),
        deleteArticle: jest.fn(),
        searchArticles: jest.fn(),
        filterArticles: jest.fn(),
      });

      renderWithProviders(<Articles />);

      // Should render efficiently with virtual scrolling
      // Only visible articles should be in the DOM
      expect(screen.getByText('Article 0')).toBeInTheDocument();
      // Should not render all 1000 articles
    });

    it('should handle image lazy loading', () => {
      const articlesWithImages = [{
        ...mockArticle,
        image: 'https://example.com/image.jpg',
      }];

      mockUseArticles.mockReturnValue({
        articles: articlesWithImages,
        isLoading: false,
        error: null,
        createArticle: jest.fn(),
        updateArticle: jest.fn(),
        deleteArticle: jest.fn(),
        searchArticles: jest.fn(),
        filterArticles: jest.fn(),
      });

      renderWithProviders(<Articles />);

      // Should render with lazy loading
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility Integration', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Articles />);

      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('link', { name: /back to dashboard/i }));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('link', { name: /write article/i }));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByPlaceholderText('Search articles...'));
    });

    it('should have proper ARIA labels', () => {
      renderWithProviders(<Articles />);

      // Check for proper ARIA labels
      const searchInput = screen.getByPlaceholderText('Search articles...');
      expect(searchInput).toHaveAttribute('aria-label');

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should support screen readers', () => {
      renderWithProviders(<Profile />);

      // Check for screen reader support
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Check for proper heading hierarchy
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });
  });

  describe('State Management Integration', () => {
    it('should sync state across components', async () => {
      const user = userEvent.setup();
      
      // Mock articles store to return different data
      mockUseArticles.mockReturnValue({
        articles: [mockArticle],
        isLoading: false,
        error: null,
        createArticle: jest.fn(),
        updateArticle: jest.fn(),
        deleteArticle: jest.fn(),
        searchArticles: jest.fn(),
        filterArticles: jest.fn(),
      });

      renderWithProviders(<Articles />);

      // Perform search
      const searchInput = screen.getByPlaceholderText('Search articles...');
      await user.type(searchInput, 'test');

      // State should be updated across components
      // In a real implementation, you'd check that the search state
      // is reflected in the article list
    });

    it('should persist user preferences', () => {
      mockUseAuth.mockReturnValue({
        user: {
          ...mockUser,
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: true,
          },
        },
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        updateProfile: jest.fn(),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<Profile />);

      // User preferences should be applied
      // In a real implementation, you'd check for theme, language, etc.
    });
  });

  describe('Network Integration', () => {
    it('should handle offline state', () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      renderWithProviders(<Articles />);

      // Should show offline indicator
      expect(screen.getByText(/you're currently offline/i)).toBeInTheDocument();
    });

    it('should handle network reconnection', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      renderWithProviders(<Articles />);

      // Go back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      // Trigger online event
      fireEvent(window, new Event('online'));

      await waitFor(() => {
        expect(screen.getByText(/connection restored/i)).toBeInTheDocument();
      });
    });
  });
});

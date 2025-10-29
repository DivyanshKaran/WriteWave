import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockUser, mockArticle, mockBadge } from './test-utils';
import { 
  ProfileHeader, 
  ProfileStats, 
  ProfileBadges, 
  ProfileArticles, 
  ProfileActivity 
} from '@/components/profile';
import { 
  ArticleFilters, 
  ArticleCard, 
  ArticleGrid, 
  FeaturedArticles, 
  PopularTags 
} from '@/components/articles';
import { 
  ErrorBoundary, 
  AlertManager, 
  NetworkStatusIndicator 
} from '@/components/error';
import { 
  LoadingCard, 
  LoadingGrid, 
  LoadingSpinner, 
  LoadingOverlay, 
  LoadingButton 
} from '@/components/loading';
import { 
  OptimizedImage, 
  VirtualizedList, 
  MemoizedCard, 
  LazyComponent 
} from '@/components/performance';
import { 
  SkipLink,
  ScreenReaderOnly,
  AriaLiveRegion,
  FocusTrap,
  AccessibleButton,
  AccessibleInput,
  AccessibleCard
} from '@/components/accessibility';

describe('Profile Components', () => {
  describe('ProfileHeader', () => {
    it('should render user information', () => {
      const onEditProfile = jest.fn();
      
      renderWithProviders(
        <ProfileHeader user={mockUser} onEditProfile={onEditProfile} />
      );

      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByText(mockUser.location)).toBeInTheDocument();
      expect(screen.getByText(mockUser.bio)).toBeInTheDocument();
    });

    it('should call onEditProfile when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEditProfile = jest.fn();
      
      renderWithProviders(
        <ProfileHeader user={mockUser} onEditProfile={onEditProfile} />
      );

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      expect(onEditProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('ProfileStats', () => {
    it('should render statistics', () => {
      const stats = {
        totalCharacters: 100,
        totalVocabulary: 200,
        studyStreak: 5,
        totalHours: 10,
        lessonsCompleted: 15,
        articlesWritten: 3,
        totalViews: 500,
      };

      renderWithProviders(<ProfileStats stats={stats} />);

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
    });
  });

  describe('ProfileBadges', () => {
    it('should render earned and locked badges', () => {
      const badges = [
        { ...mockBadge, earned: true },
        { ...mockBadge, id: 2, name: 'Locked Badge', earned: false },
      ];

      renderWithProviders(<ProfileBadges badges={badges} />);

      expect(screen.getByText('Test Badge')).toBeInTheDocument();
      expect(screen.getByText('Locked Badge')).toBeInTheDocument();
      expect(screen.getByText('1 of 2 badges earned')).toBeInTheDocument();
    });
  });

  describe('ProfileArticles', () => {
    it('should render articles', () => {
      const articles = [mockArticle];

      renderWithProviders(<ProfileArticles articles={articles} />);

      expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
      expect(screen.getByText(mockArticle.excerpt)).toBeInTheDocument();
      expect(screen.getByText(mockArticle.author.name)).toBeInTheDocument();
    });

    it('should show empty state when no articles', () => {
      renderWithProviders(<ProfileArticles articles={[]} />);

      expect(screen.getByText('No articles written yet')).toBeInTheDocument();
    });
  });

  describe('ProfileActivity', () => {
    it('should render activity feed', () => {
      const activities = [
        { action: 'Completed lesson', detail: 'Hiragana: A-row', time: '2 hours ago' },
        { action: 'Earned badge', detail: 'First Steps', time: '1 day ago' },
      ];

      renderWithProviders(<ProfileActivity activities={activities} />);

      expect(screen.getByText('Completed lesson')).toBeInTheDocument();
      expect(screen.getByText('Hiragana: A-row')).toBeInTheDocument();
      expect(screen.getByText('Earned badge')).toBeInTheDocument();
      expect(screen.getByText('First Steps')).toBeInTheDocument();
    });
  });
});

describe('Article Components', () => {
  describe('ArticleFilters', () => {
    it('should render search and filter controls', () => {
      const props = {
        searchTerm: '',
        selectedTag: '',
        selectedAuthor: '',
        showTrending: false,
        onSearchChange: jest.fn(),
        onTagChange: jest.fn(),
        onAuthorChange: jest.fn(),
        onTrendingToggle: jest.fn(),
        allTags: ['test', 'article'],
        authors: [{ username: 'test', name: 'Test Author' }],
      };

      renderWithProviders(<ArticleFilters {...props} />);

      expect(screen.getByPlaceholderText('Search articles...')).toBeInTheDocument();
      expect(screen.getByText('All Tags')).toBeInTheDocument();
      expect(screen.getByText('All Authors')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /trending/i })).toBeInTheDocument();
    });

    it('should call handlers when filters change', async () => {
      const user = userEvent.setup();
      const onSearchChange = jest.fn();
      const onTagChange = jest.fn();
      const onTrendingToggle = jest.fn();

      const props = {
        searchTerm: '',
        selectedTag: '',
        selectedAuthor: '',
        showTrending: false,
        onSearchChange,
        onTagChange,
        onAuthorChange: jest.fn(),
        onTrendingToggle,
        allTags: ['test'],
        authors: [],
      };

      renderWithProviders(<ArticleFilters {...props} />);

      const searchInput = screen.getByPlaceholderText('Search articles...');
      await user.type(searchInput, 'test search');

      expect(onSearchChange).toHaveBeenCalledWith('test search');

      const trendingButton = screen.getByRole('button', { name: /trending/i });
      await user.click(trendingButton);

      expect(onTrendingToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('ArticleCard', () => {
    it('should render article information', () => {
      renderWithProviders(<ArticleCard article={mockArticle} />);

      expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
      expect(screen.getByText(mockArticle.excerpt)).toBeInTheDocument();
      expect(screen.getByText(mockArticle.author.name)).toBeInTheDocument();
      expect(screen.getByText(mockArticle.readTime)).toBeInTheDocument();
    });

    it('should show trending badge when article is trending', () => {
      const trendingArticle = { ...mockArticle, trending: true };
      
      renderWithProviders(<ArticleCard article={trendingArticle} />);

      expect(screen.getByText('Trending')).toBeInTheDocument();
    });

    it('should show featured badge when article is featured', () => {
      const featuredArticle = { ...mockArticle, featured: true };
      
      renderWithProviders(<ArticleCard article={featuredArticle} />);

      expect(screen.getByText('Featured')).toBeInTheDocument();
    });
  });

  describe('ArticleGrid', () => {
    it('should render articles', () => {
      const articles = [mockArticle];

      renderWithProviders(<ArticleGrid articles={articles} />);

      expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    });

    it('should show loading state', () => {
      renderWithProviders(<ArticleGrid articles={[]} isLoading={true} />);

      // Should show loading skeletons
      expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(3);
    });

    it('should show empty state', () => {
      renderWithProviders(<ArticleGrid articles={[]} isLoading={false} />);

      expect(screen.getByText('No articles found')).toBeInTheDocument();
    });
  });

  describe('FeaturedArticles', () => {
    it('should render featured articles', () => {
      const articles = [mockArticle];

      renderWithProviders(<FeaturedArticles articles={articles} />);

      expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
      expect(screen.getByText(mockArticle.author.name)).toBeInTheDocument();
    });
  });

  describe('PopularTags', () => {
    it('should render tags', () => {
      const tags = ['test', 'article', 'japanese'];
      const onTagSelect = jest.fn();

      renderWithProviders(
        <PopularTags 
          tags={tags} 
          selectedTag="" 
          onTagSelect={onTagSelect} 
        />
      );

      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('article')).toBeInTheDocument();
      expect(screen.getByText('japanese')).toBeInTheDocument();
    });

    it('should handle tag selection', async () => {
      const user = userEvent.setup();
      const tags = ['test', 'article'];
      const onTagSelect = jest.fn();

      renderWithProviders(
        <PopularTags 
          tags={tags} 
          selectedTag="" 
          onTagSelect={onTagSelect} 
        />
      );

      const testTag = screen.getByText('test');
      await user.click(testTag);

      expect(onTagSelect).toHaveBeenCalledWith('test');
    });
  });
});

describe('Error Components', () => {
  describe('ErrorBoundary', () => {
    it('should catch and display errors', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      renderWithProviders(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });

    it('should render children when no error', () => {
      renderWithProviders(
        <ErrorBoundary>
          <div>No error</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('AlertManager', () => {
    it('should render alerts', () => {
      const alerts = [
        {
          id: '1',
          type: 'error' as const,
          title: 'Error',
          message: 'Something went wrong',
        },
      ];

      renderWithProviders(
        <AlertManager alerts={alerts} onDismiss={jest.fn()} />
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('NetworkStatusIndicator', () => {
    it('should show offline status', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      renderWithProviders(<NetworkStatusIndicator />);

      expect(screen.getByText(/you're currently offline/i)).toBeInTheDocument();
    });
  });
});

describe('Loading Components', () => {
  describe('LoadingCard', () => {
    it('should render loading skeleton', () => {
      renderWithProviders(<LoadingCard />);

      // Should render skeleton elements
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });

  describe('LoadingGrid', () => {
    it('should render multiple loading cards', () => {
      renderWithProviders(<LoadingGrid count={3} />);

      // Should render 3 loading cards
      expect(screen.getAllByRole('generic')).toHaveLength(3);
    });
  });

  describe('LoadingSpinner', () => {
    it('should render spinner', () => {
      renderWithProviders(<LoadingSpinner />);

      expect(screen.getByRole('generic')).toBeInTheDocument();
    });
  });

  describe('LoadingOverlay', () => {
    it('should render overlay with message', () => {
      renderWithProviders(<LoadingOverlay message="Loading..." />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('LoadingButton', () => {
    it('should show loading state', () => {
      renderWithProviders(
        <LoadingButton loading={true}>
          <button>Click me</button>
        </LoadingButton>
      );

      expect(screen.getByText('Click me')).toBeInTheDocument();
    });
  });
});

describe('Performance Components', () => {
  describe('OptimizedImage', () => {
    it('should render image with lazy loading', () => {
      renderWithProviders(
        <OptimizedImage 
          src="test-image.jpg" 
          alt="Test image" 
        />
      );

      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });
  });

  describe('VirtualizedList', () => {
    it('should render virtualized list', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      
      renderWithProviders(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item) => <div key={item.id}>{item.name}</div>}
        />
      );

      // Should render visible items only
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });
  });

  describe('MemoizedCard', () => {
    it('should render card with memoization', () => {
      const onClick = jest.fn();
      
      renderWithProviders(
        <MemoizedCard
          title="Test Card"
          description="Test description"
          onClick={onClick}
        />
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  describe('LazyComponent', () => {
    it('should render lazy component', () => {
      renderWithProviders(
        <LazyComponent>
          <div>Lazy content</div>
        </LazyComponent>
      );

      expect(screen.getByText('Lazy content')).toBeInTheDocument();
    });
  });
});

describe('Accessibility Components', () => {
  describe('SkipLink', () => {
    it('should render skip link', () => {
      renderWithProviders(
        <SkipLink href="#main">Skip to main content</SkipLink>
      );

      const link = screen.getByRole('link', { name: /skip to main content/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '#main');
    });
  });

  describe('ScreenReaderOnly', () => {
    it('should render screen reader only content', () => {
      renderWithProviders(
        <ScreenReaderOnly>Screen reader text</ScreenReaderOnly>
      );

      expect(screen.getByText('Screen reader text')).toBeInTheDocument();
    });
  });

  describe('AriaLiveRegion', () => {
    it('should render live region', () => {
      renderWithProviders(
        <AriaLiveRegion message="Live message" priority="polite" />
      );

      const liveRegion = screen.getByText('Live message');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('FocusTrap', () => {
    it('should trap focus', () => {
      renderWithProviders(
        <FocusTrap active={true}>
          <button>First</button>
          <button>Second</button>
        </FocusTrap>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('AccessibleButton', () => {
    it('should render accessible button', () => {
      renderWithProviders(
        <AccessibleButton>Click me</AccessibleButton>
      );

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute('aria-disabled');
    });

    it('should show loading state', () => {
      renderWithProviders(
        <AccessibleButton loading={true} loadingText="Loading...">
          Click me
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('AccessibleInput', () => {
    it('should render accessible input', () => {
      renderWithProviders(
        <AccessibleInput label="Test Input" />
      );

      expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
    });

    it('should show error message', () => {
      renderWithProviders(
        <AccessibleInput 
          label="Test Input" 
          error="This field is required" 
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('AccessibleCard', () => {
    it('should render accessible card', () => {
      renderWithProviders(
        <AccessibleCard>
          <div>Card content</div>
        </AccessibleCard>
      );

      const card = screen.getByRole('region');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });
  });
});

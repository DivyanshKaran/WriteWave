import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Test utilities
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

// Mock data generators
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  username: 'testuser',
  avatar: 'TU',
  location: 'Test City',
  joinedDate: 'January 2024',
  bio: 'Test bio',
};

export const mockArticle = {
  id: 1,
  title: 'Test Article',
  excerpt: 'Test excerpt',
  author: {
    name: 'Test Author',
    username: 'testauthor',
    avatar: 'TA',
  },
  tags: ['test', 'article'],
  publishedAt: '2024-01-01',
  readTime: '5 min read',
  views: 100,
  likes: 10,
  comments: 5,
  trending: false,
  featured: false,
};

export const mockBadge = {
  id: 1,
  name: 'Test Badge',
  description: 'Test badge description',
  icon: 'Trophy',
  earned: true,
};

// Mock functions
export const mockApiCall = jest.fn();
export const mockNavigate = jest.fn();
export const mockAlert = jest.fn();

// Custom matchers
export const customMatchers = {
  toBeAccessible: (element: HTMLElement) => {
    const hasRole = element.getAttribute('role') !== null;
    const hasAriaLabel = element.getAttribute('aria-label') !== null;
    const hasAriaLabelledBy = element.getAttribute('aria-labelledby') !== null;
    const hasAccessibleName = hasAriaLabel || hasAriaLabelledBy || element.textContent?.trim();
    
    return {
      pass: hasRole || hasAccessibleName,
      message: () => `Expected element to be accessible (have role or accessible name)`,
    };
  },
  
  toHaveFocus: (element: HTMLElement) => {
    return {
      pass: document.activeElement === element,
      message: () => `Expected element to have focus`,
    };
  },
  
  toBeInViewport: (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.left >= 0 && 
                     rect.bottom <= window.innerHeight && 
                     rect.right <= window.innerWidth;
    
    return {
      pass: isVisible,
      message: () => `Expected element to be in viewport`,
    };
  },
};

// Test helpers
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
};

export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  await waitForAsync();
  const end = performance.now();
  return end - start;
};

export const mockPerformanceNow = () => {
  let time = 0;
  jest.spyOn(performance, 'now').mockImplementation(() => {
    time += 16.67; // ~60fps
    return time;
  });
  return () => jest.restoreAllMocks();
};

// Accessibility testing utilities
export const checkA11yViolations = async (container: HTMLElement) => {
  // This would integrate with axe-core in a real implementation
  const violations: string[] = [];
  
  // Check for missing alt text on images
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      violations.push('Image missing alt text or aria-label');
    }
  });
  
  // Check for missing labels on form inputs
  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    const id = input.id;
    const label = container.querySelector(`label[for="${id}"]`);
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (!label && !ariaLabel && !ariaLabelledBy) {
      violations.push('Form input missing label or aria-label');
    }
  });
  
  return violations;
};

// Error boundary testing
export const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  pathname: '/test',
  search: '',
  hash: '',
  state: null,
};

// Cleanup utilities
export const cleanupMocks = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};

export const resetAllMocks = () => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
};

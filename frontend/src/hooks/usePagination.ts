import { useState, useCallback, useMemo } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  total?: number;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  reset: () => void;
}

/**
 * Hook for managing pagination state and actions
 */
export function usePagination(
  options: PaginationOptions = {}
): PaginationState & PaginationActions {
  const { initialPage = 1, initialLimit = 10, total = 0 } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(total);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / limit);
  }, [totalItems, limit]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    // Reset to first page when limit changes
    setPage(1);
  }, []);

  const handleSetTotal = useCallback((newTotal: number) => {
    setTotalItems(newTotal);
    // Adjust page if it's beyond the new total
    const newTotalPages = Math.ceil(newTotal / limit);
    if (page > newTotalPages && newTotalPages > 0) {
      setPage(newTotalPages);
    }
  }, [limit, page]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotalItems(total);
  }, [initialPage, initialLimit, total]);

  return {
    page,
    limit,
    total: totalItems,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    setLimit: handleSetLimit,
    setTotal: handleSetTotal,
    reset,
  };
}

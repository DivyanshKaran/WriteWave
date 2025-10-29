import { StateCreator } from 'zustand';

/**
 * Middleware for logging store actions in development
 */
export const logger = <T>(
  config: StateCreator<T>,
  name?: string
): StateCreator<T> => (set, get, api) =>
  config(
    (...args) => {
      if (process.env.NODE_ENV === 'development') {
        console.group(`🔄 ${name || 'Store'} Action`);
        console.log('Previous State:', get());
        console.log('Action Args:', args);
        set(...args);
        console.log('New State:', get());
        console.groupEnd();
      } else {
        set(...args);
      }
    },
    get,
    api
  );

/**
 * Middleware for persisting specific parts of state
 */
export const persistMiddleware = <T>(
  config: StateCreator<T>,
  options: {
    name: string;
    partialize?: (state: T) => Partial<T>;
  }
): StateCreator<T> => {
  const { name, partialize } = options;
  
  return (set, get, api) => {
    const store = config(set, get, api);
    
    // Load persisted state on initialization
    if (typeof window !== 'undefined') {
      try {
        const persisted = localStorage.getItem(name);
        if (persisted) {
          const parsed = JSON.parse(persisted);
          if (partialize) {
            // Only restore partialized state
            const currentState = get();
            const restoredState = { ...currentState, ...parsed };
            set(restoredState);
          } else {
            set(parsed);
          }
        }
      } catch (error) {
        console.warn(`Failed to load persisted state for ${name}:`, error);
      }
    }
    
    return store;
  };
};

/**
 * Middleware for handling async actions
 */
export const asyncMiddleware = <T>(
  config: StateCreator<T>,
  name?: string
): StateCreator<T> => (set, get, api) => {
  const store = config(set, get, api);
  
  // Add async action helpers
  const asyncSet = async (asyncFn: () => Promise<void>) => {
    try {
      await asyncFn();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ ${name || 'Store'} Async Action Error:`, error);
      }
      throw error;
    }
  };
  
  return {
    ...store,
    asyncSet,
  };
};

/**
 * Middleware for handling optimistic updates
 */
export const optimisticMiddleware = <T>(
  config: StateCreator<T>,
  name?: string
): StateCreator<T> => (set, get, api) => {
  const store = config(set, get, api);
  
  const optimisticUpdate = <K extends keyof T>(
    key: K,
    optimisticValue: T[K],
    rollbackFn: () => void
  ) => {
    const originalValue = get()[key];
    
    // Apply optimistic update
    set({ [key]: optimisticValue } as Partial<T>);
    
    // Return rollback function
    return () => {
      set({ [key]: originalValue } as Partial<T>);
      rollbackFn();
    };
  };
  
  return {
    ...store,
    optimisticUpdate,
  };
};

/**
 * Middleware for handling store subscriptions
 */
export const subscriptionMiddleware = <T>(
  config: StateCreator<T>,
  name?: string
): StateCreator<T> => (set, get, api) => {
  const store = config(set, get, api);
  
  const subscribers = new Set<(state: T) => void>();
  
  const subscribe = (callback: (state: T) => void) => {
    subscribers.add(callback);
    
    return () => {
      subscribers.delete(callback);
    };
  };
  
  const notifySubscribers = () => {
    const currentState = get();
    subscribers.forEach(callback => {
      try {
        callback(currentState);
      } catch (error) {
        console.error(`Subscription callback error in ${name || 'store'}:`, error);
      }
    });
  };
  
  // Override set to notify subscribers
  const originalSet = set;
  const newSet = (...args: Parameters<typeof set>) => {
    originalSet(...args);
    notifySubscribers();
  };
  
  return {
    ...store,
    subscribe,
    set: newSet,
  };
};

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';

export function SessionInitializer() {
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    // If tokens exist, ensure currentUser is fetched on app load
    if (token || refreshToken) {
      queryClient.prefetchQuery({ queryKey: ['currentUser'] });
    }
  }, [token, refreshToken, queryClient]);

  return null;
}



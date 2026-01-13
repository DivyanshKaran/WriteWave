import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { UserSchema } from '@/types/schemas';

export function useCurrentUser() {
  const { setUser, logout } = useAuthStore.getState();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await userService.getMe();
      const payload = response.data?.user ?? response.data;
      const parsed = UserSchema.safeParse(payload);
      if (!parsed.success) {
        throw new Error('Invalid user payload');
      }
      return parsed.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
    onSuccess: (data) => {
      setUser(data as any);
    },
    onError: (error: any) => {
      if (error?.status === 401) {
        logout();
      }
    },
  });
}



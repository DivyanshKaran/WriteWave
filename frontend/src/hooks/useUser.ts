import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService, UpdateProfileData, UpdateSettingsData } from '@/lib/api-client';

export function useUserProfile() {
  return useQuery({
    queryKey: ['user','profile'],
    queryFn: async () => {
      const res = await userService.getProfile();
      return res.data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await userService.updateProfile(data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user','profile'] });
      qc.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useUserSettings() {
  return useQuery({
    queryKey: ['user','settings'],
    queryFn: async () => {
      const res = await userService.getSettings();
      return res.data;
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateSettingsData) => {
      const res = await userService.updateSettings(data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user','settings'] });
    },
  });
}



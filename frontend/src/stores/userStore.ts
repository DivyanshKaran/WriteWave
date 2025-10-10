// User Store - Authentication and Profile Data
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, userService } from '@/lib/api';
import type { UserState, LoginRequest, RegisterRequest, UserProfile } from '@/types';

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      // Initialize auth state from localStorage
      initializeAuth: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          if (token) {
            // Verify token and get user profile
            const user = await userService.getProfile();
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token');
          set({ isLoading: false });
        }
      },

      // Login action
      login: async (credentials: LoginRequest) => {
        try {
          const response = await authService.login(credentials);
          const { access_token, user: loginUser } = response;
          
          localStorage.setItem('auth_token', access_token);
          
          // Get full user profile
          const user = await userService.getProfile();
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Login failed' 
          };
        }
      },

      // Register action
      register: async (userData: RegisterRequest) => {
        try {
          const response = await authService.register(userData);
          const { access_token, user: registerUser } = response;
          
          localStorage.setItem('auth_token', access_token);
          
          // Get full user profile
          const user = await userService.getProfile();
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Registration failed' 
          };
        }
      },

      // Logout action
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
        } finally {
          localStorage.removeItem('auth_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Update profile action
      updateProfile: async (profileData: Partial<UserProfile>) => {
        try {
          const updatedUser = await userService.updateProfile(profileData);
          set(state => ({
            ...state,
            user: updatedUser,
          }));
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Profile update failed' 
          };
        }
      },

      // Clear auth state
      clearAuth: () => {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

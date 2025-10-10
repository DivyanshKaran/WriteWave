// Authentication Hook
import { useState, useEffect, useCallback } from 'react';
import { authService, userService } from '@/lib/api';
import type { AuthState, LoginRequest, LoginResponse, UserProfile } from '@/types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Verify token and get user profile
          const user = await userService.getProfile();
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      const { access_token, user: loginUser } = response;
      
      localStorage.setItem('auth_token', access_token);
      
      // Get full user profile
      const user = await userService.getProfile();
      
      setAuthState({
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
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    try {
      const response = await authService.register(userData);
      const { access_token, user: registerUser } = response;
      
      localStorage.setItem('auth_token', access_token);
      
      // Get full user profile
      const user = await userService.getProfile();
      
      setAuthState({
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
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    try {
      const updatedUser = await userService.updateProfile(profileData);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Profile update failed' 
      };
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    register,
    updateProfile,
  };
};

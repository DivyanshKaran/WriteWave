import { useState, useCallback, useEffect } from 'react';
import { userService } from '@/lib/api-client';
import { transformUserProfile, UserProfile } from '@/lib/data-transformers';
import { useAuthStore } from '@/stores/auth-store';

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

interface SignupData {
  name: string;
  username: string;
  email: string;
  password: string;
}

/**
 * Authentication hook for managing user authentication state and actions
 */
export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Verify token and get user data
      verifyToken();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await userService.getMe();
      const userProfile = transformUserProfile(response.data);
      
      setState({
        user: userProfile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Token is invalid, clear it
      useAuthStore.getState().logout();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await userService.login({ email, password });
      const { token, refreshToken, user } = response.data;
      
      useAuthStore.getState().setTokens(token, refreshToken);
      const userProfile = transformUserProfile(user);
      
      setState({
        user: userProfile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }));
      throw error;
    }
  }, []);

  const signup = useCallback(async (userData: SignupData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await userService.register({
        email: userData.email,
        password: userData.password,
        firstName: userData.name.split(' ')[0],
        lastName: userData.name.split(' ').slice(1).join(' '),
        username: userData.username,
      });
      const { token, refreshToken, user } = response.data;
      
      useAuthStore.getState().setTokens(token, refreshToken);
      const userProfile = transformUserProfile(user);
      
      setState({
        user: userProfile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Signup failed',
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    userService.logout();
    useAuthStore.getState().logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await apiClient.post('/auth/refresh');
      const { token } = response.data;
      
      apiClient.setAuthToken(token);
    } catch (error) {
      // Refresh failed, logout user
      logout();
      throw error;
    }
  }, [logout]);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!state.user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await userService.updateProfile(profileData);
      const updatedUser = transformUserProfile(response.data);
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Profile update failed',
      }));
      throw error;
    }
  }, [state.user]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Password change failed',
      }));
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await userService.forgotPassword(email);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Password reset failed',
      }));
      throw error;
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await userService.verifyEmail(token);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Email verification failed',
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    login,
    signup,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    resetPassword,
    verifyEmail,
  };
}

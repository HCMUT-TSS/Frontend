import { apiClient } from './api';

export interface User {
  id: number;
  ssoSub: string;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'admin' | 'coordinator';
  faculty: string;
  isTutor: boolean;
  tutorStatus?: string | null;
  isAdmin: boolean;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export const authService = {
  // SSO Login
  async login(email: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/sso-login', { email });
  },

  // Logout
  async logout(): Promise<LogoutResponse> {
    return apiClient.post<LogoutResponse>('/auth/logout');
  },

  // Get current user
  // Note: If this endpoint doesn't exist in your backend, it will fail silently
  async getCurrentUser(): Promise<User> {
    try {
      return await apiClient.get<User>('/auth/me');
    } catch (error) {
      // If the endpoint doesn't exist, just throw to indicate not authenticated
      throw new Error('Not authenticated');
    }
  },
};

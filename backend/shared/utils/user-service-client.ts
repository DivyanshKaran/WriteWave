import { AxiosResponse } from 'axios';
import { HttpClient, ServiceUrls } from './http-client';

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  roles?: string[];
};

export type UserSettings = {
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  language?: string;
  timezone?: string;
};

export class UserServiceClient {
  private client: HttpClient;

  constructor(baseURL: string = ServiceUrls.USER) {
    this.client = new HttpClient({ baseURL });
  }

  // Requires user access token (end-user context)
  async getCurrentUser(accessToken: string): Promise<UserProfile> {
    const res = await this.client.get<UserProfile>('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    ensureOk(res, 'Failed to fetch current user');
    return res.data as unknown as UserProfile;
  }

  // Admin-only endpoint to fetch user by ID
  async getUserByIdAdmin(userId: string, adminToken: string): Promise<UserProfile> {
    const res = await this.client.get<UserProfile>(`/api/v1/users/admin/users/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    ensureOk(res, 'Failed to fetch user by id');
    return res.data as unknown as UserProfile;
  }

  // Fetch user profile (end-user context)
  async getProfile(accessToken: string): Promise<UserProfile> {
    const res = await this.client.get<UserProfile>('/api/v1/users/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    ensureOk(res, 'Failed to fetch user profile');
    return res.data as unknown as UserProfile;
  }

  // Fetch user settings (preferences)
  async getSettings(accessToken: string): Promise<UserSettings> {
    const res = await this.client.get<UserSettings>('/api/v1/users/settings', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    ensureOk(res, 'Failed to fetch user settings');
    return res.data as unknown as UserSettings;
  }
}

function ensureOk(res: AxiosResponse, message: string): void {
  if (res.status < 200 || res.status >= 300) {
    const errDetail = typeof res.data === 'object' ? JSON.stringify(res.data) : String(res.data);
    throw new Error(`${message}: ${res.status} ${errDetail}`);
  }
}

export const userServiceClient = new UserServiceClient();



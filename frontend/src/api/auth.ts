import { api } from './axios';
import type { ApiResponse, User } from '../types';

interface AuthData {
  user: User;
  accessToken: string;
}

export const authApi = {
  signup: (body: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<AuthData>>('/auth/signup', body).then((r) => r.data.data),

  login: (body: { email: string; password: string }) =>
    api.post<ApiResponse<AuthData>>('/auth/login', body).then((r) => r.data.data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<ApiResponse<{ user: User }>>('/auth/me').then((r) => r.data.data.user),
};

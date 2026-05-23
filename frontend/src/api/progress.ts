import { api } from './axios';
import type { ApiResponse, Stats, UserProgress } from '../types';

export const progressApi = {
  getAll: () =>
    api.get<ApiResponse<{ progress: UserProgress[] }>>('/progress/me').then((r) => r.data.data.progress),

  getStats: () =>
    api.get<ApiResponse<Stats>>('/progress/stats').then((r) => r.data.data),

  toggle: (problemId: string, isCompleted: boolean) =>
    api.post<ApiResponse<{ progress: UserProgress }>>('/progress/toggle', { problemId, isCompleted })
       .then((r) => r.data.data.progress),
};

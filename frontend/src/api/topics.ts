import { api } from './axios';
import type { ApiResponse, Topic, TopicDetail } from '../types';

export const topicsApi = {
  getAll: () =>
    api.get<ApiResponse<{ topics: Topic[] }>>('/topics').then((r) => r.data.data.topics),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<TopicDetail>>(`/topics/${slug}`).then((r) => r.data.data),
};

import { api } from './axios';
import type { ApiResponse, Topic, Problem } from '../types';

interface AdminStats {
  totalUsers: number;
  totalProblems: number;
  totalCompletions: number;
}

export interface CreateTopicPayload {
  title: string;
  description: string;
  order: number;
}

export type UpdateTopicPayload = Partial<CreateTopicPayload>;

export interface CreateProblemPayload {
  topicId: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  subtopic: string;
  resources: {
    youtubeUrl: string;
    leetcodeUrl: string;
    codeforcesUrl: string;
    articleUrl: string;
  };
  tags: string[];
  companyTags: string[];
  avgTime: string;
}

export type UpdateProblemPayload = Partial<Omit<CreateProblemPayload, 'topicId'>>;

export const adminApi = {
  getStats: () =>
    api.get<ApiResponse<AdminStats>>('/admin/stats').then((r) => r.data.data),

  listTopics: () =>
    api.get<ApiResponse<{ topics: Topic[] }>>('/admin/topics').then((r) => r.data.data.topics),

  createTopic: (data: CreateTopicPayload) =>
    api.post<ApiResponse<{ topic: Topic }>>('/admin/topics', data).then((r) => r.data.data.topic),

  updateTopic: (id: string, data: UpdateTopicPayload) =>
    api.patch<ApiResponse<{ topic: Topic }>>(`/admin/topics/${id}`, data).then((r) => r.data.data.topic),

  deleteTopic: (id: string) =>
    api.delete(`/admin/topics/${id}`),

  listProblems: (topicId?: string) =>
    api
      .get<ApiResponse<{ problems: Problem[] }>>('/admin/problems', {
        params: topicId ? { topicId } : {},
      })
      .then((r) => r.data.data.problems),

  createProblem: (data: CreateProblemPayload) =>
    api
      .post<ApiResponse<{ problem: Problem }>>('/admin/problems', data)
      .then((r) => r.data.data.problem),

  updateProblem: (id: string, data: UpdateProblemPayload) =>
    api
      .patch<ApiResponse<{ problem: Problem }>>(`/admin/problems/${id}`, data)
      .then((r) => r.data.data.problem),

  deleteProblem: (id: string) =>
    api.delete(`/admin/problems/${id}`),
};

export type { AdminStats };

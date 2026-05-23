export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface Resources {
  youtubeUrl: string;
  leetcodeUrl: string;
  codeforcesUrl: string;
  articleUrl: string;
}

export interface Problem {
  _id: string;
  topicId: string;
  topicSlug: string;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  subtopic: string;
  resources: Resources;
  tags: string[];
  companyTags: string[];
  avgTime: string;
  isCompleted?: boolean;
  completedAt?: string | null;
}

export interface TopicStats {
  total: number;
  completed: number;
  percentage: number;
  byDifficulty: { easy: number; medium: number; hard: number };
  completedByDifficulty: { easy: number; medium: number; hard: number };
}

export interface Topic {
  _id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  problemCount: number;
  stats: TopicStats;
}

export interface TopicDetail {
  topic: Omit<Topic, 'stats'>;
  problems: Problem[];
  stats: { total: number; completed: number; percentage: number };
}

export interface UserProgress {
  _id: string;
  userId: string;
  problemId: string;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface DifficultyBreakdown {
  total: number;
  completed: number;
}

export interface Stats {
  overall: { total: number; completed: number; percentage: number };
  byDifficulty: {
    easy: DifficultyBreakdown;
    medium: DifficultyBreakdown;
    hard: DifficultyBreakdown;
  };
  perTopic: Array<{
    topicId: string;
    slug: string;
    title: string;
    icon: string;
    total: number;
    completed: number;
    percentage: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

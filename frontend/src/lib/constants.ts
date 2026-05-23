export const QUERY_KEYS = {
  me: ['me'] as const,
  topics: ['topics'] as const,
  topic: (slug: string) => ['topic', slug] as const,
  progress: ['progress'] as const,
  stats: ['progress', 'stats'] as const,
} as const;

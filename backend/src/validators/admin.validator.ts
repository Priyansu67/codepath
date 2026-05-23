import { z } from 'zod';

export const createTopicSchema = z.object({
  title: z.string().min(2).max(80).trim(),
  description: z.string().max(500).default(''),
  icon: z.string().max(10).default('📚'),
  order: z.number().int().positive(),
});

export const updateTopicSchema = createTopicSchema.partial();

export const createProblemSchema = z.object({
  topicId: z.string().length(24),
  title: z.string().min(2).max(200).trim(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  order: z.number().int().positive(),
  subtopic: z.string().max(100).default(''),
  resources: z
    .object({
      youtubeUrl: z.string().url().or(z.literal('')).default(''),
      leetcodeUrl: z.string().url().or(z.literal('')).default(''),
      codeforcesUrl: z.string().url().or(z.literal('')).default(''),
      articleUrl: z.string().url().or(z.literal('')).default(''),
    })
    .default({}),
  tags: z.array(z.string().max(40)).default([]),
  companyTags: z.array(z.string().max(80)).default([]),
  avgTime: z.string().max(20).default(''),
});

export const updateProblemSchema = createProblemSchema.partial().omit({ topicId: true });

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type CreateProblemInput = z.infer<typeof createProblemSchema>;
export type UpdateProblemInput = z.infer<typeof updateProblemSchema>;

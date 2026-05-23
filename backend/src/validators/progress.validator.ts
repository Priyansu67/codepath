import { z } from 'zod';

export const toggleProgressSchema = z.object({
  problemId: z.string().min(1, 'problemId is required'),
  isCompleted: z.boolean(),
});

export type ToggleProgressInput = z.infer<typeof toggleProgressSchema>;

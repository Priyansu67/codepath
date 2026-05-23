import { Request } from 'express';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

// Augment Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface SafeUser {
  _id: unknown;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface TopicStats {
  total: number;
  completed: number;
  percentage: number;
  byDifficulty: { easy: number; medium: number; hard: number };
  completedByDifficulty: { easy: number; medium: number; hard: number };
}

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

export type { Request };

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../models/User';

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.slice(7);
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.sub).select('-passwordHash').lean();
    if (!user) throw new AppError('User not found', 401, 'UNAUTHORIZED');

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  }
);

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    next(new AppError('Admin access required', 403, 'FORBIDDEN'));
    return;
  }
  next();
};

/** Attach user when a valid token is present; continue as guest otherwise. */
export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    try {
      const token = authHeader.slice(7);
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.sub).select('-passwordHash').lean();
      if (user) {
        req.user = {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    } catch {
      // Invalid or expired token — treat as guest for public routes
    }

    next();
  }
);

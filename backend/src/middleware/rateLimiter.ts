import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

const errorBody = (code: string) => ({
  success: false,
  error: { code, message: 'Too many requests, please try again later' },
});

export const generalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorBody('RATE_LIMITED'),
});

export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorBody('AUTH_RATE_LIMITED'),
});

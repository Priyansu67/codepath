import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as authService from '../services/auth.service';

export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await authService.signup(req.body);
  res.cookie('refreshToken', result.refreshToken, result.cookieOptions);
  res.status(201).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body);
  res.cookie('refreshToken', result.refreshToken, result.cookieOptions);
  res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
});

export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await authService.refresh(req.cookies.refreshToken as string | undefined);
  res.cookie('refreshToken', result.newRefreshToken, result.cookieOptions);
  res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await authService.logout(req.cookies.refreshToken as string | undefined);
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.status(204).end();
});

export const me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: { user: req.user } });
});

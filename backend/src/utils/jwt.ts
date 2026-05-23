import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { env } from '../config/env';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  tokenId: string;
}

export function signAccessToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(userId: string): { token: string; tokenId: string } {
  const tokenId = uuid();
  const token = jwt.sign({ sub: userId, tokenId }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { token, tokenId };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

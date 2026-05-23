import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { getRedis, isRedisAvailable } from '../config/redis';
import { env } from '../config/env';
import { CookieOptions, SafeUser } from '../types';

const BCRYPT_ROUNDS = 12;

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};

interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  cookieOptions: CookieOptions;
}

interface RefreshResult {
  user: SafeUser;
  accessToken: string;
  newRefreshToken: string;
  cookieOptions: CookieOptions;
}

function safeUser(user: { _id: unknown; name: string; email: string; role: 'student' | 'admin' }): SafeUser {
  return { _id: user._id, name: user.name, email: user.email, role: user.role };
}

export async function signup(input: { name: string; email: string; password: string }): Promise<AuthResult> {
  const existing = await User.findOne({ email: input.email }).lean();
  if (existing) throw new AppError('Email already registered', 409, 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await User.create({ name: input.name, email: input.email, passwordHash });

  const accessToken = signAccessToken(user._id.toString(), user.role);
  const { token: refreshToken } = signRefreshToken(user._id.toString());

  return { user: safeUser(user), accessToken, refreshToken, cookieOptions: REFRESH_COOKIE_OPTIONS };
}

export async function login(input: { email: string; password: string }): Promise<AuthResult> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');

  await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

  const accessToken = signAccessToken(user._id.toString(), user.role);
  const { token: refreshToken } = signRefreshToken(user._id.toString());

  return { user: safeUser(user), accessToken, refreshToken, cookieOptions: REFRESH_COOKIE_OPTIONS };
}

export async function refresh(refreshToken: string | undefined): Promise<RefreshResult> {
  if (!refreshToken) throw new AppError('No refresh token', 401, 'UNAUTHORIZED');

  const decoded = verifyRefreshToken(refreshToken);

  const redis = getRedis();
  if (isRedisAvailable() && redis) {
    const blacklisted = await redis.get(`blacklist:${decoded.tokenId}`);
    if (blacklisted) throw new AppError('Token revoked', 401, 'TOKEN_REVOKED');
  }

  const user = await User.findById(decoded.sub).lean();
  if (!user) throw new AppError('User not found', 401, 'UNAUTHORIZED');

  const accessToken = signAccessToken(user._id.toString(), user.role);
  const { token: newRefreshToken } = signRefreshToken(user._id.toString());

  return { user: safeUser(user), accessToken, newRefreshToken, cookieOptions: REFRESH_COOKIE_OPTIONS };
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const redis = getRedis();
    if (isRedisAvailable() && redis) {
      const ttl = (decoded.exp ?? 0) - Math.floor(Date.now() / 1000);
      if (ttl > 0) await redis.setex(`blacklist:${decoded.tokenId}`, ttl, '1');
    }
  } catch {
    // Already invalid — ignore
  }
}

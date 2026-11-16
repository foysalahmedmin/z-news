// src/middlewares/auth.ts
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import config from '../config/env';
import AppError from '../builder/app-error';
import { User } from '../modules/user/user.model';
import { TJwtPayload, TRole } from '../types/jsonwebtoken.type';
import catchAsync from '../utils/catch-async';
import { withCache } from '../utils/cache.utils';

type TAuthUser = {
  role: TRole;
  status?: string;
  is_deleted?: boolean;
  token_version?: number;
  password_changed_at?: string | Date;
};

// Only the fields the checks below need are cached. Not toJSON(): the user schema's
// toJSON strips token_version, password_changed_at and is_deleted.
const getUser = (_id: string) =>
  withCache<TAuthUser | null>(`auth:user:${_id}`, 30 * 60, async () => {
    const user = await User.isUserExist(_id);
    if (!user) return null;
    const { role, status, is_deleted, token_version, password_changed_at } =
      user.toObject();
    return { role, status, is_deleted, token_version, password_changed_at };
  });

/**
 * Verifies an access token and the user's current state (deleted, blocked,
 * revoked sessions, password change). Shared by HTTP routes and socket.io.
 */
export const authenticate = async (
  token: string,
): Promise<{ decoded: JwtPayload & TJwtPayload; user: TAuthUser }> => {
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayload;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token expired');
    }
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }

  const { _id, role, iat, token_version } = decoded;

  if (!_id || !role || typeof iat !== 'number') {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token.');
  }

  const user = await getUser(_id);

  // Soft-deleted users are excluded by the model's find hook, hard-deleted ones are gone.
  if (!user || user.is_deleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted');
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
  }

  if (token_version !== undefined && token_version !== user.token_version) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Session invalidated. Please login again.',
    );
  }

  if (user.password_changed_at) {
    const passwordChangedAt = new Date(user.password_changed_at).getTime();
    const tokenIssuedAt = iat * 1000; // convert seconds → ms

    if (passwordChangedAt > tokenIssuedAt) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Password recently changed. Please login again.',
      );
    }
  }

  return { decoded: decoded as JwtPayload & TJwtPayload, user };
};

/**
 * `auth()` with no roles allows any authenticated user. Listing 'guest' also lets
 * requests without a token through (the service decides what a guest may do).
 * super-admin is allowed wherever admin is.
 */
const auth = (...roles: (TRole | 'guest')[]) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      const token = req.headers.authorization;

      if (roles.includes('guest') && !token) {
        return next();
      }

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'No token provided.');
      }

      const { decoded, user } = await authenticate(token);

      const allowed =
        roles.length === 0 ||
        roles.includes(user.role) ||
        (user.role === 'super-admin' && roles.includes('admin'));

      if (!allowed) {
        throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
      }

      req.user = decoded;
      next();
    },
  );
};

export default auth;

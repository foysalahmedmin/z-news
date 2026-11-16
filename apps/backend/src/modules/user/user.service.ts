/**
 * User Service
 *
 * Contains ONLY business logic. All database access is delegated to
 * `user.repository.ts`. This makes the service independently
 * unit-testable by mocking the repository.
 */

import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import { TJwtPayload } from '../../types/jsonwebtoken.type';
import {
  generateCacheKey,
  invalidateCache,
  invalidateCacheByPattern,
  withCache,
} from '../../utils/cache.utils';
import { deleteFiles } from '../../utils/delete-files';
import * as UserRepository from './user.repository';
import { TUser } from './user.type';

const CACHE_PREFIX = 'user';
const CACHE_TTL = 3600; // 1 hour

// Ends existing sessions (token_version bump) and drops the cached auth state, so blocked,
// deleted or re-roled users lose access now instead of when the 30 min auth cache expires.
const revokeSessions = async (ids: string[]) => {
  if (!ids.length) return;
  await UserRepository.incrementTokenVersionMany(ids);
  await invalidateCache(ids.map((id) => `auth:user:${id}`));
};

// ─── Get Single ───────────────────────────────────────────────────────────────

export const getSelf = async (user: TJwtPayload): Promise<TUser> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['id', user._id]),
    CACHE_TTL,
    async () => {
      const result = await UserRepository.findByIdLean(user._id);
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
      }
      return result;
    },
  );
};

export const getUser = async (id: string): Promise<TUser> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['id', id]),
    CACHE_TTL,
    async () => {
      const result = await UserRepository.findByIdLean(id);
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
      }
      return result;
    },
  );
};

// ─── Get Many ────────────────────────────────────────────────────────────────

export const getWritersUsers = async (
  query: Record<string, unknown>,
): Promise<{
  data: TUser[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['writers', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    return await UserRepository.findWritersPaginated(query);
  });
};

export const getUsers = async (
  query: Record<string, unknown>,
): Promise<{
  data: TUser[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['admin', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    return await UserRepository.findAdminPaginated(query);
  });
};

// ─── Update Self ──────────────────────────────────────────────────────────────

export const updateSelf = async (
  user: TJwtPayload,
  payload: Partial<Pick<TUser, 'name' | 'email' | 'image'>>,
): Promise<TUser> => {
  const data = await UserRepository.findByIdLean(user._id);
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (payload.email && data.email !== payload.email) {
    const emailExists = await UserRepository.findByEmail(payload.email);
    if (emailExists) {
      throw new AppError(httpStatus.CONFLICT, 'Email already exists');
    }
  }

  if (payload?.image !== data.image && data.image) {
    deleteFiles(data.image, 'uploads/users');
    payload.image = payload.image || '';
  }

  const result = await UserRepository.updateById(user._id, payload);

  if (result) {
    await invalidateCache(generateCacheKey(CACHE_PREFIX, ['id', user._id]));
    await invalidateCacheByPattern(`${CACHE_PREFIX}:admin:list:*`);
    await invalidateCacheByPattern(`${CACHE_PREFIX}:writers:*`);
  }

  return result!;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateUser = async (
  id: string,
  payload: Partial<
    Pick<TUser, 'name' | 'email' | 'role' | 'status' | 'is_verified'>
  >,
): Promise<TUser> => {
  const data = await UserRepository.findByIdLean(id);
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const roleOrStatusChanged =
    (payload.role !== undefined && payload.role !== data.role) ||
    (payload.status !== undefined && payload.status !== data.status);

  const result = await UserRepository.updateById(id, payload);

  // After the write, so a concurrent request can't re-cache the old role/status.
  if (result && roleOrStatusChanged) {
    await revokeSessions([id]);
  }

  if (result) {
    await invalidateCache(generateCacheKey(CACHE_PREFIX, ['id', id]));
    await invalidateCacheByPattern(`${CACHE_PREFIX}:admin:list:*`);
    await invalidateCacheByPattern(`${CACHE_PREFIX}:writers:*`);
  }

  return result!;
};

export const updateUsers = async (
  ids: string[],
  payload: Partial<Pick<TUser, 'role' | 'status' | 'is_verified'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const users = await UserRepository.findManyByIds(ids);
  const foundIds = users.map((u) => u._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await UserRepository.updateManyByIds(foundIds, payload);

  if (payload.role !== undefined || payload.status !== undefined) {
    await revokeSessions(foundIds);
  }

  if (result.modifiedCount > 0) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return { count: result.modifiedCount, not_found_ids: notFoundIds };
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export const deleteUser = async (id: string): Promise<void> => {
  const user = await UserRepository.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await user.softDelete();
  await revokeSessions([id]);
  await invalidateCache(generateCacheKey(CACHE_PREFIX, ['id', id]));
  await invalidateCacheByPattern(`${CACHE_PREFIX}:admin:list:*`);
};

export const deleteUsers = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const users = await UserRepository.findManyByIds(ids);
  const foundIds = users.map((u) => u._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await UserRepository.softDeleteManyByIds(foundIds);
  await revokeSessions(foundIds);
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return { count: foundIds.length, not_found_ids: notFoundIds };
};

// ─── Hard Delete ──────────────────────────────────────────────────────────────

export const deleteUserPermanent = async (id: string): Promise<void> => {
  const user = await UserRepository.findByIdWithDeleted(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await UserRepository.hardDeleteById(id);
  await invalidateCache(`auth:user:${id}`);
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteUsersPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const users = await UserRepository.findManyByIds(ids);
  const foundIds = users.map((u) => u._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await UserRepository.hardDeleteManyByIds(foundIds);
  await invalidateCache(foundIds.map((id) => `auth:user:${id}`));
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return { count: foundIds.length, not_found_ids: notFoundIds };
};

// ─── Restore ──────────────────────────────────────────────────────────────────

export const restoreUser = async (id: string): Promise<TUser> => {
  const user = await UserRepository.restoreById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found or not deleted');
  }

  await invalidateCache(generateCacheKey(CACHE_PREFIX, ['id', id]));
  await invalidateCacheByPattern(`${CACHE_PREFIX}:admin:list:*`);
  await invalidateCacheByPattern(`${CACHE_PREFIX}:writers:*`);
  return user;
};

export const restoreUsers = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await UserRepository.restoreManyByIds(ids);

  const restoredUsers = await UserRepository.findRestoredByIds(ids);
  const restoredIds = restoredUsers.map((u) => u._id!.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return { count: result.modifiedCount, not_found_ids: notFoundIds };
};

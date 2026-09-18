import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { generateCacheKey, withCache } from '../../utils/cache.utils';
import { TRole } from '../../types/jsonwebtoken.type';
import * as DashboardService from './dashboard.service';

const CACHE_PREFIX = 'dashboard';
const CACHE_TTL = 120;

export const getAdminDashboard = catchAsync(async (_req, res) => {
  const result = await withCache(
    generateCacheKey(CACHE_PREFIX, ['admin']),
    CACHE_TTL,
    () => DashboardService.getAdminDashboardData(),
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Admin dashboard data retrieved successfully',
    data: result,
  });
});

export const getEditorialDashboard = catchAsync(async (req, res) => {
  const result = await withCache(
    generateCacheKey(CACHE_PREFIX, ['editorial', req.user._id, req.user.role]),
    CACHE_TTL,
    () =>
      DashboardService.getEditorialDashboardData(
        req.user._id,
        req.user.role as TRole,
      ),
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Editorial dashboard data retrieved successfully',
    data: result,
  });
});

export const getReaderDashboard = catchAsync(async (req, res) => {
  const result = await withCache(
    generateCacheKey(CACHE_PREFIX, ['reader', req.user._id]),
    CACHE_TTL,
    () => DashboardService.getReaderDashboardData(req.user._id),
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reader dashboard data retrieved successfully',
    data: result,
  });
});

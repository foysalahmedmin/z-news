/**
 * scheduler.job.spec.ts
 *
 * Tests for the scheduler background job functions.
 */

// Mock the News model before importing scheduler
jest.mock('../../news/news.model', () => ({
  News: {
    updateMany: jest.fn(),
  },
}));

jest.mock('../../../config/redis', () => ({
  cacheClient: {
    isOpen: true,
    set: jest.fn(),
    eval: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('../../../config/env', () => ({
  __esModule: true,
  default: {
    redis_enabled: true,
  },
}));

// Mock setInterval to avoid actually setting timers
const mockSetInterval = jest
  .spyOn(global, 'setInterval')
  .mockImplementation(() => 0 as unknown as NodeJS.Timeout);

import { initScheduler, runScheduledJobs } from '../scheduler.job';
import { News } from '../../news/news.model';
import { cacheClient } from '../../../config/redis';

describe('Scheduler Job', () => {
  beforeEach(() => {
    (cacheClient.set as jest.Mock).mockResolvedValue('OK');
    (cacheClient.eval as jest.Mock).mockResolvedValue(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockSetInterval.mockRestore();
  });

  describe('initScheduler', () => {
    it('should initialize the scheduler without throwing', () => {
      (News.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 0 });

      expect(() => initScheduler()).not.toThrow();
    });

    it('should call setInterval to schedule recurring jobs', () => {
      (News.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 0 });

      initScheduler();

      expect(mockSetInterval).toHaveBeenCalledWith(
        expect.any(Function),
        60 * 1000,
      );
    });
  });

  describe('publish scheduled news', () => {
    it('should update scheduled news to published when published_at has passed', async () => {
      (News.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 2 });

      // Trigger the scheduler which calls runScheduledJobs internally
      initScheduler();

      // Allow the async runScheduledJobs() call to execute
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(News.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'scheduled',
          published_at: expect.objectContaining({ $lte: expect.any(Date) }),
        }),
        expect.objectContaining({ $set: { status: 'published' } }),
      );
    });
  });

  describe('archive expired news', () => {
    it('should update published news to archived when expired_at has passed', async () => {
      (News.updateMany as jest.Mock)
        .mockResolvedValueOnce({ modifiedCount: 0 }) // publish job
        .mockResolvedValueOnce({ modifiedCount: 3 }); // archive job

      initScheduler();

      // Allow the async runScheduledJobs() call to execute
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(News.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'published',
          expired_at: expect.objectContaining({ $lt: expect.any(Date) }),
        }),
        expect.objectContaining({ $set: { status: 'archived' } }),
      );
    });
  });

  describe('distributed lock', () => {
    it('should acquire lock, run jobs, and release lock when Redis is enabled', async () => {
      (cacheClient.set as jest.Mock).mockResolvedValue('OK');
      (cacheClient.eval as jest.Mock).mockResolvedValue(1);
      (News.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      const result = await runScheduledJobs();

      expect(cacheClient.set).toHaveBeenCalledWith(
        'scheduler:lock',
        expect.any(String),
        { NX: true, PX: 55000 },
      );
      expect(News.updateMany).toHaveBeenCalled();
      expect(cacheClient.eval).toHaveBeenCalledWith(
        expect.stringContaining('redis.call("del"'),
        expect.objectContaining({
          keys: ['scheduler:lock'],
          arguments: [expect.any(String)],
        }),
      );
      expect(result.published).toBe(1);
      expect(result.skipped).toBeUndefined();
    });

    it('should skip tick when lock is held by another instance (second caller skips)', async () => {
      (cacheClient.set as jest.Mock).mockResolvedValue(null);

      const result = await runScheduledJobs();

      expect(cacheClient.set).toHaveBeenCalled();
      expect(News.updateMany).not.toHaveBeenCalled();
      expect(result.skipped).toBe(true);
      expect(result.published).toBe(0);
      expect(result.archived).toBe(0);
    });

    it('should run anyway when Redis throws an error (fail-open)', async () => {
      (cacheClient.set as jest.Mock).mockRejectedValue(
        new Error('Redis connection refused'),
      );
      (News.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 0 });

      const result = await runScheduledJobs();

      expect(News.updateMany).toHaveBeenCalled();
      expect(result.skipped).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should not throw if News.updateMany rejects', async () => {
      (News.updateMany as jest.Mock).mockRejectedValue(
        new Error('DB connection failed'),
      );

      expect(() => initScheduler()).not.toThrow();

      // Allow promise to settle without bubbling the error
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });
});

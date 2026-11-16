import crypto from 'crypto';
import express from 'express';
import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import config from '../../config/env';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { runScheduledJobs } from './scheduler.job';

const router = express.Router();

// Runs one scheduler tick for platforms without a long-running process (Vercel cron
// convention: GET with `Authorization: Bearer ${CRON_SECRET}`). Disabled when unset.
router.get(
  '/scheduler',
  catchAsync(async (req, res) => {
    const expected = Buffer.from(`Bearer ${config.cron_secret}`);
    const received = Buffer.from(req.headers.authorization ?? '');
    if (
      !config.cron_secret ||
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
    }

    const result = await runScheduledJobs();
    sendResponse(res, {
      status: httpStatus.OK,
      success: true,
      message: 'Scheduler tick completed',
      data: result,
    });
  }),
);

const SchedulerRoutes = router;

export default SchedulerRoutes;

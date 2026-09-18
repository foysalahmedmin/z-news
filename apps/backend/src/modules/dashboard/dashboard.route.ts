import express from 'express';
import auth from '../../middlewares/auth.middleware';
import * as DashboardControllers from './dashboard.controller';

const router = express.Router();

router.get(
  '/admin',
  auth('super-admin', 'admin'),
  DashboardControllers.getAdminDashboard,
);

router.get(
  '/editorial',
  auth('super-admin', 'admin', 'editor', 'author', 'contributor'),
  DashboardControllers.getEditorialDashboard,
);

router.get(
  '/reader',
  auth(
    'super-admin',
    'admin',
    'editor',
    'author',
    'contributor',
    'subscriber',
    'user',
  ),
  DashboardControllers.getReaderDashboard,
);

const DashboardRoutes = router;

export default DashboardRoutes;

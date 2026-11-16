import express from 'express';
import jwt from 'jsonwebtoken';
import supertest from 'supertest';

// Simulate a Redis round-trip: whatever auth caches must survive JSON serialization.
jest.mock('../../utils/cache.utils', () => ({
  withCache: jest.fn(
    async (_key: string, _ttl: number, fn: () => Promise<unknown>) =>
      JSON.parse(JSON.stringify(await fn())),
  ),
}));
jest.mock('../../modules/user/user.model', () => {
  const actual = jest.requireActual('../../modules/user/user.model');
  actual.User.isUserExist = jest.fn();
  return actual;
});

import { User } from '../../modules/user/user.model';
import auth from '../auth.middleware';

const userId = '507f1f77bcf86cd799439011';

const tokenFor = (role: string, token_version = 3) =>
  jwt.sign({ _id: userId, role, token_version }, 'test-jwt-access-secret');

const mockUser = (role: string) =>
  (User.isUserExist as jest.Mock).mockResolvedValue(
    new User({
      _id: userId,
      name: 'Test',
      email: 't@example.com',
      role,
      token_version: 3,
      password_changed_at: new Date(Date.now() - 60_000 * 60),
    }),
  );

const appWith = (middleware: express.RequestHandler) => {
  const app = express();
  app.get('/', middleware, (_req, res) => {
    res.json({ ok: true });
  });
  app.use(
    (
      err: { status?: number },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      res.status(err.status || 500).json({ ok: false });
    },
  );
  return supertest(app);
};

describe('auth middleware', () => {
  it('keeps token_version through the user cache (no false "session invalidated")', async () => {
    mockUser('admin');
    const res = await appWith(auth('admin'))
      .get('/')
      .set('Authorization', tokenFor('admin'));
    expect(res.status).toBe(200);
  });

  it('rejects a token whose token_version was revoked', async () => {
    mockUser('admin');
    const res = await appWith(auth('admin'))
      .get('/')
      .set('Authorization', tokenFor('admin', 2));
    expect(res.status).toBe(403);
  });

  it('auth() with no roles allows any authenticated user', async () => {
    mockUser('user');
    const res = await appWith(auth())
      .get('/')
      .set('Authorization', tokenFor('user'));
    expect(res.status).toBe(200);
  });

  it('auth() with no roles still requires a token', async () => {
    const res = await appWith(auth()).get('/');
    expect(res.status).toBe(401);
  });

  it('lets super-admin through wherever admin is allowed', async () => {
    mockUser('super-admin');
    const res = await appWith(auth('admin'))
      .get('/')
      .set('Authorization', tokenFor('super-admin'));
    expect(res.status).toBe(200);
  });

  it('still denies roles that are not listed', async () => {
    mockUser('author');
    const res = await appWith(auth('admin', 'editor'))
      .get('/')
      .set('Authorization', tokenFor('author'));
    expect(res.status).toBe(403);
  });

  it('rejects tokens of deleted users instead of crashing', async () => {
    (User.isUserExist as jest.Mock).mockResolvedValue(null);
    const res = await appWith(auth('admin'))
      .get('/')
      .set('Authorization', tokenFor('admin'));
    expect(res.status).toBe(403);
  });
});

import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../builder/app-error';
import { Guest } from '../modules/guest/guest.model';
import { TGuest } from '../modules/guest/guest.type';
import catchAsync from '../utils/catch-async';

const COOKIE_NAME = 'guest_token';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365;

const GUEST_TTL_MS = 365 * 24 * 60 * 60 * 1000; // matches cookie maxAge

const clientIp = (req: Request) => (req.ip === '::1' ? '127.0.0.1' : req.ip);

// Finds the guest for the cookie; creates one only when `create` is set, so cookieless
// GETs (crawlers, first page views) don't each insert a Guest document.
const resolveGuest = async (
  req: Request,
  res: Response,
  create: boolean,
): Promise<TGuest | null> => {
  const cookieToken: string | undefined = req.cookies?.[COOKIE_NAME];

  let guest = cookieToken ? await Guest.findOne({ token: cookieToken }) : null;

  if (
    guest?.created_at &&
    Date.now() - new Date(guest.created_at).getTime() > GUEST_TTL_MS
  ) {
    guest = null;
  }

  if (guest) {
    // Mongoose skips the write when nothing changed.
    guest.ip_address = clientIp(req);
    guest.user_agent = req.get('User-Agent') || guest.user_agent;
    await guest.save();
    return guest.toObject() as unknown as TGuest;
  }

  if (!create) return null;

  // A fresh token also replaces an expired one (token is unique).
  const token = crypto.randomBytes(12).toString('hex');
  const created = await Guest.create({
    token: token,
    ip_address: clientIp(req),
    user_agent: req.get('User-Agent') || '',
    fingerprint: req.get('User-Agent')
      ? crypto.createHash('md5').update(req.get('User-Agent')!).digest('hex')
      : '',
    preferences: {},
  });
  res.cookie(COOKIE_NAME, token, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return created.toObject() as unknown as TGuest;
};

// Enrich guest with preferences
export const enrichGuestFromRequest = async (
  guest: TGuest,
  req: Request,
): Promise<void> => {
  const theme = (req.query.theme as string) || req.get('X-Theme');
  if (theme && ['light', 'dark', 'system'].includes(theme)) {
    guest.preferences.theme = theme as 'light' | 'dark' | 'system';
  }

  const timezone = (req.query.tz as string) || req.get('X-Timezone');
  if (timezone) {
    guest.preferences.timezone = timezone;
  }

  const language =
    (req.query.lang as string) || req.get('Accept-Language')?.split(',')[0];
  if (language) {
    guest.preferences.language = language;
  }
};

const guest = (status: 'mandatory' | 'optional') =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Only writes need a guest identity; logged-in requests never need one.
    const create =
      !req.headers.authorization && !['GET', 'HEAD'].includes(req.method);
    const guest = await resolveGuest(req, res, create);

    if (!guest && status === 'mandatory') {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Unable to establish guest session.',
      );
    }

    if (guest) {
      req.guest = guest;
    }

    next();
  });

export default guest;

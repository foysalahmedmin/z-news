/* eslint-disable no-console */
import { RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { Schema, Types } from 'mongoose';
import config from '../config/env';
import { TJwtPayload } from '../types/jsonwebtoken.type';

// Log type
type TLog = {
  user: Types.ObjectId;
  role: string;
  ip_address: string;
  user_agent: string;
  url: string;
  method: string;
  status: number;
  payload: unknown;
  response: unknown;
  duration: number;
  date: Date;
};

// Log schema
const logSchema = new mongoose.Schema<TLog>(
  {
    user: { type: Schema.Types.ObjectId },
    role: { type: String },
    ip_address: { type: String },
    user_agent: { type: String },
    url: { type: String },
    method: { type: String },
    status: { type: Number },
    payload: { type: Schema.Types.Mixed },
    response: { type: Schema.Types.Mixed },
    duration: { type: Number },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

logSchema.index(
  { updated_at: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 30 * 3,
  },
);

// Log model
const Log = mongoose.model('Log', logSchema);

// Keys whose values must never be persisted (passwords, tokens, secrets, API keys).
const SENSITIVE_KEY = /pass|token|secret|authorization|api[-_]?key|cookie/i;

export const redact = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(redact);
  // Plain objects only (multer bodies have a null prototype); leave Buffers, Dates etc. alone.
  if (value === null || typeof value !== 'object') return value;
  const proto = Object.getPrototypeOf(value);
  if (proto === Object.prototype || proto === null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        SENSITIVE_KEY.test(key) ? '[REDACTED]' : redact(val),
      ]),
    );
  }
  return value;
};

// Responses arrive as JSON strings from res.json(); parse so tokens inside get redacted too.
const redactBody = (body: unknown): unknown => {
  if (typeof body !== 'string') return redact(body);
  try {
    return redact(JSON.parse(body));
  } catch {
    return body;
  }
};

// Log Middleware
const log: RequestHandler = (req, res, next) => {
  const start = Date.now();

  // Hold response body

  let responseBody: unknown;

  const originalSend = res.send;
  res.send = function (body?: unknown, ...args: unknown[]): Response {
    responseBody = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return originalSend.apply(this, [body, ...args] as any);
  };

  res.on('finish', async () => {
    try {
      if (req.method === 'GET') return;

      const token = req.headers['authorization'];
      if (!token) return;

      let _id: string | undefined;
      let role: string | undefined;

      try {
        const decoded = jwt.verify(
          token,
          config.jwt_access_secret,
        ) as TJwtPayload;
        _id = decoded._id;
        role = decoded.role;
      } catch (_err) {
        return;
      }

      // Skip if user role is "user"
      if (!_id || !role || (role && role === 'user')) return;

      await Log.create({
        user: _id,
        role: role,
        ip_address: req.ip === '::1' ? '127.0.0.1' : req.ip,
        user_agent: req.get('User-Agent') || '',
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        payload: redact(req.body),
        response: redactBody(responseBody),
        duration: Date.now() - start,
        date: new Date(),
      });
    } catch (err) {
      console.error('Log save error:', err);
    }
  });

  next();
};

export default log;

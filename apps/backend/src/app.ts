import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import helmet from 'helmet';
import path from 'path';
import config from './config';
import error from './middlewares/error.middleware';
import log from './middlewares/log.middleware';
import notfound from './middlewares/not-found.middleware';
import { globalRateLimiter } from './middlewares/rate-limit.middleware';
import sanitize from './middlewares/sanitize.middleware';
import router from './routes';

dotenv.config();
const app: Application = express();

// CORS must be first so preflight OPTIONS requests are handled before any other middleware
app.use(
  cors({
    origin: [
      config.url,
      config.adminpanel_url,
      config.website_url,
      ...config.cors_origins,
    ]?.filter(Boolean),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
);

app.use(helmet());

// Exactly one reverse proxy (nginx / Vercel edge) sits in front of the app; trusting more
// would let clients spoof X-Forwarded-For and dodge the rate limits.
app.set('trust proxy', 1);

// Apply global rate limiting
app.use(globalRateLimiter);

app.use(express.json({ limit: '1mb' }));

app.use(sanitize);

app.use(cookieParser());

// Log request middleware
app.use(log);

// Static file serving for uploads. helmet() above sends X-Content-Type-Options: nosniff on
// these responses, so an upload is never sniffed and rendered as HTML.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api', router);

// Health check endpoint for Vercel
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Static file serving for frontend (SPA)
app.use(express.static(path.join(__dirname, '../public/dist')));

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist/index.html'));
});

// Fallback for SPA routing - serves index.html for all unmatched routes
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist', 'index.html'));
});

// Error handling middleware
app.use(error);
app.use(notfound);

export default app;

/* eslint-disable no-console */
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import AppError from '../builder/app-error';
import catchAsync from '../utils/catch-async';

type TFile = {
  name: string;
  folder: string;
  size?: number;
  maxCount?: number;
  minCount?: number;
  allowedTypes?: string[];
};

// The stored extension comes from this map, never from the client's filename, so an upload
// can't become .html/.js/.svg and run same-origin from /uploads. Anything else is rejected.
export const SAFE_UPLOAD_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogv',
  'video/quicktime': '.mov',
  'video/mov': '.mov',
  'video/avi': '.avi',
  'video/x-msvideo': '.avi',
  'video/wmv': '.wmv',
  'video/x-ms-wmv': '.wmv',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/m4a': '.m4a',
  'audio/mp4': '.m4a',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    '.docx',
  'text/plain': '.txt',
};

const file = (...files: TFile[]) => {
  // 🚨 Disable file system in serverless (Vercel)
  if (process.env.VERCEL === '1') {
    return (req: Request, _res: Response, next: NextFunction) => {
      req.files = {};
      console.warn('File upload disabled in this environment');
      next();
    };
  }

  const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
      const folder = files.find((f) => f.name === file.fieldname)?.folder || '';
      const safeFolder = folder.replace(/^\/+/, ''); // remove leading slash
      const dir = path.join('uploads', safeFolder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const baseName = path.basename(
        file.originalname,
        path.extname(file.originalname),
      );
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(
        null,
        `${baseName}-${uniqueSuffix}${SAFE_UPLOAD_EXTENSIONS[file.mimetype]}`,
      );
    },
  });

  // Global max size for multer limits (max of all per-field size limits)
  const globalMaxSize = Math.max(...files.map((f) => f.size || 5_000_000));

  // File filter for validating mimetype and size per field
  const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    const config = files.find((f) => f.name === file.fieldname);
    if (!config) {
      return cb(
        new AppError(
          httpStatus.BAD_REQUEST,
          `Unexpected field "${file.fieldname}"`,
        ),
      );
    }

    if (
      !SAFE_UPLOAD_EXTENSIONS[file.mimetype] ||
      (config.allowedTypes && !config.allowedTypes.includes(file.mimetype))
    ) {
      return cb(
        new AppError(
          httpStatus.BAD_REQUEST,
          `Invalid file type for field "${file.fieldname}"`,
        ),
      );
    }

    cb(null, true);
  };

  // Setup multer upload
  const upload = multer({
    storage,
    limits: { fileSize: globalMaxSize },
    fileFilter,
  }).fields(
    files.map((f) => ({
      name: f.name,
      maxCount: f.maxCount || 1,
    })),
  );

  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err: unknown) => {
      if (err) {
        return next(
          new AppError(
            httpStatus.BAD_REQUEST,
            (err as Error).message || 'File upload error',
          ),
        );
      }

      try {
        // Check minCount
        const missing = files.filter((file) => {
          const uploaded = (
            req.files as Record<string, Express.Multer.File[]>
          )?.[file.name];
          return (
            file.minCount && (!uploaded || uploaded.length < file.minCount)
          );
        });

        if (missing.length) {
          const fields = missing.map((f) => `"${f.name}"`).join(', ');
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `At least ${missing[0].minCount} file(s) required for: ${fields}`,
          );
        }

        // Delete old files support (single or multiple)
        const oldFilePaths = (
          req as Request & { oldFilePath?: string; oldFilePaths?: string[] }
        ).oldFilePaths;
        if (oldFilePaths?.length) {
          oldFilePaths.forEach((oldPath) => {
            const fullPath = path.resolve(oldPath);
            fs.unlink(fullPath, (unlinkErr) => {
              if (
                unlinkErr &&
                (unlinkErr as { code?: string }).code !== 'ENOENT'
              ) {
                console.warn(
                  `Failed to delete old file: ${fullPath}`,
                  (unlinkErr as Error).message,
                );
              }
            });
          });
        } else {
          const oldFilePath = (req as Request & { oldFilePath?: string })
            .oldFilePath;
          if (oldFilePath) {
            const fullPath = path.resolve(oldFilePath);
            fs.unlink(fullPath, (unlinkErr) => {
              if (
                unlinkErr &&
                (unlinkErr as { code?: string }).code !== 'ENOENT'
              ) {
                console.warn(
                  `Failed to delete old file: ${fullPath}`,
                  (unlinkErr as Error).message,
                );
              }
            });
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    });
  });
};

export default file;

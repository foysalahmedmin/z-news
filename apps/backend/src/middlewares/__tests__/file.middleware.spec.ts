import express from 'express';
import fs from 'fs';
import supertest from 'supertest';
import file from '../file.middleware';

const app = express();
app.post('/upload', file({ name: 'file', folder: 'test-spec' }), (req, res) => {
  const [saved] = (req.files as Record<string, Express.Multer.File[]>).file;
  fs.unlinkSync(saved.path);
  res.json({ filename: saved.filename });
});
app.use(
  (
    err: { status?: number; message: string },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    res.status(err.status || 500).json({ message: err.message });
  },
);

afterAll(() =>
  fs.rmSync('uploads/test-spec', { recursive: true, force: true }),
);

describe('file upload middleware', () => {
  it('stores the extension of the allow-listed mimetype, not the client filename', async () => {
    const res = await supertest(app)
      .post('/upload')
      .attach('file', Buffer.from('<script>alert(1)</script>'), {
        filename: 'x.html',
        contentType: 'image/png',
      });

    expect(res.status).toBe(200);
    expect(res.body.filename).toMatch(/^x-\d+-\d+\.png$/);
  });

  it('rejects types outside the allow-list (html, svg, js)', async () => {
    for (const contentType of [
      'text/html',
      'image/svg+xml',
      'application/javascript',
    ]) {
      const res = await supertest(app)
        .post('/upload')
        .attach('file', Buffer.from('x'), { filename: 'x', contentType });
      expect(res.status).toBe(400);
    }
  });
});

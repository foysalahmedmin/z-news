import config from '../../config/env';
import { revalidateFrontend } from '../revalidate-frontend';

describe('revalidateFrontend', () => {
  const originalVercel = process.env.VERCEL;
  const originalFetch = global.fetch;

  beforeEach(() => {
    config.website_url = 'https://example.com';
    config.revalidate_secret = 'test-secret';
    delete process.env.VERCEL;
  });

  afterEach(() => {
    if (originalVercel !== undefined) {
      process.env.VERCEL = originalVercel;
    } else {
      delete process.env.VERCEL;
    }
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should not call fetch if tags are empty or config is missing', async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    await revalidateFrontend([]);
    expect(mockFetch).not.toHaveBeenCalled();

    config.website_url = '';
    await revalidateFrontend(['news']);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should trigger fetch fire-and-forget when not on Vercel', async () => {
    let resolved = false;
    const mockFetch = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolved = true;
            resolve({ ok: true, status: 200 } as Response);
          }, 50);
        }),
    );
    global.fetch = mockFetch;

    delete process.env.VERCEL;
    const promise = revalidateFrontend(['news', 'news-headline']);

    // Non-Vercel mode should return immediately without waiting for fetch promise
    await promise;
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/api/revalidate',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': 'test-secret',
        },
        body: JSON.stringify({ tags: ['news', 'headlines'] }),
      }),
    );
    expect(resolved).toBe(false);
  });

  it('should await fetch when running on Vercel', async () => {
    let resolved = false;
    const mockFetch = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolved = true;
            resolve({ ok: true, status: 200 } as Response);
          }, 50);
        }),
    );
    global.fetch = mockFetch;

    process.env.VERCEL = '1';
    await revalidateFrontend(['category']);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/api/revalidate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ tags: ['categories'] }),
      }),
    );
    expect(resolved).toBe(true);
  });
});

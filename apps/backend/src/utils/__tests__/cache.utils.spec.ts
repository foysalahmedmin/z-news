const mockStore = new Map<string, string>();
const mockRedis = {
  get: jest.fn(async (key: string) => mockStore.get(key) ?? null),
  set: jest.fn(async (key: string, value: string) => {
    mockStore.set(key, value);
  }),
  incr: jest.fn(async (key: string) => {
    const next = Number(mockStore.get(key) ?? 0) + 1;
    mockStore.set(key, String(next));
    return next;
  }),
  del: jest.fn(async (keys: string[]) =>
    keys.forEach((k) => mockStore.delete(k)),
  ),
};

jest.mock('../../config/redis', () => ({
  get cacheClient() {
    return mockRedis;
  },
}));
jest.mock('../../config/env', () => ({
  __esModule: true,
  default: {
    redis_enabled: true,
    website_url: 'https://site.test',
    revalidate_secret: 'shh',
  },
}));

import AppError from '../../builder/app-error';
import {
  invalidateCache,
  invalidateCacheByPattern,
  invalidateNamespaces,
  withCache,
} from '../cache.utils';

const fetchMock = jest.fn().mockResolvedValue({ ok: true });
global.fetch = fetchMock as unknown as typeof fetch;

beforeEach(() => mockStore.clear());

describe('withCache', () => {
  it('rethrows errors from the source function without calling it again', async () => {
    const fn = jest.fn().mockRejectedValue(new AppError(404, 'Not found'));

    await expect(withCache('news:id:1', 60, fn)).rejects.toThrow('Not found');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('falls back to the source when Redis fails', async () => {
    mockRedis.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const fn = jest.fn().mockResolvedValue({ ok: 1 });

    await expect(withCache('news:id:1', 60, fn)).resolves.toEqual({ ok: 1 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('shares one source call between concurrent misses on the same key', async () => {
    let resolve!: (v: unknown) => void;
    const fn = jest.fn(() => new Promise((r) => (resolve = r)));

    const calls = [
      withCache('news:list', 60, fn),
      withCache('news:list', 60, fn),
    ];
    await new Promise((r) => setTimeout(r, 0));
    resolve({ items: [1] });

    await expect(Promise.all(calls)).resolves.toEqual([
      { items: [1] },
      { items: [1] },
    ]);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('serves the cached value until the namespace version is bumped', async () => {
    const fn = jest
      .fn()
      .mockResolvedValueOnce('v1')
      .mockResolvedValueOnce('v2');

    await withCache('news:slug:a', 60, fn);
    await new Promise((r) => setTimeout(r, 0)); // let the fire-and-forget SET land
    await expect(withCache('news:slug:a', 60, fn)).resolves.toBe('v1');

    await invalidateCacheByPattern('news:*');
    await expect(withCache('news:slug:a', 60, fn)).resolves.toBe('v2');
    expect(mockRedis.incr).toHaveBeenCalledWith('news:ver');
  });

  it('invalidateCache deletes the versioned key', async () => {
    mockStore.set('user:ver', '4');
    await invalidateCache('user:id:1');
    expect(mockRedis.del).toHaveBeenCalledWith(['user:v4:id:1']);
  });
});

describe('invalidateNamespaces', () => {
  it('asks the frontend to revalidate the mapped tags only', async () => {
    fetchMock.mockClear();
    await invalidateNamespaces('news', 'news-headline', 'news-break', 'user');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://site.test/api/revalidate');
    expect(init.method).toBe('POST');
    expect(init.headers['x-revalidate-secret']).toBe('shh');
    expect(JSON.parse(init.body)).toEqual({
      tags: ['news', 'headlines', 'breaks'],
    });
  });

  it('does not call the frontend for namespaces without a tag', async () => {
    fetchMock.mockClear();
    await invalidateNamespaces('reaction');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

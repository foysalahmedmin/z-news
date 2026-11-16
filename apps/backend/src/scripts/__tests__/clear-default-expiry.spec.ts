import {
  DEFAULT_EXPIRY_DIFF_MS,
  DEFAULT_EXPIRY_TOLERANCE_MS,
  buildDefaultExpiryFilter,
} from '../clear-default-expiry';

describe('buildDefaultExpiryFilter', () => {
  it('should build the expected filter with 24 hours ± 5 seconds', () => {
    const filter = buildDefaultExpiryFilter();

    expect(filter.expired_at).toEqual({ $ne: null });
    expect(filter.published_at).toEqual({ $ne: null });
    expect(filter.status).toBeUndefined();

    const expectedMin = DEFAULT_EXPIRY_DIFF_MS - DEFAULT_EXPIRY_TOLERANCE_MS;
    const expectedMax = DEFAULT_EXPIRY_DIFF_MS + DEFAULT_EXPIRY_TOLERANCE_MS;

    expect(DEFAULT_EXPIRY_DIFF_MS).toBe(86400000); // 24 * 60 * 60 * 1000
    expect(DEFAULT_EXPIRY_TOLERANCE_MS).toBe(5000); // 5 * 1000
    expect(expectedMin).toBe(86395000);
    expect(expectedMax).toBe(86405000);

    expect(filter.$expr).toEqual({
      $and: [
        {
          $gte: [{ $subtract: ['$expired_at', '$published_at'] }, 86395000],
        },
        {
          $lte: [{ $subtract: ['$expired_at', '$published_at'] }, 86405000],
        },
      ],
    });
  });

  it('should include status when status parameter is passed', () => {
    const publishedFilter = buildDefaultExpiryFilter('published');
    expect(publishedFilter.status).toBe('published');

    const archivedFilter = buildDefaultExpiryFilter('archived');
    expect(archivedFilter.status).toBe('archived');
  });

  it('should correctly match time diffs inside the tolerance window', () => {
    const pub = new Date('2026-01-01T10:00:00.000Z');
    // Exactly 24h
    const expExact = new Date('2026-01-02T10:00:00.000Z');
    // 24h + 3s
    const expPlus3s = new Date('2026-01-02T10:00:03.000Z');
    // 24h - 4s
    const expMinus4s = new Date('2026-01-02T09:59:56.000Z');
    // 24h + 10s (outside tolerance)
    const expPlus10s = new Date('2026-01-02T10:00:10.000Z');
    // 1h (custom editor expiry)
    const exp1h = new Date('2026-01-01T11:00:00.000Z');

    const isMatch = (published: Date, expired: Date) => {
      const diff = expired.getTime() - published.getTime();
      return (
        diff >= DEFAULT_EXPIRY_DIFF_MS - DEFAULT_EXPIRY_TOLERANCE_MS &&
        diff <= DEFAULT_EXPIRY_DIFF_MS + DEFAULT_EXPIRY_TOLERANCE_MS
      );
    };

    expect(isMatch(pub, expExact)).toBe(true);
    expect(isMatch(pub, expPlus3s)).toBe(true);
    expect(isMatch(pub, expMinus4s)).toBe(true);
    expect(isMatch(pub, expPlus10s)).toBe(false);
    expect(isMatch(pub, exp1h)).toBe(false);
  });
});

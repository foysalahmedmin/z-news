import { Request } from 'express';
import config from '../../config/env';
import { skipServerRequests } from '../rate-limit.middleware';

describe('skipServerRequests', () => {
  const originalSecret = config.internal_api_secret;
  const originalServerKey = config.server_api_key;

  beforeEach(() => {
    config.internal_api_secret = 'super-secret-internal-token';
    config.server_api_key = 'server-key-legacy';
    delete process.env.INTERNAL_API_SECRET;
    delete process.env.SERVER_API_KEY;
  });

  afterEach(() => {
    config.internal_api_secret = originalSecret;
    config.server_api_key = originalServerKey;
  });

  it('should return true for valid x-internal-secret', () => {
    const req = {
      headers: {
        'x-internal-secret': 'super-secret-internal-token',
      },
    } as unknown as Request;

    expect(skipServerRequests(req)).toBe(true);
  });

  it('should return false for invalid x-internal-secret', () => {
    const req = {
      headers: {
        'x-internal-secret': 'wrong-secret',
      },
    } as unknown as Request;

    expect(skipServerRequests(req)).toBe(false);
  });

  it('should return false when x-internal-secret has different length without throwing', () => {
    const req = {
      headers: {
        'x-internal-secret': 'short',
      },
    } as unknown as Request;

    expect(skipServerRequests(req)).toBe(false);
  });

  it('should return false when headers are missing', () => {
    const req = {
      headers: {},
    } as unknown as Request;

    expect(skipServerRequests(req)).toBe(false);
  });

  it('should support legacy x-server-api-key', () => {
    const req = {
      headers: {
        'x-server-api-key': 'server-key-legacy',
      },
    } as unknown as Request;

    expect(skipServerRequests(req)).toBe(true);
  });
});

import { redact } from '../log.middleware';

describe('log redaction', () => {
  it('redacts password/token/secret-like keys at any depth, case-insensitively', () => {
    const body = {
      old_password: 'a',
      newPassword: 'b',
      user: { name: 'x', Access_Token: 't', nested: [{ client_secret: 's' }] },
      data: { token: 'jwt', info: { email: 'e@x.test' } },
    };

    expect(redact(body)).toEqual({
      old_password: '[REDACTED]',
      newPassword: '[REDACTED]',
      user: {
        name: 'x',
        Access_Token: '[REDACTED]',
        nested: [{ client_secret: '[REDACTED]' }],
      },
      data: { token: '[REDACTED]', info: { email: 'e@x.test' } },
    });
  });

  it('leaves non-objects alone', () => {
    expect(redact(null)).toBeNull();
    expect(redact('text')).toBe('text');
  });
});

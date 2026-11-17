import { updateSelfCommentValidationSchema } from '../comment.validator';

describe('comment.validator', () => {
  it('allows updating self comment without email', () => {
    const validData = {
      params: { id: '507f1f77bcf86cd799439011' },
      body: {
        name: 'Guest Reader',
        content: 'Updated comment content',
      },
    };
    const result = updateSelfCommentValidationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('allows updating self comment with valid email', () => {
    const validData = {
      params: { id: '507f1f77bcf86cd799439011' },
      body: {
        name: 'Guest Reader',
        email: 'reader@example.com',
        content: 'Updated comment content',
      },
    };
    const result = updateSelfCommentValidationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

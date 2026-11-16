import { sanitizeArticleHtml } from '../sanitize-html';

describe('sanitizeArticleHtml', () => {
  it('removes scripts, event handlers and javascript: URLs', () => {
    const dirty =
      '<p>Hi<script>alert(1)</script></p>' +
      '<img src="https://cdn.test/a.png" onerror="alert(1)" alt="a">' +
      '<a href="javascript:alert(1)">x</a>' +
      '<iframe src="https://evil.test/x"></iframe>' +
      '<svg onload="alert(1)"></svg>';

    const clean = sanitizeArticleHtml(dirty);

    expect(clean).not.toMatch(
      /script|onerror|onload|javascript:|evil\.test|svg/i,
    );
    expect(clean).toContain('<p>Hi</p>');
    expect(clean).toContain('<img src="https://cdn.test/a.png" alt="a" />');
  });

  it('keeps what the BlockNote editor produces', () => {
    const html =
      '<h2>Title</h2><p style="text-align: center"><strong>b</strong> <em>i</em> <u>u</u> <s>s</s></p>' +
      '<ul><li>one</li></ul><blockquote>q</blockquote><pre><code>x</code></pre>' +
      '<table><tbody><tr><td colspan="2">c</td></tr></tbody></table>' +
      '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%"><iframe src="https://www.youtube.com/embed/abc" allowfullscreen></iframe></div>' +
      '<video controls src="https://cdn.test/v.mp4"></video>';

    const clean = sanitizeArticleHtml(html);

    for (const kept of [
      '<h2>Title</h2>',
      'text-align:center',
      '<strong>b</strong>',
      '<li>one</li>',
      '<td colspan="2">c</td>',
      'src="https://www.youtube.com/embed/abc"',
      '<video controls src="https://cdn.test/v.mp4">',
    ]) {
      expect(clean).toContain(kept);
    }
  });

  it('adds rel=noopener to links and is idempotent', () => {
    const once = sanitizeArticleHtml(
      '<a href="https://x.test" target="_blank">x</a>',
    );
    expect(once).toContain('rel="noopener noreferrer"');
    expect(sanitizeArticleHtml(once)).toBe(once);
  });
});

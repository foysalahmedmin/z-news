/* eslint-disable no-console */
import config from '../config/env';

// Cache namespace -> Next.js cache tag (contract with apps/frontend /api/revalidate).
const NAMESPACE_TAGS: Record<string, string> = {
  news: 'news',
  'news-headline': 'headlines',
  'news-break': 'breaks',
  category: 'categories',
  event: 'events',
};

// On Vercel serverless, background promises freeze once the response is sent, so we await
// with the existing 3s timeout. On long-running servers, it remains fire-and-forget.
export const revalidateFrontend = async (
  namespaces: string[],
): Promise<void> => {
  const tags = [
    ...new Set(namespaces.map((ns) => NAMESPACE_TAGS[ns]).filter(Boolean)),
  ];
  if (!tags.length || !config.website_url || !config.revalidate_secret) return;

  const revalidationPromise = fetch(
    `${config.website_url.replace(/\/+$/, '')}/api/revalidate`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': config.revalidate_secret,
      },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(3000),
    },
  )
    .then((res) => {
      if (!res.ok) console.warn(`Frontend revalidation failed: ${res.status}`);
    })
    .catch((err: Error) =>
      console.warn('Frontend revalidation failed:', err.message),
    );

  if (process.env.VERCEL) {
    await revalidationPromise;
  }
};

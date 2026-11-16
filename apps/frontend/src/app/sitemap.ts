import { URLS } from "@/config";
import { fetchCategories } from "@/services/category.service";
import { fetchEvents } from "@/services/event.service";
import { fetchBulkNews } from "@/services/news.service";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

const PAGE_SIZE = 100; // API maximum per page

type TPage<T> = { data?: T[]; meta?: { total?: number } };

// Reads page 1 for the total, then the remaining pages (up to maxPages) in
// parallel; sequential reads of a large archive exceed the build's 60 s limit.
async function collect<T>(
  fetchPage: (page: number) => Promise<TPage<T>>,
  maxPages: number,
): Promise<T[]> {
  const first = await fetchPage(1);
  const pages = Math.min(
    maxPages,
    Math.ceil((first.meta?.total ?? 0) / PAGE_SIZE),
  );
  const rest = await Promise.all(
    Array.from({ length: Math.max(pages - 1, 0) }, (_, i) => fetchPage(i + 2)),
  );
  return [first, ...rest].flatMap((res) => res.data ?? []);
}

// shortcut: lists only the 2,000 newest articles (20 API calls per hourly
// regeneration); split into generateSitemaps() chunks to cover the archive.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, categories, events] = await Promise.all([
    collect(
      (page) =>
        fetchBulkNews({
          page,
          limit: PAGE_SIZE,
          sort: "-published_at",
          fields: "slug,published_at", // keeps each page ~25 KB instead of ~450 KB
        }),
      20,
    ),
    collect((page) => fetchCategories({ page, limit: PAGE_SIZE }), 5),
    collect((page) => fetchEvents({ page, limit: PAGE_SIZE }), 5),
  ]);

  const url = (path: string, slug: string) =>
    `${URLS.app}/${path}/${encodeURIComponent(slug)}`;

  return [
    { url: URLS.app, changeFrequency: "hourly", priority: 1 },
    ...news
      .filter((item) => item.slug)
      .map((item) => ({
        url: url("news", item.slug),
        lastModified: item.published_at,
      })),
    ...categories
      .filter((item) => item.slug)
      .map((item) => ({ url: url("category", item.slug) })),
    ...events
      .filter((item) => item.slug)
      .map((item) => ({ url: url("event", item.slug) })),
  ];
}

import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

// Cache tags used by the public fetches in src/services/*.
const TAGS = ["news", "headlines", "breaks", "categories", "events"];

const isValidSecret = (given: string | null) => {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

// Called by the backend after it changes public content:
// POST /api/revalidate, header x-revalidate-secret, body { "tags": string[] }.
export async function POST(request: NextRequest) {
  if (!isValidSecret(request.headers.get("x-revalidate-secret"))) {
    return Response.json({ message: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tags: unknown = body?.tags;
  if (
    !Array.isArray(tags) ||
    tags.length === 0 ||
    !tags.every((tag) => typeof tag === "string" && TAGS.includes(tag))
  ) {
    return Response.json(
      { message: `"tags" must be a non-empty subset of: ${TAGS.join(", ")}` },
      { status: 400 },
    );
  }

  // expire: 0 -> the next request blocks on fresh data instead of being
  // served the stale entry (the docs' recommendation for webhooks).
  for (const tag of new Set(tags as string[])) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: [...new Set(tags)], now: Date.now() });
}

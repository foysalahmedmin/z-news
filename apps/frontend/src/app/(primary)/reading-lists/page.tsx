import { fetchPublicReadingLists } from "@/services/bookmark.service";
import type { TReadingList } from "@/types/bookmark.type";
import { ListChecks, User as UserIcon } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

export const metadata = {
  title: "Public Reading Lists — Z-News",
  description: "Browse reading lists the community has made public.",
};

// `list.user` is typed as a plain id string on `TReadingList`, but
// `getPublicReadingLists` always populates it with `"name email image"` —
// narrowed at runtime here rather than trusting the static type, same as
// the `/user/reading-lists/[id]` detail page does.
const getOwnerName = (
  user: TReadingList["user"],
): string | undefined => {
  const value = user as unknown as string | { name?: string } | undefined;
  return value && typeof value === "object" ? value.name : undefined;
};

// Public browse page for reading lists — anyone can load this page and its
// data (the backend's `GET /reading-list/public` route carries no `auth()`
// middleware). The "view" link below points at
// `/user/reading-lists/[id]`, which — unlike the backend route — IS gated:
// apps/frontend/src/proxy.ts redirects any signed-out visitor hitting
// `/user/:path*` (this route included) to `/auth/sign-in` first. So a
// logged-out visitor can browse this page but gets bounced to sign-in
// before actually seeing a list's contents.
const PublicReadingListsPage = async () => {
  let readingLists: TReadingList[] = [];
  try {
    const res = await fetchPublicReadingLists(20);
    readingLists = res?.data ?? [];
  } catch {
    readingLists = [];
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Public Reading Lists</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Curated article collections shared by the community.
        </p>
      </div>

      {readingLists.length === 0 ? (
        <div className="bg-card flex flex-col items-center justify-center gap-2 rounded-2xl border p-12 text-center shadow-sm">
          <ListChecks className="text-muted-foreground h-10 w-10" />
          <p className="font-medium">No public reading lists yet</p>
          <p className="text-muted-foreground text-sm">
            Check back soon to see collections shared by other readers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {readingLists.map((list) => {
            const count = list.bookmark_count ?? list.bookmarks?.length ?? 0;
            const ownerName = getOwnerName(list.user);

            return (
              <Link
                key={list._id}
                href={`/user/reading-lists/${list._id}`}
                className="bg-card flex flex-col gap-3 rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h2 className="line-clamp-1 text-lg font-semibold">
                  {list.name}
                </h2>
                {list.description && (
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {list.description}
                  </p>
                )}
                <div className="text-muted-foreground mt-auto flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <ListChecks className="size-3.5" />
                    {count} article{count === 1 ? "" : "s"}
                  </span>
                  {ownerName && (
                    <span className="flex items-center gap-1">
                      <UserIcon className="size-3.5" />
                      {ownerName}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default PublicReadingListsPage;

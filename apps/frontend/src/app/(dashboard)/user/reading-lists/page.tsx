"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { fetchMyReadingLists } from "@/services/bookmark.service";
import { useQuery } from "@tanstack/react-query";
import { ListChecks, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ReadingListAddModal from "./_components/ReadingListAddModal";

export default function UserReadingListsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["my-reading-lists"],
    queryFn: () => fetchMyReadingLists(),
  });

  const readingLists = data?.data || [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">
            Reading Lists
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Organize your saved articles into lists.
          </p>
        </div>
        <Button type="button" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="size-4" /> Create new list
        </Button>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">
          Loading reading lists…
        </p>
      ) : readingLists.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            You haven&apos;t created any reading lists yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {readingLists.map((list) => {
            const count = list.bookmark_count ?? list.bookmarks?.length ?? 0;

            return (
              <Link key={list._id} href={`/user/reading-lists/${list._id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-3 py-5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-foreground line-clamp-1 text-lg font-semibold">
                        {list.name}
                      </h2>
                      <Badge
                        className={
                          list.is_public
                            ? undefined
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {list.is_public ? "Public" : "Private"}
                      </Badge>
                    </div>
                    {list.description && (
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {list.description}
                      </p>
                    )}
                    <div className="text-muted-foreground mt-auto flex items-center gap-1 text-xs">
                      <ListChecks className="size-3.5" />
                      {count} article{count === 1 ? "" : "s"}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <ReadingListAddModal
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
      />
    </div>
  );
}

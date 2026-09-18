"use client";

import { Button } from "@/components/ui/Button";
import type { TColumn, TState } from "@/components/ui/DataTable";
import DataTable from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import type { TNewsHeadline, TStatus } from "@/types/admin-news-headline.type";
import { Edit, Trash } from "lucide-react";
import React from "react";

// Ported from this app's own Events page's `EventsDataTableSection`
// (apps/frontend's `(dashboard)/admin/events/_components/EventsDataTableSection`).
// No Eye/view or Featured-switch column here — News Headlines has no public
// detail page of its own and no featured concept, just Edit/Delete actions
// as specified for this task.
type NewsHeadlineDataTableSectionProps = {
  data?: TNewsHeadline[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (row: TNewsHeadline) => void;
  onDelete: (row: TNewsHeadline) => void;
  state: TState;
};

// Same status color map used by this app's News Articles table
// (`NewsArticlesDataTableSection`), kept consistent across admin tables.
const statusStyles: Record<TStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  scheduled: "bg-purple-100 text-purple-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800",
};

const formatDateTime = (value?: Date | string) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const NewsHeadlineDataTableSection: React.FC<
  NewsHeadlineDataTableSectionProps
> = ({ data = [], isLoading, isError, onEdit, onDelete, state }) => {
  const columns: TColumn<TNewsHeadline>[] = [
    {
      name: "News",
      field: "news",
      isSearchable: true,
      // `TColumn<T>`'s `K` defaults to the full `keyof T` union when the
      // array itself is annotated `TColumn<TNewsHeadline>[]` (same as this
      // app's Events/News Articles tables), so `cell`'s static type here is
      // the union of every field's type, not just `news`'s. Cast to the
      // real per-column type first (same convention News Articles'
      // `NewsArticlesDataTableSection` uses for its date columns) instead
      // of narrowing the wide union, which would leave `Date` (from
      // published_at/expired_at) mixed in and break member access.
      cell: ({ cell }) => {
        const news = cell as TNewsHeadline["news"];
        if (!news) return <span>-</span>;
        // The list endpoint populates `news` as `{_id, title, slug}`; fall
        // back to the bare id if it ever comes back unpopulated.
        if (typeof news === "string") {
          return (
            <span className="text-muted-foreground font-mono text-xs">
              {news}
            </span>
          );
        }
        return <span className="font-medium">{news.title}</span>;
      },
    },
    {
      name: "Status",
      field: "status",
      isSortable: true,
      cell: ({ cell }) => {
        const status = cell as TStatus | undefined;
        if (!status) return null;
        return (
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-medium capitalize",
              statusStyles[status] || "bg-gray-100 text-gray-800",
            )}
          >
            {status}
          </span>
        );
      },
    },
    {
      name: "Published At",
      field: "published_at",
      isSortable: true,
      cell: ({ cell }) => (
        <span>{formatDateTime(cell as Date | string | undefined)}</span>
      ),
    },
    {
      name: "Expired At",
      field: "expired_at",
      isSortable: true,
      cell: ({ cell }) => (
        <span>{formatDateTime(cell as Date | string | undefined)}</span>
      ),
    },
    {
      style: { width: "120px", textAlign: "center" },
      name: "Actions",
      field: "_id",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center gap-2">
          <Button
            onClick={() => onEdit(row)}
            size={"sm"}
            variant="outline"
            shape={"icon"}
          >
            <Edit className="size-4" />
          </Button>
          <Button
            onClick={() => onDelete(row)}
            className="[--accent:red]"
            size={"sm"}
            variant="outline"
            shape={"icon"}
          >
            <Trash className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div>
      <DataTable
        status={isLoading ? "loading" : isError ? "error" : "success"}
        columns={columns}
        data={data || []}
        config={{
          isSearchProcessed: true,
          isSortProcessed: true,
          isPaginationProcessed: true,
        }}
        state={state}
      />
    </div>
  );
};

export default NewsHeadlineDataTableSection;

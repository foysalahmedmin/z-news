"use client";

import { Button } from "@/components/ui/Button";
import type { TColumn, TState } from "@/components/ui/DataTable";
import DataTable from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import type { TNewsBreak, TStatus } from "@/types/admin-news-break.type";
import { Edit, Trash } from "lucide-react";
import React from "react";

// Mirrors apps/frontend's `admin/events/_components/EventsDataTableSection`.
// News-Break has no dedicated "view" route (single-page modal CRUD only, per
// the plan), so unlike Events' table this only exposes Edit/Delete actions.
type NewsBreakDataTableSectionProps = {
  data?: TNewsBreak[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (row: TNewsBreak) => void;
  onDelete: (row: TNewsBreak) => void;
  state: TState;
};

// `TNewsBreak.news` is typed as a plain string ObjectId, but
// `news-break.repository.ts`'s `findPaginated`/`findById` populate it with
// `{ path: 'news', select: '_id title slug' }`, so the value actually
// received here at runtime is an object. Handle both shapes defensively.
type TPopulatedNews = { _id: string; title?: string; slug?: string };

const formatDateCell = (cell?: Date | string) => {
  if (!cell) return <div>-</div>;
  try {
    return (
      <div>
        {new Date(cell).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </div>
    );
  } catch {
    return <div>-</div>;
  }
};

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800",
};

const NewsBreakDataTableSection: React.FC<NewsBreakDataTableSectionProps> = ({
  data = [],
  isLoading,
  isError,
  onEdit,
  onDelete,
  state,
}) => {
  const columns: TColumn<TNewsBreak>[] = [
    {
      name: "News",
      field: "news",
      cell: ({ cell }) => {
        const value = cell as unknown as string | TPopulatedNews | undefined;
        if (!value) return <div>-</div>;
        if (typeof value === "object") {
          return (
            <div className="max-w-xs truncate">
              {value.title || value._id}
            </div>
          );
        }
        return <div className="max-w-xs truncate">{value}</div>;
      },
    },
    {
      name: "Status",
      field: "status",
      isSortable: true,
      cell: ({ cell }) => {
        const status = cell as TStatus | null | undefined;
        if (!status) return null;

        return (
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-medium",
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
      cell: ({ cell }) => formatDateCell(cell),
    },
    {
      name: "Expired At",
      field: "expired_at",
      isSortable: true,
      cell: ({ cell }) => formatDateCell(cell),
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

export default NewsBreakDataTableSection;

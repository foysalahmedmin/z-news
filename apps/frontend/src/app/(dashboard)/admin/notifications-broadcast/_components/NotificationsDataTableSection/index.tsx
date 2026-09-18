"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { TColumn, TState } from "@/components/ui/DataTable";
import DataTable from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import type { TNotification } from "@/types/admin-notification.type";
import { Trash } from "lucide-react";
import React from "react";

// Past-broadcasts list for the /admin/notifications-broadcast composer page.
// Mirrors EventsDataTableSection's DataTable usage, trimmed to this page's
// only list action (delete) — there's no edit/view flow for a sent
// broadcast, so no Edit/Eye buttons here.
type NotificationsDataTableSectionProps = {
  data?: TNotification[];
  isLoading: boolean;
  isError: boolean;
  onDelete: (row: TNotification) => void;
  state: TState;
};

const priorityBadgeClass = (priority?: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "low":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

const NotificationsDataTableSection: React.FC<
  NotificationsDataTableSectionProps
> = ({ data = [], isLoading, isError, onDelete, state }) => {
  const columns: TColumn<TNotification>[] = [
    { name: "Title", field: "title", isSortable: true, isSearchable: true },
    {
      name: "Type",
      field: "type",
      isSortable: true,
      cell: ({ cell }) => <span>{cell?.toString()}</span>,
    },
    {
      name: "Priority",
      field: "priority",
      isSortable: true,
      cell: ({ cell }) => (
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium capitalize",
            priorityBadgeClass(cell?.toString()),
          )}
        >
          {cell?.toString() || "medium"}
        </span>
      ),
    },
    {
      name: "Channels",
      field: "channels",
      cell: ({ cell }) => (
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(cell) ? cell : []).map((channel) => (
            <Badge key={channel} className="capitalize">
              {channel}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      name: "Status",
      field: "status",
      isSortable: true,
      cell: ({ cell }) => (
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium capitalize",
            cell === "active"
              ? "bg-green-100 text-green-800"
              : cell === "archived"
                ? "bg-gray-100 text-gray-800"
                : "bg-red-100 text-red-800",
          )}
        >
          {cell?.toString() || "active"}
        </span>
      ),
    },
    {
      name: "Created At",
      field: "created_at",
      isSortable: true,
      cell: ({ cell }) => (
        <span>
          {typeof cell === "string" ? new Date(cell).toLocaleString() : "-"}
        </span>
      ),
    },
    {
      style: { width: "100px", textAlign: "center" },
      name: "Actions",
      field: "_id",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center gap-2">
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

export default NotificationsDataTableSection;

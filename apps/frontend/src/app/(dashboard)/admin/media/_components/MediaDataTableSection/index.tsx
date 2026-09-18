"use client";

import { Button } from "@/components/ui/Button";
import type { TColumn, TState } from "@/components/ui/DataTable";
import DataTable from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import type { TMedia, TMediaUploadedBy } from "@/types/media.type";
import { Edit, File, FileText, Image, Music, Trash, Video } from "lucide-react";
import React from "react";

// Mirrors apps/frontend's Files admin UI (see
// app/(dashboard)/admin/files/_components/FilesDataTableSection/index.tsx)
// for the preview/type-icon/status-badge conventions. Unlike File, Media
// has no dedicated detail ([id]) route, so Actions only offers Edit/Delete
// — no "view" (Eye) button.
type MediaDataTableSectionProps = {
  data?: TMedia[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (row: TMedia) => void;
  onDelete: (row: TMedia) => void;
  state: TState;
};

const getMediaTypeIcon = (type: string) => {
  switch (type) {
    case "image":
      return Image;
    case "video":
      return Video;
    case "audio":
      return Music;
    case "document":
      return FileText;
    default:
      return File;
  }
};

const MediaDataTableSection: React.FC<MediaDataTableSectionProps> = ({
  data = [],
  isLoading,
  isError,
  onEdit,
  onDelete,
  state,
}) => {
  const columns: TColumn<TMedia>[] = [
    {
      name: "Preview",
      field: "url",
      cell: ({ row }) => {
        const Icon = getMediaTypeIcon(row.type);
        return row.type === "image" ? (
          <img
            src={row.thumbnail_url || row.url}
            alt={row.alt_text || row.title}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
            <Icon className="text-muted-foreground h-5 w-5" />
          </div>
        );
      },
    },
    { name: "Title", field: "title", isSortable: true, isSearchable: true },
    {
      name: "Type",
      field: "type",
      isSortable: true,
      cell: ({ cell }) => (
        <span className="bg-muted rounded-full px-2 py-1 text-xs font-medium capitalize">
          {cell as string}
        </span>
      ),
    },
    {
      name: "Status",
      field: "status",
      isSortable: true,
      cell: ({ cell }) => (
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium",
            cell === "active"
              ? "bg-green-100 text-green-800"
              : cell === "archived"
                ? "bg-gray-100 text-gray-800"
                : "bg-red-100 text-red-800",
          )}
        >
          {cell?.toString()}
        </span>
      ),
    },
    {
      name: "Tags",
      field: "tags",
      cell: ({ cell }) => {
        const tags = (cell as string[]) || [];
        if (tags.length === 0) {
          return <span className="text-muted-foreground text-sm">N/A</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-muted rounded-full px-2 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-muted-foreground text-xs">
                +{tags.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      name: "Uploaded By",
      field: "uploaded_by",
      cell: ({ cell }) => {
        const uploadedBy = cell as TMediaUploadedBy | string;
        return (
          <span className="text-sm">
            {typeof uploadedBy === "string"
              ? uploadedBy
              : uploadedBy?.name || "N/A"}
          </span>
        );
      },
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

export default MediaDataTableSection;

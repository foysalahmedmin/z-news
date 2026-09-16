import { Button } from "@/components/ui/Button";
import type { TColumn, TState } from "@/components/ui/DataTable";
import DataTable from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import type { TFile } from "@/types/file.type";
import type { TBreadcrumbs } from "@/types/route-menu.type";
import {
  Edit,
  Eye,
  File,
  FileText,
  Image,
  Music,
  Trash,
  Video,
} from "lucide-react";
import React from "react";
import { Link } from "react-router";

type FilesDataTableSectionProps = {
  data?: TFile[];
  breadcrumbs: TBreadcrumbs[];
  isLoading: boolean;
  isError: boolean;
  onAdd: () => void;
  onEdit: (row: TFile) => void;
  onDelete: (row: TFile) => void;
  state: TState;
};

const FilesDataTableSection: React.FC<FilesDataTableSectionProps> = ({
  data = [],
  breadcrumbs,
  isLoading,
  isError,
  onEdit,
  onDelete,
  state,
}) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return Image;
      case "video":
        return Video;
      case "audio":
        return Music;
      case "pdf":
      case "doc":
      case "txt":
        return FileText;
      default:
        return File;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const columns: TColumn<TFile>[] = [
    {
      name: "Preview",
      field: "metadata.file_type" as any,
      cell: ({ row }) => {
        const Icon = getFileIcon(row.metadata?.file_type || "file");
        return (
          <div className="flex items-center gap-2">
            {row.metadata?.file_type === "image" ? (
              <img
                src={row.url}
                alt={row.name}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                <Icon className="text-muted-foreground h-5 w-5" />
              </div>
            )}
          </div>
        );
      },
    },
    { name: "Name", field: "name", isSortable: true, isSearchable: true },
    {
      name: "Type",
      field: "metadata.file_type" as any,
      isSortable: true,
      cell: ({ row }) => (
        <span className="text-sm capitalize">
          {row.metadata?.file_type || "N/A"}
        </span>
      ),
    },
    {
      name: "Size",
      field: "size",
      isSortable: true,
      cell: ({ cell }) => (
        <span className="text-sm">{formatFileSize(cell as number)}</span>
      ),
    },
    {
      name: "Extension",
      field: "metadata.extension" as any,
      isSortable: true,
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.metadata?.extension || "N/A"}
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
      name: "Author",
      field: "author",
      cell: ({ cell }) => (
        <span className="text-sm">{(cell as any)?.name || "N/A"}</span>
      ),
    },
    {
      style: { width: "150px", textAlign: "center" },
      name: "Actions",
      field: "_id",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center gap-2">
          <Link
            to={`/files/${row._id}`}
            state={{
              file: row,
              breadcrumbs: [
                ...(breadcrumbs || []),
                { name: row.name, path: `/files/${row._id}` },
              ],
            }}
          >
            <Button
              asChild={true}
              className="[--accent:green]"
              size={"sm"}
              variant="outline"
              shape={"icon"}
            >
              <Eye className="size-4" />
            </Button>
          </Link>
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

export default FilesDataTableSection;

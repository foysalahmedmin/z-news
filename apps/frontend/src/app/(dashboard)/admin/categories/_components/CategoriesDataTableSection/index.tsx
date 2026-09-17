"use client";

import { Button } from "@/components/ui/Button";
import type { TColumn, TState } from "@/components/ui/DataTable";
import DataTable from "@/components/ui/DataTable";
import Icon from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";
import type { TCategory } from "@/types/admin-category.type";
import { Edit, Eye, Trash } from "lucide-react";
import Link from "next/link";
import React from "react";

// Ported from apps/adminpanel's
// `components/(common)/categories-page/CategoriesDataTableSection`. The
// original also accepted a `breadcrumbs` prop and an `onAdd` prop, but
// neither was actually read inside the component body — dropped here as
// dead props (matching the same cleanup already done when porting the
// Events list page). react-router's `<Link state={...}>` (used to hand off
// the row's category + breadcrumb trail without a refetch) has no Next.js
// equivalent, so the details page at `categories/[id]` now refetches the
// category by id instead — the Link here just points at the plain route.
type CategoriesDataTableSectionProps = {
  data?: TCategory[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (row: TCategory) => void;
  onDelete: (row: TCategory) => void;
  onToggleFeatured: (row: TCategory) => void;
  state: TState;
};

const CategoriesDataTableSection: React.FC<CategoriesDataTableSectionProps> = ({
  data = [],
  isLoading,
  isError,
  onEdit,
  onDelete,
  onToggleFeatured,
  state,
}) => {
  const columns: TColumn<TCategory>[] = [
    { name: "Sequence", field: "sequence", isSortable: true },
    {
      name: "Icon",
      field: "icon",
      cell: ({ cell }) => (
        <span>
          <Icon name={typeof cell === "string" && cell ? cell : "blocks"} />
        </span>
      ),
    },
    { name: "Name", field: "name", isSortable: true, isSearchable: true },
    { name: "Slug", field: "slug", isSortable: true },
    {
      name: "Layout",
      field: "layout",
      isSortable: true,
      cell: ({ cell }) => <span>{cell?.toString()}</span>,
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
              : "bg-red-100 text-red-800",
          )}
        >
          {cell !== "active" ? "Inactive" : "Active"}
        </span>
      ),
    },
    {
      name: "Featured",
      field: "is_featured",
      isSortable: true,
      cell: ({ cell, row }) => (
        <div>
          <Switch
            disabled={isLoading}
            onChange={() => onToggleFeatured(row)}
            checked={cell === true}
          />
        </div>
      ),
    },
    {
      style: { width: "150px", textAlign: "center" },
      name: "Actions",
      field: "_id",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center gap-2">
          <Link href={`/admin/categories/${row._id}`}>
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

export default CategoriesDataTableSection;

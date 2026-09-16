import { Button } from "@/components/ui/Button";
import type { TColumn } from "@/components/ui/DataTable";
import DataTable from "@/components/ui/DataTable";
import Icon from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";
import type { TCategory } from "@/types/category.type";
import type { TBreadcrumbs } from "@/types/route-menu.type";
import { Edit, Eye, Trash } from "lucide-react";
import React from "react";
import { Link } from "react-router";

type CategoryDataTableSectionProps = {
  data?: TCategory[];
  breadcrumbs: TBreadcrumbs[];
  isLoading: boolean;
  isError: boolean;
  onAdd: () => void;
  onEdit: (row: TCategory) => void;
  onDelete: (row: TCategory) => void;
  onToggleFeatured: (row: TCategory) => void;
};

const CategoryDataTableSection: React.FC<CategoryDataTableSectionProps> = ({
  data = [],
  breadcrumbs,
  isLoading,
  isError,
  onAdd,
  onEdit,
  onDelete,
  onToggleFeatured,
}) => {
  const columns: TColumn<TCategory>[] = [
    { name: "Sequence", field: "sequence", isSortable: true },
    {
      name: "Icon",
      field: "icon",
      cell: ({ cell }) => (
        <span>
          <Icon name={cell} />
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
          <Button
            asChild={true}
            className="[--accent:green]"
            size={"sm"}
            variant="outline"
            shape={"icon"}
          >
            <Link
              to={`/categories/${row._id}`}
              state={{
                category: row,
                breadcrumbs: [
                  ...(breadcrumbs || []),
                  { name: row.name, path: `/categories/${row._id}` },
                ],
              }}
            >
              <Eye className="size-4" />
            </Link>
          </Button>
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
          isSearchProcessed: false,
          isSortProcessed: false,
          isPaginationProcessed: false,
        }}
        slot={
          <Button variant="outline" onClick={() => onAdd()}>
            Add Sub Category
          </Button>
        }
      />
    </div>
  );
};

export default CategoryDataTableSection;

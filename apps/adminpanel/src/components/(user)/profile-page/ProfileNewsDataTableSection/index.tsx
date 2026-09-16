import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { TColumn, TState } from "@/components/ui/DataTable";
import DataTable from "@/components/ui/DataTable";
import { Switch } from "@/components/ui/Switch";
import { ENV } from "@/config";
import useUser from "@/hooks/states/useUser";
import { cn } from "@/lib/utils";
import type { TNews, TStatus } from "@/types/news.type";
import type { TBreadcrumbs } from "@/types/route-menu.type";
import { getThumbnail } from "@/utils/getThumbnail";
import { Earth, Edit, Eye, Tag, Trash, User } from "lucide-react";
import React from "react";
import { Link } from "react-router";

type NewsArticlesDataTableSectionProps = {
  data?: TNews[];
  breadcrumbs: TBreadcrumbs[];
  isLoading: boolean;
  isError: boolean;
  onDelete: (row: TNews) => void;
  onToggleFeatured: (row: TNews) => void;
  state: TState;
};

const NewsArticlesDataTableSection: React.FC<
  NewsArticlesDataTableSectionProps
> = ({
  data = [],
  breadcrumbs,
  isLoading,
  isError,
  onDelete,
  onToggleFeatured,
  state,
}) => {
  const { user } = useUser();
  const { info } = user || {};

  const columns: TColumn<TNews>[] = [
    {
      name: "News",
      field: "_id",
      isSortable: true,
      isSearchable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="aspect-square h-20 flex-shrink-0 overflow-hidden rounded">
            <img
              className="size-full object-cover"
              src={getThumbnail(row?.thumbnail?.url, row?.youtube)}
              alt=""
            />
          </div>
          <div className="flex-1 space-y-1">
            <Link
              className="group block"
              to={
                row.status === "published"
                  ? `${ENV.app_url}/news/${row.slug}`
                  : "#"
              }
            >
              <h3 className="text-base font-bold group-hover:underline">
                {row.title}
              </h3>
              <p className="text-sm">{row.slug}</p>
            </Link>
            <div className="flex items-center">
              <Badge className="bg-muted text-foreground flex w-fit items-center gap-2 px-2 py-1 text-xs">
                <Tag className="size-4" />
                <span className="leading-none">{row?.category?.name}</span>
              </Badge>
              <Badge className="bg-muted text-foreground flex w-fit items-center gap-2 px-2 py-1 text-xs">
                <User className="size-4" />
                <span className="leading-none">{row?.author?.name}</span>
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Published At",
      field: "published_at",
      isSortable: true,
      cell: ({ cell }) => {
        if (!cell) return <div>-</div>;
        try {
          return (
            <div>
              {new Date(cell as string).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          );
        } catch {
          return <div>-</div>;
        }
      },
    },
    {
      name: "Layout",
      field: "layout",
      isSortable: true,
      cell: ({ cell }) => {
        if (cell == null || cell === undefined) return <div>-</div>;
        try {
          return <div>{String(cell)}</div>;
        } catch {
          return <div>-</div>;
        }
      },
    },
    {
      name: "Status",
      field: "status",
      isSortable: true,
      cell: ({ cell }) => {
        const statusStyles = {
          draft: "bg-gray-100 text-gray-800",
          pending: "bg-yellow-100 text-yellow-800",
          scheduled: "bg-purple-100 text-purple-800",
          published: "bg-green-100 text-green-800",
          archived: "bg-red-100 text-red-800",
        };

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
      name: "Featured",
      field: "is_featured",
      isSortable: true,
      cell: ({ cell, row }) => {
        // Handle various possible values for is_featured
        const isChecked =
          cell === true ||
          cell === "true" ||
          (typeof cell === "number" && cell === 1) ||
          (typeof cell === "string" && cell.toLowerCase() === "true");
        return (
          <div>
            <Switch
              disabled={isLoading}
              onChange={() => onToggleFeatured(row)}
              checked={!!isChecked}
            />
          </div>
        );
      },
    },
    {
      style: { width: "150px", textAlign: "center" },
      name: "Actions",
      field: "_id",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center gap-2">
          {["published"].includes(row?.status || "") && (
            <Link to={`${ENV.app_url}/news/${row?.slug}`} target="_blank">
              <Button
                asChild={true}
                className={cn("[--accent:blue]", {
                  disabled: row?.status !== "published",
                })}
                size={"sm"}
                variant="outline"
                shape={"icon"}
              >
                <Earth className="flex size-4 items-center justify-center" />
              </Button>
            </Link>
          )}
          {(["super-admin", "admin", "editor"].includes(info?.role || "") ||
            row.author?._id === info?._id) && (
            <Link
              to={
                info?.role !== "admin" && row.author?._id !== info?._id
                  ? "#"
                  : `/news-articles/${row._id}`
              }
              state={{
                category: row,
                breadcrumbs: [
                  ...(breadcrumbs || []),
                  { name: row.title, path: `/news-articles/${row._id}` },
                ],
              }}
            >
              <Button
                asChild={true}
                className={cn("[--accent:green]", {
                  disabled:
                    info?.role !== "admin" && row.author?._id !== info?._id,
                })}
                size={"sm"}
                variant="outline"
                shape={"icon"}
              >
                <Eye className="flex size-4 items-center justify-center" />
              </Button>
            </Link>
          )}
          {(["super-admin", "admin", "editor"].includes(info?.role || "") ||
            row.author?._id === info?._id) && (
            <Link
              to={
                info?.role !== "admin" && row.author?._id !== info?._id
                  ? "#"
                  : `/news-articles/edit/${row._id}`
              }
              state={{
                category: row,
                breadcrumbs: [
                  ...(breadcrumbs || []),
                  { name: row.title, path: `/news-articles/${row._id}` },
                ],
              }}
            >
              <Button
                className={cn("", {
                  disabled:
                    info?.role !== "admin" && row.author?._id !== info?._id,
                })}
                asChild={true}
                size={"sm"}
                variant="outline"
                shape={"icon"}
              >
                <Edit className="size-4" />
              </Button>
            </Link>
          )}
          {(["super-admin", "admin"].includes(info?.role || "") ||
            row.author?._id === info?._id) && (
            <Button
              disabled={info?.role !== "admin" && row.author?._id !== info?._id}
              onClick={() => onDelete(row)}
              className="[--accent:red]"
              size={"sm"}
              variant="outline"
              shape={"icon"}
            >
              <Trash className="size-4" />
            </Button>
          )}
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

export default NewsArticlesDataTableSection;

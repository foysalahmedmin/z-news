"use client";

import { Button } from "@/components/ui/Button";
import type { TColumn, TState } from "@/components/ui/DataTable";
import DataTable from "@/components/ui/DataTable";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";
import type {
  TBadge,
  TBadgeCategory,
  TBadgeCriteria,
  TBadgeRarity,
} from "@/types/admin-badge.type";
import { Edit, Trash } from "lucide-react";
import React from "react";

// Modeled on the categories admin's
// `admin/categories/_components/CategoriesDataTableSection/index.tsx`. The
// badge backend (apps/backend/src/modules/badge) has no pagination/search/
// sort support (`BadgeService.getAllBadges` only filters by
// category/rarity/is_active and returns the full array), so — unlike the
// categories table — `config` here leaves `isSearchProcessed` /
// `isSortProcessed` / `isPaginationProcessed` unset, letting <DataTable />
// do all of that client-side against the full badge list.
type BadgesDataTableSectionProps = {
  data?: TBadge[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (row: TBadge) => void;
  onDelete: (row: TBadge) => void;
  onToggleActive: (row: TBadge) => void;
  state: TState;
};

const CATEGORY_STYLES: Record<TBadgeCategory, string> = {
  reader: "bg-blue-100 text-blue-800",
  engagement: "bg-purple-100 text-purple-800",
  loyalty: "bg-amber-100 text-amber-800",
  contribution: "bg-teal-100 text-teal-800",
  achievement: "bg-pink-100 text-pink-800",
};

const RARITY_STYLES: Record<TBadgeRarity, string> = {
  common: "bg-gray-100 text-gray-800",
  rare: "bg-blue-100 text-blue-800",
  epic: "bg-purple-100 text-purple-800",
  legendary: "bg-amber-100 text-amber-800",
};

const CRITERIA_TYPE_LABELS: Record<TBadgeCriteria["type"], string> = {
  articles_read: "articles read",
  comments_posted: "comments posted",
  reading_streak: "day reading streak",
  reputation_score: "reputation points",
  years_member: "years membership",
  custom: "custom",
};

// Human-readable criteria summary, e.g. "10 articles read" or "7-day
// reading streak". `custom` criteria have no fixed unit, so fall back to
// the badge's own free-text `criteria.description`.
export const formatCriteria = (criteria: TBadgeCriteria): string => {
  if (criteria.type === "custom") {
    return criteria.description || "Custom criteria";
  }
  if (criteria.type === "reading_streak") {
    return `${criteria.threshold}-day reading streak`;
  }
  return `${criteria.threshold} ${CRITERIA_TYPE_LABELS[criteria.type]}`;
};

const BadgesDataTableSection: React.FC<BadgesDataTableSectionProps> = ({
  data = [],
  isLoading,
  isError,
  onEdit,
  onDelete,
  onToggleActive,
  state,
}) => {
  const columns: TColumn<TBadge>[] = [
    {
      name: "Icon",
      field: "icon",
      cell: ({ cell }) => (
        <span className="text-xl leading-none" aria-hidden="true">
          {typeof cell === "string" && cell ? cell : "🏅"}
        </span>
      ),
    },
    { name: "Name", field: "name", isSortable: true, isSearchable: true },
    {
      name: "Category",
      field: "category",
      isSortable: true,
      cell: ({ cell }) => (
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium capitalize",
            CATEGORY_STYLES[cell as TBadgeCategory] ??
              "bg-gray-100 text-gray-800",
          )}
        >
          {cell?.toString()}
        </span>
      ),
    },
    {
      name: "Rarity",
      field: "rarity",
      isSortable: true,
      cell: ({ cell }) => (
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium capitalize",
            RARITY_STYLES[cell as TBadgeRarity] ?? "bg-gray-100 text-gray-800",
          )}
        >
          {cell?.toString()}
        </span>
      ),
    },
    { name: "Points", field: "points", isSortable: true },
    {
      name: "Criteria",
      field: "criteria",
      cell: ({ cell }) => (
        <span className="text-sm">{formatCriteria(cell as TBadgeCriteria)}</span>
      ),
    },
    {
      name: "Active",
      field: "is_active",
      isSortable: true,
      cell: ({ cell, row }) => (
        <div>
          <Switch
            disabled={isLoading}
            onChange={() => onToggleActive(row)}
            checked={cell === true}
          />
        </div>
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
        state={state}
      />
    </div>
  );
};

export default BadgesDataTableSection;

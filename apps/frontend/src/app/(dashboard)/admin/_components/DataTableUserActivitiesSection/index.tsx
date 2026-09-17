"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import type { TColumn } from "@/components/ui/DataTable";
import DataTable from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { Edit, Trash } from "lucide-react";
import type { TUserActivity } from "./user-activities-data";
import { userActivities } from "./user-activities-data";

// Ported from apps/adminpanel's
// src/components/(common)/dashboard-page/AdminDashboard/DataTableUserActivitiesSection/index.tsx.
// Static sample data (user-activities-data.ts) — no real fetch to port here;
// the Edit/Trash actions are inert in the source too (no onClick handlers).
const DataTableUserActivitiesSection = () => {
  const columns: TColumn<TUserActivity>[] = [
    { name: "ID", field: "id", isSortable: true },
    { name: "Name", field: "name", isSortable: true },
    { name: "Email", field: "email", isSortable: true },
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
          {cell}
        </span>
      ),
    },
    { name: "Role", field: "role", isSortable: true },
    { name: "Last Active", field: "lastActive", isSortable: true },
    { name: "Created At", field: "createdAt", isSortable: true },
    {
      name: "Actions",
      field: "id",
      cell: () => (
        <div className="flex w-fit items-center space-x-2">
          <Button size={"sm"} variant="outline" shape={"icon"}>
            <Edit className="size-4" />
          </Button>
          <Button
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
    <Card>
      <CardContent>
        <DataTable
          title="User Activities"
          columns={columns}
          data={userActivities}
          config={{
            isSortProcessed: false,
            isPaginationProcessed: false,
          }}
        />
      </CardContent>
    </Card>
  );
};

export default DataTableUserActivitiesSection;

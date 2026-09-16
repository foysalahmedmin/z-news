import type { TUserActivity } from "@/assets/data/user-activities-data";
import { userActivities } from "@/assets/data/user-activities-data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { TColumn } from "@/components/ui/DataTable";
import DataTable from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { Edit, Trash } from "lucide-react";

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
      <Card.Content>
        <DataTable
          title="User Activities"
          columns={columns}
          data={userActivities}
          config={{
            isSortProcessed: false,
            isPaginationProcessed: false,
          }}
        />
      </Card.Content>
    </Card>
  );
};

export default DataTableUserActivitiesSection;

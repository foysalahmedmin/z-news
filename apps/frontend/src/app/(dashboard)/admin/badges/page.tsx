"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import useAlert from "@/hooks/ui/useAlert";
import {
  deleteBadge,
  fetchBadges,
  updateBadge,
} from "@/services/admin-badge.service";
import type { TBadge, TBadgeUpdatePayload } from "@/types/admin-badge.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import BadgeAddModal from "./_components/BadgeAddModal";
import BadgeEditModal from "./_components/BadgeEditModal";
import BadgesDataTableSection from "./_components/BadgesDataTableSection";

// Modeled on the categories admin's `admin/categories/page.tsx` (page +
// list + two modals). The badge backend has no pagination/search/sort
// support (see BadgesDataTableSection's header comment), so `page`/`limit`/
// `search`/`sort` state below only drives <DataTable />'s own client-side
// processing of the full badge list — it isn't sent to the API.
const BadgesPage = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedBadge, setSelectedBadge] = useState<TBadge>({} as TBadge);

  const onOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const onOpenEditModal = (badge: TBadge) => {
    setSelectedBadge(badge);
    setIsEditModalOpen(true);
  };

  const update_mutation = useMutation({
    mutationFn: ({
      _id,
      payload,
    }: {
      _id: string;
      payload: TBadgeUpdatePayload;
    }) => updateBadge(_id, payload),
    onSuccess: (data) => {
      toast.success(data?.message || "Badge updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update badge");
      console.error("Update Badge Error:", error);
    },
  });

  const delete_mutation = useMutation({
    mutationFn: (_id: string) => deleteBadge(_id),
    onSuccess: (data) => {
      toast.success(data?.message || "Badge deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete badge");
      console.error("Delete Badge Error:", error);
    },
  });

  const onToggleActive = async (badge: TBadge) => {
    const payload = { is_active: !badge.is_active };
    update_mutation.mutate({ _id: badge._id, payload });
  };

  const onDelete = async (badge: TBadge) => {
    const ok = await confirm({
      title: "Delete Badge",
      message: "Are you sure you want to delete this badge?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) {
      delete_mutation.mutate(badge._id);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["badges"],
    queryFn: () => fetchBadges(),
  });

  return (
    <main className="space-y-6">
      <PageHeader
        name="Badges"
        slot={
          <Button onClick={() => onOpenAddModal()}>
            <Plus className="h-4 w-4" /> Add Badge
          </Button>
        }
      />
      <Card>
        <CardContent>
          <BadgesDataTableSection
            data={data?.data || []}
            isLoading={isLoading}
            isError={isError}
            onEdit={onOpenEditModal}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            state={{
              total: data?.data?.length || 0,
              page,
              setPage,
              limit,
              setLimit,
              search,
              setSearch,
              sort,
              setSort,
            }}
          />
        </CardContent>
      </Card>
      <BadgeAddModal isOpen={isAddModalOpen} setIsOpen={setIsAddModalOpen} />
      <BadgeEditModal
        default={selectedBadge}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
      />
    </main>
  );
};

export default BadgesPage;

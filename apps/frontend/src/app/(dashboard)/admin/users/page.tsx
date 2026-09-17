"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import useAlert from "@/hooks/ui/useAlert";
import { deleteUser, fetchUsers } from "@/services/admin-user.service";
import type { TUser } from "@/types/admin-user.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import UserEditModal from "./_components/UserEditModal";
import UsersDataTableSection from "./_components/UsersDataTableSection";
import UsersStatisticsSection from "./_components/UsersStatisticsSection";

// Ported from apps/adminpanel's src/pages/(common)/UsersPage/index.tsx.
// activeBreadcrumbs from useMenu() (Redux) -> handled internally by
// PageHeader via useAdminMenu()/usePathname(), so not threaded through here
// (same pattern as apps/frontend's already-ported EventsPage). Also fixed a
// copy-paste bug from the source: the delete mutation invalidated the
// "categories" query key instead of "users", so the table never refreshed
// after a delete.
const UsersPage = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<TUser>({} as TUser);

  const onOpenEditModal = (user: TUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const delete_mutation = useMutation({
    mutationFn: (_id: string) => deleteUser(_id),
    onSuccess: (data) => {
      toast.success(data?.message || "User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete User");
      console.error("Delete User Error:", error);
    },
  });

  const onDelete = async (user: TUser) => {
    const ok = await confirm({
      title: "Delete User",
      message: "Are you sure you want to delete this User?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) {
      delete_mutation.mutate(user._id);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers({ sort: "sequence" }),
  });

  return (
    <main className="space-y-6">
      <PageHeader name="users" />
      <UsersStatisticsSection data={data?.data || []} />
      <Card>
        <CardContent>
          <UsersDataTableSection
            data={data?.data || []}
            isLoading={isLoading}
            isError={isError}
            onEdit={onOpenEditModal}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>
      <UserEditModal
        default={selectedUser}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
      />
    </main>
  );
};

export default UsersPage;

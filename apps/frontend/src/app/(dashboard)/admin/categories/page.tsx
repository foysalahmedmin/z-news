"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import useAlert from "@/hooks/ui/useAlert";
import {
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/services/admin-category.service";
import type {
  TCategory,
  TCategoryUpdatePayload,
} from "@/types/admin-category.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import CategoriesDataTableSection from "./_components/CategoriesDataTableSection";
import CategoriesStatisticsSection from "./_components/CategoriesStatisticsSection";
import CategoryAddModal from "./_components/CategoryAddModal";
import CategoryEditModal from "./_components/CategoryEditModal";

// Ported from apps/adminpanel's src/pages/(common)/CategoriesPage/index.tsx.
// activeBreadcrumbs from useMenu() (Redux) -> handled internally by
// PageHeader via useAdminMenu()/usePathname(), so not threaded through here.
const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("sequence");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditAddModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<TCategory>(
    {} as TCategory,
  );

  const onOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const onOpenEditModal = (category: TCategory) => {
    setSelectedCategory(category);
    setIsEditAddModalOpen(true);
  };

  const update_mutation = useMutation({
    mutationFn: ({
      _id,
      payload,
    }: {
      _id: string;
      payload: TCategoryUpdatePayload;
    }) => updateCategory(_id, payload),
    onSuccess: (data) => {
      toast.success(data?.message || "Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update category");
      console.error("Update Category Error:", error);
    },
  });

  const delete_mutation = useMutation({
    mutationFn: (_id: string) => deleteCategory(_id),
    onSuccess: (data) => {
      toast.success(data?.message || "Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
      console.error("Delete Category Error:", error);
    },
  });

  const onToggleFeatured = async (category: TCategory) => {
    const payload = { is_featured: !category.is_featured };
    update_mutation.mutate({ _id: category._id, payload });
  };

  const onDelete = async (category: TCategory) => {
    const ok = await confirm({
      title: "Delete Category",
      message: "Are you sure you want to delete this category?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) {
      delete_mutation.mutate(category._id);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "categories",
      {
        sort,
        search,
        page,
        limit,
      },
    ],
    queryFn: () =>
      fetchCategories({
        page,
        limit,
        sort: sort || "sequence",
        ...(search && { search }),
      }),
  });

  return (
    <main className="space-y-6">
      <PageHeader
        name="Categories"
        slot={
          <Button onClick={() => onOpenAddModal()}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />
      <CategoriesStatisticsSection meta={data?.meta} />
      <Card>
        <CardContent>
          <CategoriesDataTableSection
            data={data?.data || []}
            isLoading={isLoading}
            isError={isError}
            onEdit={onOpenEditModal}
            onDelete={onDelete}
            onToggleFeatured={onToggleFeatured}
            state={{
              total: data?.meta?.total || 0,
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
      <CategoryAddModal
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        default={{ sequence: data?.meta?.total || data?.data?.length || 0 }}
      />
      <CategoryEditModal
        default={selectedCategory}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditAddModalOpen}
      />
    </main>
  );
};

export default CategoriesPage;

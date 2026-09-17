"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  Tabs,
  TabsContent,
  TabsItem,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import useAlert from "@/hooks/ui/useAlert";
import {
  deleteCategory,
  fetchCategory,
  updateCategory,
} from "@/services/admin-category.service";
import type {
  TCategory,
  TCategoryUpdatePayload,
} from "@/types/admin-category.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import CategoryAddModal from "../_components/CategoryAddModal";
import CategoryEditModal from "../_components/CategoryEditModal";
import CategoryDataTableSection from "./_components/CategoryDataTableSection";
import CategoryInfoSection from "./_components/CategoryInfoSection";
import CategoryOverviewSection from "./_components/CategoryOverviewSection";

// Ported from apps/adminpanel's
// src/pages/(common)/CategoriesDetailsPage/index.tsx.
//
// The original read `state.breadcrumbs` off react-router's `useLocation()`,
// handed off by the list page's row `<Link state={...}>` — Next.js has no
// `location.state` equivalent for App Router navigation. It's dropped
// rather than replaced: `state.category` (the other half of that handoff)
// was already unused here, since the page always re-fetches the full
// category by id via `useQuery(["category", id])` below, and PageHeader
// now derives its own breadcrumbs from `usePathname()`.
const CategoriesDetailsPage = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();

  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TCategory>(
    {} as TCategory,
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["category", id],
    queryFn: () => fetchCategory(id || ""),
    enabled: Boolean(id),
  });

  const onOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const onOpenEditModal = (category: TCategory) => {
    setSelectedCategory(category);
    setIsEditAddModalOpen(true);
  };

  const subcategory_update_mutation = useMutation({
    mutationFn: ({
      _id,
      payload,
    }: {
      _id: string;
      payload: TCategoryUpdatePayload;
    }) => updateCategory(_id, payload),
    onSuccess: (data) => {
      toast.success(data?.message || "Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update category");
      console.error("Update Category Error:", error);
    },
  });

  const subcategory_delete_mutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: (data) => {
      toast.success(data?.message || "Subcategory deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
      console.error("Delete Subcategory Error:", error);
    },
  });

  const onToggleFeatured = async (category: TCategory) => {
    const payload = { is_featured: !category.is_featured };
    subcategory_update_mutation.mutate({ _id: category._id, payload });
  };

  const onDelete = async (category: TCategory) => {
    const ok = await confirm({
      title: "Delete Category",
      message: "Are you sure you want to delete this category?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) {
      subcategory_delete_mutation.mutate(category._id);
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader name="Category Details" />

      <Card>
        <CardContent className="py-6">
          <CategoryInfoSection category={data?.data} />
        </CardContent>
      </Card>

      <Card>
        <Tabs value={"overview"}>
          <CardHeader className="pb-0">
            <TabsList className="justify-start">
              <TabsTrigger value="overview">Description</TabsTrigger>
              <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent>
              <TabsItem value="overview">
                <CategoryOverviewSection category={data?.data || {}} />
              </TabsItem>
              <TabsItem value="subcategories">
                <CategoryDataTableSection
                  data={data?.data?.children || []}
                  isLoading={isLoading}
                  isError={isError}
                  onAdd={onOpenAddModal}
                  onEdit={onOpenEditModal}
                  onDelete={onDelete}
                  onToggleFeatured={onToggleFeatured}
                />
              </TabsItem>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <CategoryAddModal
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
        default={{
          category: data?.data?._id,
          sequence: data?.data?.children?.length || 0,
        }}
        mutationKey={["category", data?.data?._id || ""]}
      />
      <CategoryEditModal
        default={selectedCategory}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditAddModalOpen}
        mutationKey={["category", data?.data?._id || ""]}
      />
    </main>
  );
};

export default CategoriesDetailsPage;

"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import useAlert from "@/hooks/ui/useAlert";
import {
  deleteNewsHeadline,
  fetchNewsHeadlines,
} from "@/services/admin-news-headline.service";
import type { TNewsHeadline } from "@/types/admin-news-headline.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import NewsHeadlineAddModal from "./_components/NewsHeadlineAddModal";
import NewsHeadlineDataTableSection from "./_components/NewsHeadlineDataTableSection";
import NewsHeadlineEditModal from "./_components/NewsHeadlineEditModal";

// Modal-based single-page CRUD, ported from this app's own Events page
// (apps/frontend's `(dashboard)/admin/events/page.tsx`) — no separate
// add/edit routes, no bin/restore UI (soft-delete only via the row action,
// matching Events' own precedent). The list endpoint's `meta` has no
// `statistics` bucket (unlike Events'), so there's no stats section here.
const NewsHeadlinePage = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-published_at");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedNewsHeadline, setSelectedNewsHeadline] =
    useState<TNewsHeadline>({} as TNewsHeadline);

  const onOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const onOpenEditModal = (newsHeadline: TNewsHeadline) => {
    setSelectedNewsHeadline(newsHeadline);
    setIsEditModalOpen(true);
  };

  const delete_mutation = useMutation({
    mutationFn: (_id: string) => deleteNewsHeadline(_id),
    onSuccess: (data) => {
      toast.success(data?.message || "News Headline deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["news-headlines"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(
        error.response?.data?.message || "Failed to delete news headline",
      );
      console.error("Delete News Headline Error:", error);
    },
  });

  const onDelete = async (newsHeadline: TNewsHeadline) => {
    const ok = await confirm({
      title: "Delete News Headline",
      message: "Are you sure you want to delete this News Headline?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) {
      delete_mutation.mutate(newsHeadline._id);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["news-headlines", { sort, search, page, limit }],
    queryFn: () =>
      fetchNewsHeadlines({
        page,
        limit,
        sort: sort || "-published_at",
        ...(search && { search }),
      }),
  });

  return (
    <main className="space-y-6">
      <PageHeader
        name="News Headlines"
        slot={
          <Button onClick={() => onOpenAddModal()}>
            <Plus className="h-4 w-4" /> Add News Headline
          </Button>
        }
      />
      <Card>
        <CardContent>
          <NewsHeadlineDataTableSection
            data={data?.data || []}
            isLoading={isLoading}
            isError={isError}
            onEdit={onOpenEditModal}
            onDelete={onDelete}
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
      <NewsHeadlineAddModal
        isOpen={isAddModalOpen}
        setIsOpen={setIsAddModalOpen}
      />
      <NewsHeadlineEditModal
        default={selectedNewsHeadline}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
      />
    </main>
  );
};

export default NewsHeadlinePage;

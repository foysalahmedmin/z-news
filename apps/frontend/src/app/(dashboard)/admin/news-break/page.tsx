"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import useAlert from "@/hooks/ui/useAlert";
import { deleteNewsBreak, fetchNewsBreaks } from "@/services/admin-news-break.service";
import type { TNewsBreak } from "@/types/admin-news-break.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import NewsBreakAddModal from "./_components/NewsBreakAddModal";
import NewsBreakEditModal from "./_components/NewsBreakEditModal";
import NewsBreakDataTableSection from "./_components/NewsBreakDataTableSection";

// Structurally mirrors apps/frontend's `admin/events/page.tsx` (modal-based
// single-page CRUD, no separate add/edit routes). News-Break has no
// `meta.statistics` in its list response (unlike Events' category
// statistics), so there is no statistics section here.
const NewsBreakPage = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-published_at");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedNewsBreak, setSelectedNewsBreak] = useState<TNewsBreak>(
    {} as TNewsBreak,
  );

  const onOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const onOpenEditModal = (newsBreak: TNewsBreak) => {
    setSelectedNewsBreak(newsBreak);
    setIsEditModalOpen(true);
  };

  const delete_mutation = useMutation({
    mutationFn: (_id: string) => deleteNewsBreak(_id),
    onSuccess: (data) => {
      toast.success(data?.message || "News Break deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["news-breaks"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete news break");
      console.error("Delete News Break Error:", error);
    },
  });

  const onDelete = async (newsBreak: TNewsBreak) => {
    const ok = await confirm({
      title: "Delete News Break",
      message: "Are you sure you want to delete this News Break?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) {
      delete_mutation.mutate(newsBreak._id);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["news-breaks", { sort, search, page, limit }],
    queryFn: () =>
      fetchNewsBreaks({
        page,
        limit,
        sort: sort || "-published_at",
        ...(search && { search }),
      }),
  });

  return (
    <main className="space-y-6">
      <PageHeader
        name="News Break"
        slot={
          <Button onClick={() => onOpenAddModal()}>
            <Plus className="h-4 w-4" /> Add News Break
          </Button>
        }
      />
      <Card>
        <CardContent>
          <NewsBreakDataTableSection
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
      <NewsBreakAddModal isOpen={isAddModalOpen} setIsOpen={setIsAddModalOpen} />
      <NewsBreakEditModal
        default={selectedNewsBreak}
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
      />
    </main>
  );
};

export default NewsBreakPage;

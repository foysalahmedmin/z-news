"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import useAlert from "@/hooks/ui/useAlert";
import { deleteMedia, fetchMedia } from "@/services/media.service";
import type { TMedia } from "@/types/media.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import MediaDataTableSection from "./_components/MediaDataTableSection";

// Mirrors apps/frontend's Files admin UI (see
// app/(dashboard)/admin/files/page.tsx) — Media's list/search/filter is
// route-based (not modal-based) the same way, with dedicated add/edit
// routes rather than an inline modal. GET /api/media is fully public (no
// auth middleware — see media.route.ts), but this page is only reachable
// from the admin dashboard, so it goes through media.service.ts's
// admin-api-backed calls like every other admin list page.
const MediaPage = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-created_at");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const delete_mutation = useMutation({
    mutationFn: (_id: string) => deleteMedia(_id),
    onSuccess: (data) => {
      toast.success(data?.message || "Media deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete media");
      console.error("Delete Media Error:", error);
    },
  });

  const onEdit = (media: TMedia) => {
    router.push(`/admin/media/edit/${media._id}`);
  };

  const onDelete = async (media: TMedia) => {
    const ok = await confirm({
      title: "Delete Media",
      message: "Are you sure you want to delete this media item?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) {
      delete_mutation.mutate(media._id);
    }
  };

  const onAdd = () => {
    router.push("/admin/media/add");
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "media",
      {
        sort,
        search,
        page,
        limit,
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      },
    ],
    queryFn: () =>
      fetchMedia({
        page,
        limit,
        sort: sort || "-created_at",
        ...(search && { search }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      }),
  });

  return (
    <main className="space-y-6">
      <PageHeader
        name="Media"
        slot={
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4" /> Add Media
          </Button>
        }
      />
      <Card>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(0);
              }}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <MediaDataTableSection
            data={data?.data || []}
            isLoading={isLoading}
            isError={isError}
            onEdit={onEdit}
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
    </main>
  );
};

export default MediaPage;

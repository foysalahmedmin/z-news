"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import useAlert from "@/hooks/ui/useAlert";
import { deleteFile, fetchFiles } from "@/services/file.service";
import type { TFile } from "@/types/file.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import FilesDataTableSection from "./_components/FilesDataTableSection";
import FilesStatisticsSection from "./_components/FilesStatisticsSection";

// Ported from apps/adminpanel's src/pages/(common)/FilesPage/index.tsx.
// react-router's useNavigate -> next/navigation's useRouter, and
// useMenu().activeBreadcrumbs -> dropped (PageHeader derives breadcrumbs
// itself from the current pathname via useAdminMenu(), see the
// EventsPage port for the same pattern).
const FilesPage = () => {
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
    mutationFn: (_id: string) => deleteFile(_id),
    onSuccess: (data) => {
      toast.success(data?.message || "File deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete file");
      console.error("Delete File Error:", error);
    },
  });

  const onEdit = (file: TFile) => {
    router.push(`/admin/files/edit/${file._id}`);
  };

  const onDelete = async (file: TFile) => {
    const ok = await confirm({
      title: "Delete File",
      message: "Are you sure you want to delete this file?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) {
      delete_mutation.mutate(file._id);
    }
  };

  const onAdd = () => {
    router.push("/admin/files/add");
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "files",
      {
        sort,
        search,
        page,
        limit,
        file_type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      },
    ],
    queryFn: () =>
      fetchFiles({
        page,
        limit,
        sort: sort || "-created_at",
        ...(search && { search }),
        ...(typeFilter !== "all" && { file_type: typeFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      }),
  });

  return (
    <main className="space-y-6">
      <PageHeader
        name="Files"
        slot={
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4" /> Add File
          </Button>
        }
      />
      <FilesStatisticsSection meta={data?.meta} />
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
              <option value="pdf">PDF</option>
              <option value="doc">Documents</option>
              <option value="txt">Text</option>
              <option value="file">Other Files</option>
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
          <FilesDataTableSection
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

export default FilesPage;

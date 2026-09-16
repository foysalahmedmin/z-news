import FilesDataTableSection from "@/components/(common)/files-page/FilesDataTableSection";
import FilesStatisticsSection from "@/components/(common)/files-page/FilesStatisticsSection";
import PageHeader from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import useMenu from "@/hooks/states/useMenu";
import useAlert from "@/hooks/ui/useAlert";
import { deleteFile, fetchFiles } from "@/services/file.service";
import type { TFile } from "@/types/file.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const FilesPage = () => {
  const { activeBreadcrumbs } = useMenu();
  const queryClient = useQueryClient();
  const confirm = useAlert();
  const navigate = useNavigate();

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
    navigate(`/files/${file._id}/edit`);
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
    navigate("/files/add");
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
        <Card.Content>
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
            breadcrumbs={activeBreadcrumbs || []}
            isLoading={isLoading}
            isError={isError}
            onAdd={onAdd}
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
        </Card.Content>
      </Card>
    </main>
  );
};

export default FilesPage;

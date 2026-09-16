import FileInfoSection from "@/components/(common)/files-details-page/FileInfoSection";
import FileOverviewSection from "@/components/(common)/files-details-page/FileOverviewSection";
import PageHeader from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import useAlert from "@/hooks/ui/useAlert";
import { deleteFile, fetchFile } from "@/services/file.service";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

const FilesViewPage = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();
  const navigate = useNavigate();

  const { state } = useLocation();
  const { id } = useParams();

  const { breadcrumbs } = state || {};

  const { data, isLoading, isError } = useQuery({
    queryKey: ["file", id],
    queryFn: () => fetchFile(id || ""),
  });

  const delete_mutation = useMutation({
    mutationFn: (_id: string) => deleteFile(_id),
    onSuccess: (data) => {
      toast.success(data?.message || "File deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["files"] });
      navigate("/files");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete file");
      console.error("Delete File Error:", error);
    },
  });

  const onDelete = async () => {
    if (!data?.data?._id) return;

    const ok = await confirm({
      title: "Delete File",
      message: "Are you sure you want to delete this file?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) {
      delete_mutation.mutate(data.data._id);
    }
  };

  const onEdit = () => {
    if (data?.data?._id) {
      navigate(`/files/edit/${data.data._id}`);
    }
  };

  if (isLoading) {
    return (
      <main className="space-y-6">
        <PageHeader name="Loading..." />
        <Card>
          <Card.Content>
            <p>Loading file...</p>
          </Card.Content>
        </Card>
      </main>
    );
  }

  if (isError || !data?.data) {
    return (
      <main className="space-y-6">
        <PageHeader name="File Not Found" />
        <Card>
          <Card.Content>
            <p>File not found</p>
            <Button onClick={() => navigate("/files")} className="mt-4">
              Back to Files
            </Button>
          </Card.Content>
        </Card>
      </main>
    );
  }

  const file = data.data;

  return (
    <main className="space-y-6">
      <PageHeader
        breadcrumbs={breadcrumbs}
        name="File Details"
        slot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={onDelete}
              className="[--accent:red]"
            >
              <Trash className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <Card>
        <Card.Content className="py-6">
          <FileInfoSection file={file} />
        </Card.Content>
      </Card>

      <Card>
        <Tabs value={"overview"}>
          <Card.Header className="pb-0">
            <Tabs.List className="justify-start">
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            </Tabs.List>
          </Card.Header>
          <Card.Content>
            <Tabs.Content>
              <Tabs.Item value="overview">
                <FileOverviewSection file={file} />
              </Tabs.Item>
            </Tabs.Content>
          </Card.Content>
        </Tabs>
      </Card>

      {/* File Preview Section */}
      {file.metadata?.file_type === "image" && file.url && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold">Preview</h3>
          </Card.Header>
          <Card.Content>
            <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
              <img
                src={file.url}
                alt={file.name}
                className="h-full w-full object-contain"
              />
            </div>
          </Card.Content>
        </Card>
      )}
    </main>
  );
};

export default FilesViewPage;

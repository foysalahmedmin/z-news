"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsItem, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import useAlert from "@/hooks/ui/useAlert";
import { deleteFile, fetchFile } from "@/services/file.service";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import FileInfoSection from "./_components/FileInfoSection";
import FileOverviewSection from "./_components/FileOverviewSection";

// Ported from apps/adminpanel's src/pages/(common)/FilesViewPage/index.tsx.
// react-router's useNavigate/useParams -> next/navigation's
// useRouter/useParams. The original read `breadcrumbs` off react-router's
// location `state`, populated by the Link in FilesDataTableSection;
// next/link has no equivalent state payload, so the breadcrumb trail is
// built locally instead (the "Files" -> :id path isn't in the static
// admin-menu-items.ts map either, since it's parameterized).
const FilesViewPage = () => {
  const queryClient = useQueryClient();
  const confirm = useAlert();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["file", id],
    queryFn: () => fetchFile(id || ""),
    enabled: !!id,
  });

  const delete_mutation = useMutation({
    mutationFn: (_id: string) => deleteFile(_id),
    onSuccess: (data) => {
      toast.success(data?.message || "File deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["files"] });
      router.push("/admin/files");
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
      router.push(`/admin/files/edit/${data.data._id}`);
    }
  };

  if (isLoading) {
    return (
      <main className="space-y-6">
        <PageHeader name="Loading..." />
        <Card>
          <CardContent>
            <p>Loading file...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isError || !data?.data) {
    return (
      <main className="space-y-6">
        <PageHeader name="File Not Found" />
        <Card>
          <CardContent>
            <p>File not found</p>
            <Button onClick={() => router.push("/admin/files")} className="mt-4">
              Back to Files
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const file = data.data;

  const breadcrumbs = [
    { index: 0, name: "Files", path: "/admin/files" },
    { index: 1, name: file.name || "File Details" },
  ];

  return (
    <main className="space-y-6">
      <PageHeader
        breadcrumbs={breadcrumbs}
        name="File Details"
        slot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
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
        <CardContent className="py-6">
          <FileInfoSection file={file} />
        </CardContent>
      </Card>

      <Card>
        <Tabs value={"overview"}>
          <CardHeader className="pb-0">
            <TabsList className="justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent>
              <TabsItem value="overview">
                <FileOverviewSection file={file} />
              </TabsItem>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* File Preview Section */}
      {file.metadata?.file_type === "image" && file.url && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Preview</h3>
          </CardHeader>
          <CardContent>
            <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
              <img
                src={file.url}
                alt={file.name}
                className="h-full w-full object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default FilesViewPage;

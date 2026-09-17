"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  FormControl,
  FormControlHelper,
  FormControlLabel,
} from "@/components/ui/FormControl";
import { fetchFile, updateFile } from "@/services/file.service";
import type { TFileUpdatePayload } from "@/types/file.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ArrowLeft, Eye, File } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Ported from apps/adminpanel's src/pages/(common)/FilesEditPage/index.tsx.
// react-router's useNavigate/useParams -> next/navigation's
// useRouter/useParams. The "Files" -> "edit/:id" breadcrumb trail isn't in
// the static admin-menu-items.ts map (that child is parameterized/
// invisible), so it's passed explicitly here, same as the source.
const FilesEditPage = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "archived">(
    "active",
  );

  const { data: fileData, isLoading } = useQuery({
    queryKey: ["file", id],
    queryFn: () => fetchFile(id!),
    enabled: !!id,
  });

  const file = fileData?.data;

  useEffect(() => {
    if (file) {
      setName(file.name || "");
      setCategory(file.category || "");
      setDescription(file.description || "");
      setCaption(file.caption || "");
      setStatus(file.status || "active");
    }
  }, [file]);

  const updateFileMutation = useMutation({
    mutationFn: (payload: TFileUpdatePayload) => updateFile(id!, payload),
    onSuccess: (data) => {
      toast.success(data?.message || "File updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["file", id] });
      router.push("/admin/files");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update file");
      console.error("Update File Error:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: TFileUpdatePayload = {
      ...(name && { name }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
      ...(caption !== undefined && { caption }),
      status,
    };

    updateFileMutation.mutate(payload);
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

  if (!file) {
    return (
      <main className="space-y-6">
        <PageHeader name="File Not Found" />
        <Card>
          <CardContent>
            <p>File not found</p>
            <Button onClick={() => router.push("/admin/files")}>
              Back to Files
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <PageHeader
        name="Edit File"
        breadcrumbs={[
          { index: 0, name: "Files", path: "/admin/files" },
          { index: 1, name: "Edit File" },
        ]}
        slot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/files/${file._id}`)}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* File Preview */}
        <Card>
          <CardContent>
            <h3 className="mb-4 font-semibold">File Preview</h3>
            <div className="space-y-4">
              {file.metadata?.file_type === "image" ? (
                <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
                  <File className="text-muted-foreground h-16 w-16" />
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  <span className="capitalize">{file.metadata?.file_type}</span>
                </div>
                <div>
                  <span className="font-medium">Size:</span>{" "}
                  <span>{(file.size / 1024).toFixed(2)} KB</span>
                </div>
                <div>
                  <span className="font-medium">Extension:</span>{" "}
                  <span className="font-mono">{file.metadata?.extension}</span>
                </div>
                <div>
                  <span className="font-medium">MIME Type:</span>{" "}
                  <span>{file.mimetype}</span>
                </div>
                <div>
                  <span className="font-medium">Author:</span>{" "}
                  <span>{file.author?.name || "N/A"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <FormControlLabel htmlFor="name">Name *</FormControlLabel>
                <FormControl
                  id="name"
                  type="text"
                  placeholder="File name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <FormControlLabel htmlFor="category">
                  Category
                </FormControlLabel>
                <FormControl
                  id="category"
                  type="text"
                  placeholder="File category (optional)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <FormControlLabel htmlFor="description">
                  Description
                </FormControlLabel>
                <FormControl
                  id="description"
                  as="textarea"
                  className="h-20 py-2"
                  placeholder="File description (optional, max 500 characters)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
                <FormControlHelper>
                  {description.length}/500 characters
                </FormControlHelper>
              </div>

              {/* Caption */}
              <div>
                <FormControlLabel htmlFor="caption">Caption</FormControlLabel>
                <FormControl
                  id="caption"
                  type="text"
                  placeholder="File caption (optional, max 500 characters)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={500}
                />
                <FormControlHelper>
                  {caption.length}/500 characters
                </FormControlHelper>
              </div>

              {/* Status */}
              <div>
                <FormControlLabel htmlFor="status">Status</FormControlLabel>
                <FormControl
                  id="status"
                  as="select"
                  className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as "active" | "inactive" | "archived",
                    )
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </FormControl>
              </div>

              <hr />

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size={"lg"}
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size={"lg"}
                  isLoading={updateFileMutation.isPending}
                  disabled={updateFileMutation.isPending}
                >
                  {updateFileMutation.isPending ? "Updating..." : "Update File"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default FilesEditPage;

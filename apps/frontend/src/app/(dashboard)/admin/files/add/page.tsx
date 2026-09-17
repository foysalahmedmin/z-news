"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  FormControl,
  FormControlHelper,
  FormControlLabel,
} from "@/components/ui/FormControl";
import { createFile } from "@/services/file.service";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ArrowLeft, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "react-toastify";

// Ported from apps/adminpanel's src/pages/(common)/FilesAddPage/index.tsx.
// react-router's useNavigate -> next/navigation's useRouter. The "Files" ->
// "add" breadcrumb trail isn't in the static admin-menu-items.ts map (that
// child is parameterized/invisible), so it's passed explicitly here, same
// as the source.
const FilesAddPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "archived">(
    "active",
  );

  const createFileMutation = useMutation({
    mutationFn: (formData: FormData) => createFile(formData),
    onSuccess: (data) => {
      toast.success(data?.message || "File uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["files"] });
      router.push("/admin/files");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to upload file");
      console.error("Create File Error:", error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.split(".")[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (name) formData.append("name", name);
    if (category) formData.append("category", category);
    if (description) formData.append("description", description);
    if (caption) formData.append("caption", caption);
    if (status) formData.append("status", status);

    createFileMutation.mutate(formData);
  };

  return (
    <main className="space-y-6">
      <PageHeader
        name="Add File"
        breadcrumbs={[
          { index: 0, name: "Files", path: "/admin/files" },
          { index: 1, name: "Add File" },
        ]}
        slot={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <FormControlLabel htmlFor="file">File *</FormControlLabel>
              <div className="mt-2">
                <label
                  htmlFor="file"
                  className="border-muted-foreground hover:border-primary flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors"
                >
                  <Upload className="text-muted-foreground mb-2 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {file
                      ? `Selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`
                      : "Select a file"}
                  </p>
                </label>
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <FormControlLabel htmlFor="name">Name</FormControlLabel>
              <FormControl
                id="name"
                type="text"
                placeholder="File name (optional, defaults to original filename)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FormControlHelper>
                Leave empty to use the original filename
              </FormControlHelper>
            </div>

            {/* Category */}
            <div>
              <FormControlLabel htmlFor="category">Category</FormControlLabel>
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
                isLoading={createFileMutation.isPending}
                disabled={createFileMutation.isPending || !file}
              >
                {createFileMutation.isPending ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default FilesAddPage;

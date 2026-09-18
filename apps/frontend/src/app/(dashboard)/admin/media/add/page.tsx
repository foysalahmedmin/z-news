"use client";

import FileSelectionModal from "@/components/modals/FileSelectionModal";
import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  FormControl,
  FormControlHelper,
  FormControlLabel,
} from "@/components/ui/FormControl";
import { fetchFile } from "@/services/file.service";
import { createMedia } from "@/services/media.service";
import type {
  TMediaCreatePayload,
  TMediaStatus,
  TMediaType,
} from "@/types/media.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  ArrowLeft,
  File,
  FolderOpen,
  Image,
  Music,
  Video,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Media is a curated/tagged POINTER to an already-uploaded File (see
// apps/backend/src/modules/media/media.model.ts) — creating one never
// uploads a file itself, it references an existing File's id. So unlike
// Files' add/page.tsx (a raw <input type="file"> + multipart upload), the
// "file" field here is a searchable picker over EXISTING files, reusing the
// already-ported @/components/modals/FileSelectionModal (single-selection
// mode, which itself lists files via file.service.ts's fetchFiles) instead
// of a file input.
const MEDIA_TYPE_BY_FILE_TYPE: Record<string, TMediaType> = {
  image: "image",
  video: "video",
  audio: "audio",
  pdf: "document",
  doc: "document",
  txt: "document",
  file: "document",
};

const getMediaTypeIcon = (type: string) => {
  switch (type) {
    case "image":
      return Image;
    case "video":
      return Video;
    case "audio":
      return Music;
    default:
      return File;
  }
};

const MediaAddPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [type, setType] = useState<TMediaType>("image");
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<TMediaStatus>("active");

  const { data: fileData } = useQuery({
    queryKey: ["file", fileId],
    queryFn: () => fetchFile(fileId!),
    enabled: !!fileId,
  });

  const selectedFile = fileData?.data;

  // Auto-derive `url` (and a sensible `type`) from the selected File —
  // media.validator.ts's createMediaValidationSchema requires `url` as its
  // own field; it is not resolved from `file` server-side.
  useEffect(() => {
    if (selectedFile) {
      setUrl(selectedFile.url);
      const mapped =
        MEDIA_TYPE_BY_FILE_TYPE[selectedFile.metadata?.file_type || "file"];
      if (mapped) {
        setType(mapped);
      }
    }
  }, [selectedFile]);

  const createMediaMutation = useMutation({
    mutationFn: (payload: TMediaCreatePayload) => createMedia(payload),
    onSuccess: (data) => {
      toast.success(data?.message || "Media created successfully!");
      queryClient.invalidateQueries({ queryKey: ["media"] });
      router.push("/admin/media");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to create media");
      console.error("Create Media Error:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileId) {
      toast.error("Please select a source file");
      return;
    }
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!url.trim()) {
      toast.error("URL could not be derived from the selected file");
      return;
    }

    const payload: TMediaCreatePayload = {
      title: title.trim(),
      file: fileId,
      type,
      url: url.trim(),
      status,
      ...(description.trim() && { description: description.trim() }),
      ...(altText.trim() && { alt_text: altText.trim() }),
      ...(thumbnailUrl.trim() && { thumbnail_url: thumbnailUrl.trim() }),
      ...(tags.trim() && {
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
    };

    createMediaMutation.mutate(payload);
  };

  const TypeIcon = getMediaTypeIcon(type);

  return (
    <main className="space-y-6">
      <PageHeader
        name="Add Media"
        breadcrumbs={[
          { index: 0, name: "Media", path: "/admin/media" },
          { index: 1, name: "Add Media" },
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
            {/* Source File Picker */}
            <div>
              <FormControlLabel htmlFor="file">Source File *</FormControlLabel>
              <div className="mt-2">
                {selectedFile ? (
                  <div className="flex items-center gap-4 rounded-lg border-2 border-dashed p-4">
                    {selectedFile.metadata?.file_type === "image" ? (
                      <img
                        src={selectedFile.url}
                        alt={selectedFile.name}
                        className="h-16 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="bg-muted flex h-16 w-16 items-center justify-center rounded">
                        <TypeIcon className="text-muted-foreground h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {selectedFile.mimetype} •{" "}
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFileId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full"
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Select File
                  </Button>
                )}
              </div>
              <FormControlHelper>
                Media curates and tags an existing File — pick the file this
                Media entry points to.
              </FormControlHelper>
            </div>

            {/* Title */}
            <div>
              <FormControlLabel htmlFor="title">Title *</FormControlLabel>
              <FormControl
                id="title"
                type="text"
                placeholder="Media title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
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
                placeholder="Media description (optional, max 500 characters)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
              <FormControlHelper>
                {description.length}/500 characters
              </FormControlHelper>
            </div>

            {/* Alt Text */}
            <div>
              <FormControlLabel htmlFor="alt_text">Alt Text</FormControlLabel>
              <FormControl
                id="alt_text"
                type="text"
                placeholder="Accessibility alt text (optional)"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
            </div>

            {/* Type */}
            <div>
              <FormControlLabel htmlFor="type">Type *</FormControlLabel>
              <FormControl
                id="type"
                as="select"
                className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as TMediaType)}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Document</option>
              </FormControl>
              <FormControlHelper>
                Auto-filled from the selected file — adjust if needed.
              </FormControlHelper>
            </div>

            {/* URL */}
            <div>
              <FormControlLabel htmlFor="url">URL *</FormControlLabel>
              <FormControl
                id="url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <FormControlHelper>
                Auto-derived from the selected file&apos;s URL.
              </FormControlHelper>
            </div>

            {/* Thumbnail URL */}
            <div>
              <FormControlLabel htmlFor="thumbnail_url">
                Thumbnail URL
              </FormControlLabel>
              <FormControl
                id="thumbnail_url"
                type="url"
                placeholder="https://... (optional)"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div>
              <FormControlLabel htmlFor="tags">Tags</FormControlLabel>
              <FormControl
                id="tags"
                type="text"
                placeholder="Comma-separated tags (optional)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <FormControlHelper>Separate tags with commas</FormControlHelper>
            </div>

            {/* Status */}
            <div>
              <FormControlLabel htmlFor="status">Status</FormControlLabel>
              <FormControl
                id="status"
                as="select"
                className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as TMediaStatus)}
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
                isLoading={createMediaMutation.isPending}
                disabled={createMediaMutation.isPending || !fileId}
              >
                {createMediaMutation.isPending
                  ? "Creating..."
                  : "Create Media"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <FileSelectionModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        value={fileId}
        onChange={(value) => setFileId((value as string | null) || null)}
        title="Select Source File"
      />
    </main>
  );
};

export default MediaAddPage;

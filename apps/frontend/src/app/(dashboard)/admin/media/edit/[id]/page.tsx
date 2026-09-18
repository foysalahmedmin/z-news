"use client";

import PageHeader from "@/components/partials/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  FormControl,
  FormControlHelper,
  FormControlLabel,
} from "@/components/ui/FormControl";
import { fetchMediaItem, updateMedia } from "@/services/media.service";
import type { TMediaStatus, TMediaUpdatePayload } from "@/types/media.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ArrowLeft, File, FileText, Image, Music, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Media's `file`, `type` and `url` are intentionally read-only here —
// media.validator.ts's updateMediaValidationSchema doesn't accept any of
// them, a Media record stays pinned to the source File it was created
// against (see media.model.ts).
const getMediaTypeIcon = (type: string) => {
  switch (type) {
    case "image":
      return Image;
    case "video":
      return Video;
    case "audio":
      return Music;
    case "document":
      return FileText;
    default:
      return File;
  }
};

const MediaEditPage = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<TMediaStatus>("active");

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ["media", id],
    queryFn: () => fetchMediaItem(id!),
    enabled: !!id,
  });

  const media = mediaData?.data;

  useEffect(() => {
    if (media) {
      setTitle(media.title || "");
      setDescription(media.description || "");
      setAltText(media.alt_text || "");
      setThumbnailUrl(media.thumbnail_url || "");
      setTags((media.tags || []).join(", "));
      setStatus(media.status || "active");
    }
  }, [media]);

  const updateMediaMutation = useMutation({
    mutationFn: (payload: TMediaUpdatePayload) => updateMedia(id!, payload),
    onSuccess: (data) => {
      toast.success(data?.message || "Media updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["media", id] });
      router.push("/admin/media");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update media");
      console.error("Update Media Error:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: TMediaUpdatePayload = {
      title: title.trim(),
      description: description.trim(),
      alt_text: altText.trim(),
      thumbnail_url: thumbnailUrl.trim(),
      status,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    updateMediaMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <main className="space-y-6">
        <PageHeader name="Loading..." />
        <Card>
          <CardContent>
            <p>Loading media...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!media) {
    return (
      <main className="space-y-6">
        <PageHeader name="Media Not Found" />
        <Card>
          <CardContent>
            <p>Media not found</p>
            <Button onClick={() => router.push("/admin/media")}>
              Back to Media
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const TypeIcon = getMediaTypeIcon(media.type);
  const fileRef = typeof media.file === "string" ? null : media.file;
  const uploadedBy =
    typeof media.uploaded_by === "string" ? null : media.uploaded_by;

  return (
    <main className="space-y-6">
      <PageHeader
        name="Edit Media"
        breadcrumbs={[
          { index: 0, name: "Media", path: "/admin/media" },
          { index: 1, name: "Edit Media" },
        ]}
        slot={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Media Preview (read-only) */}
        <Card>
          <CardContent>
            <h3 className="mb-4 font-semibold">Source File</h3>
            <div className="space-y-4">
              {media.type === "image" ? (
                <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
                  <img
                    src={media.thumbnail_url || media.url}
                    alt={media.alt_text || media.title}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="bg-muted flex aspect-video items-center justify-center rounded-lg">
                  <TypeIcon className="text-muted-foreground h-16 w-16" />
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  <span className="capitalize">{media.type}</span>
                </div>
                <div>
                  <span className="font-medium">URL:</span>{" "}
                  <span className="break-all">{media.url}</span>
                </div>
                {fileRef && (
                  <div>
                    <span className="font-medium">File:</span>{" "}
                    <span>
                      {fileRef.name} ({fileRef.mimetype},{" "}
                      {(fileRef.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                )}
                {uploadedBy && (
                  <div>
                    <span className="font-medium">Uploaded By:</span>{" "}
                    <span>{uploadedBy.name}</span>
                  </div>
                )}
              </div>
              <FormControlHelper>
                The source file, type and URL are set when a Media item is
                created and can&apos;t be changed afterward.
              </FormControlHelper>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <FormControlLabel htmlFor="alt_text">
                  Alt Text
                </FormControlLabel>
                <FormControl
                  id="alt_text"
                  type="text"
                  placeholder="Accessibility alt text (optional)"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
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
                <FormControlHelper>
                  Separate tags with commas
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
                  isLoading={updateMediaMutation.isPending}
                  disabled={updateMediaMutation.isPending}
                >
                  {updateMediaMutation.isPending
                    ? "Updating..."
                    : "Update Media"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default MediaEditPage;

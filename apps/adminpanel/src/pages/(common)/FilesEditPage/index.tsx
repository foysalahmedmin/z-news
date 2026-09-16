import PageHeader from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormControl } from "@/components/ui/FormControl";
import { fetchFile, updateFile } from "@/services/file.service";
import type { TFileUpdatePayload } from "@/types/file.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ArrowLeft, Eye, File } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";

const FilesEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      navigate("/files");
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
          <Card.Content>
            <p>Loading file...</p>
          </Card.Content>
        </Card>
      </main>
    );
  }

  if (!file) {
    return (
      <main className="space-y-6">
        <PageHeader name="File Not Found" />
        <Card>
          <Card.Content>
            <p>File not found</p>
            <Button onClick={() => navigate("/files")}>Back to Files</Button>
          </Card.Content>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <PageHeader
        name="Edit File"
        breadcrumbs={[{ name: "Files", path: "/files" }, { name: "Edit File" }]}
        slot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/files/${file._id}`)}
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
          <Card.Content>
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
          </Card.Content>
        </Card>

        {/* Edit Form */}
        <Card>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <FormControl.Label htmlFor="name">Name *</FormControl.Label>
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
                <FormControl.Label htmlFor="category">
                  Category
                </FormControl.Label>
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
                <FormControl.Label htmlFor="description">
                  Description
                </FormControl.Label>
                <FormControl
                  id="description"
                  as="textarea"
                  className="h-20 py-2"
                  placeholder="File description (optional, max 500 characters)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
                <FormControl.Helper>
                  {description.length}/500 characters
                </FormControl.Helper>
              </div>

              {/* Caption */}
              <div>
                <FormControl.Label htmlFor="caption">Caption</FormControl.Label>
                <FormControl
                  id="caption"
                  type="text"
                  placeholder="File caption (optional, max 500 characters)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={500}
                />
                <FormControl.Helper>
                  {caption.length}/500 characters
                </FormControl.Helper>
              </div>

              {/* Status */}
              <div>
                <FormControl.Label htmlFor="status">Status</FormControl.Label>
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
                  onClick={() => navigate(-1)}
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
          </Card.Content>
        </Card>
      </div>
    </main>
  );
};

export default FilesEditPage;

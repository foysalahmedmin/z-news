import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import { Modal } from "@/components/ui/Modal";
import useAlert from "@/hooks/ui/useAlert";
import { cn } from "@/lib/utils";
import { createFile, deleteFile, fetchFiles } from "@/services/file.service";
import type { TFile } from "@/types/file.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  File,
  FileText,
  Image,
  Loader2,
  Music,
  Search,
  Trash,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

// Custom debounce function with cancel support
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
  let timeout: NodeJS.Timeout | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return debounced;
};

interface FileSelectionModalProps {
  // Control props
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;

  // Selection props
  value?: string | string[] | null; // Single _id or array of _ids
  onChange: (value: string | string[] | null) => void;
  isMultiple?: boolean; // Enable multiple selection

  // Filter props (from parent via props drilling)
  type?: string; // Optional filter by file type
  category?: string; // Optional filter by category

  // UI props
  className?: string;
  title?: string; // Default: "Select File(s)"

  // Optional callbacks
  onFileUploaded?: (file: TFile) => void;
  onFileDeleted?: (fileId: string) => void;
}

const FileSelectionModal = ({
  isOpen,
  setIsOpen,
  value,
  onChange,
  isMultiple = false,
  type,
  category,
  className,
  title,
  onFileUploaded,
  onFileDeleted,
}: FileSelectionModalProps) => {
  const queryClient = useQueryClient();
  const confirm = useAlert();

  // Internal state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("-created_at");
  const [typeFilter, setTypeFilter] = useState<string>(type || "all");
  const [categoryFilter, setCategoryFilter] = useState<string>(category || "");
  const [page, setPage] = useState(0);
  const [limit] = useState(24); // Grid-friendly
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [, setUploadFiles] = useState<File[]>([]);

  // Initialize selected files from value prop
  useEffect(() => {
    if (isMultiple) {
      setSelectedFiles(Array.isArray(value) ? value : value ? [value] : []);
    } else {
      setSelectedFiles(value ? [value as string] : []);
    }
  }, [value, isMultiple, isOpen]);

  // Debounce search
  const debouncedSetSearch = useMemo(
    () =>
      debounce((val: string) => {
        setDebouncedSearch(val);
        setPage(0);
      }, 500),
    [],
  );

  useEffect(() => {
    debouncedSetSearch(search);
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [search, debouncedSetSearch]);

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit,
      sort: sort || "-created_at",
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    if (typeFilter !== "all") {
      params.file_type = typeFilter;
    }
    if (categoryFilter) {
      params.category = categoryFilter;
    }
    return params;
  }, [page, limit, debouncedSearch, sort, typeFilter, categoryFilter]);

  // Fetch files
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["files", queryParams],
    queryFn: () => fetchFiles(queryParams),
    enabled: isOpen,
  });

  const files = data?.data || [];
  const totalPages = Math.ceil((data?.meta?.total || 0) / limit);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await createFile(formData);
    },
    onSuccess: (response) => {
      const uploadedFile = response.data;
      toast.success(response?.message || "File uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["files"] });
      if (onFileUploaded && uploadedFile) {
        onFileUploaded(uploadedFile);
      }
      // Auto-select uploaded file if single mode
      if (!isMultiple && uploadedFile) {
        handleSelectFile(uploadedFile._id);
        setIsOpen(false);
      } else if (isMultiple && uploadedFile) {
        handleToggleSelection(uploadedFile._id);
      }
      setUploadFiles([]);
      setIsUploading(false);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to upload file");
      setIsUploading(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFile(id),
    onSuccess: (data) => {
      toast.success(data?.message || "File deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["files"] });
      // Remove from selection if deleted file was selected
      setSelectedFiles((prev) => prev.filter((id) => id !== data.data?._id));
      if (onFileDeleted) {
        onFileDeleted(data.data?._id || "");
      }
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete file");
    },
  });

  const handleToggleSelection = useCallback((fileId: string) => {
    setSelectedFiles((prev) => {
      if (prev.includes(fileId)) {
        return prev.filter((id) => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  }, []);

  // File selection handlers
  const handleSelectFile = useCallback(
    (fileId: string) => {
      if (isMultiple) {
        // Toggle selection in multiple mode
        handleToggleSelection(fileId);
      } else {
        // Single selection
        const newValue = selectedFiles.includes(fileId) ? null : fileId;
        onChange(newValue as string | null);
        if (newValue) {
          setIsOpen(false);
        }
      }
    },
    [isMultiple, selectedFiles, onChange, setIsOpen, handleToggleSelection],
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      setUploadFiles(fileArray);
      setIsUploading(true);

      // Upload files sequentially
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append("file", file);
        await uploadMutation.mutateAsync(formData);
      }
    },
    [uploadMutation],
  );

  // Handle file delete
  const handleDeleteFile = useCallback(
    async (fileId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const ok = await confirm({
        title: "Delete File",
        message: "Are you sure you want to delete this file?",
        confirmText: "Delete",
        cancelText: "Cancel",
      });
      if (ok) {
        deleteMutation.mutate(fileId);
      }
    },
    [confirm, deleteMutation],
  );

  // Handle confirm selection (multiple mode)
  const handleConfirmSelection = useCallback(() => {
    if (isMultiple) {
      onChange(selectedFiles.length > 0 ? selectedFiles : null);
    }
    setIsOpen(false);
  }, [isMultiple, selectedFiles, onChange, setIsOpen]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  // Get file icon
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "image":
        return Image;
      case "video":
        return Video;
      case "audio":
        return Music;
      case "pdf":
      case "doc":
      case "txt":
        return FileText;
      default:
        return File;
    }
  };

  // Get file preview
  const getFilePreview = (file: TFile) => {
    if (file.metadata?.file_type === "image") {
      return file.url;
    }
    return null;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const modalTitle = title || (isMultiple ? "Select Files" : "Select File");

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      size="xl"
      className={className}
    >
      <Modal.Backdrop>
        <Modal.Content className="flex max-h-[90vh] w-full max-w-6xl flex-col">
          {/* Header */}
          <Modal.Header>
            <div className="flex w-full items-center justify-between">
              <Modal.Title>{modalTitle}</Modal.Title>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="file-upload-input"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <label htmlFor="file-upload-input">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    asChild
                  >
                    <span className="cursor-pointer">
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                <Modal.Close />
              </div>
            </div>
          </Modal.Header>

          {/* Body */}
          <Modal.Body className="flex-1 space-y-4 overflow-y-auto">
            {/* Search and Filters */}
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <FormControl
                  type="text"
                  placeholder="Search files..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-4">
                {/* Type Filter */}
                <div className="min-w-[150px] flex-1">
                  <FormControl
                    as="select"
                    className="w-full"
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="audio">Audio</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">Documents</option>
                    <option value="txt">Text</option>
                    <option value="file">Other Files</option>
                  </FormControl>
                </div>

                {/* Category Filter */}
                <div className="min-w-[150px] flex-1">
                  <FormControl
                    type="text"
                    placeholder="Category filter..."
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setPage(0);
                    }}
                  />
                </div>

                {/* Sort */}
                <div className="min-w-[150px] flex-1">
                  <FormControl
                    as="select"
                    className="w-full"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="-created_at">Newest First</option>
                    <option value="created_at">Oldest First</option>
                    <option value="name">Name A-Z</option>
                    <option value="-name">Name Z-A</option>
                    <option value="size">Size Smallest</option>
                    <option value="-size">Size Largest</option>
                  </FormControl>
                </div>
              </div>
            </div>

            {/* Selected Files Section (Multiple mode only) */}
            {isMultiple && selectedFiles.length > 0 && (
              <div className="bg-muted/50 rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    Selected ({selectedFiles.length})
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFiles([]);
                      onChange(null);
                    }}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                  {selectedFiles.map((fileId) => {
                    const file = files.find((f) => f._id === fileId);
                    // If file not in current page, show placeholder
                    if (!file) {
                      return (
                        <div
                          key={fileId}
                          className="group bg-background relative flex items-center gap-2 rounded border p-2"
                        >
                          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded">
                            <File className="text-muted-foreground h-6 w-6" />
                          </div>
                          <span className="text-muted-foreground max-w-[100px] truncate text-sm">
                            {fileId.substring(0, 8)}...
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleSelection(fileId)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={fileId}
                        className="group bg-background relative flex items-center gap-2 rounded border p-2"
                      >
                        {file.metadata?.file_type === "image" ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded">
                            {(() => {
                              const Icon = getFileIcon(
                                file.metadata?.file_type || "file",
                              );
                              return <Icon className="h-6 w-6" />;
                            })()}
                          </div>
                        )}
                        <span className="max-w-[100px] truncate text-sm">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleSelection(fileId)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* File Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <p className="text-muted-foreground">Failed to load files</p>
                <Button variant="outline" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <File className="text-muted-foreground h-12 w-12" />
                <p className="text-muted-foreground">No files found</p>
                <label htmlFor="file-upload-input">
                  <Button variant="outline" asChild>
                    <span className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </span>
                  </Button>
                </label>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {files.map((file) => {
                    const Icon = getFileIcon(
                      file.metadata?.file_type || "file",
                    );
                    const preview = getFilePreview(file);
                    const isSelected = selectedFiles.includes(file._id);

                    return (
                      <div
                        key={file._id}
                        className={cn(
                          "group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                          isSelected
                            ? "border-primary ring-primary bg-primary/10 ring-2"
                            : "border-muted hover:border-primary/50",
                        )}
                        onClick={() => handleSelectFile(file._id)}
                      >
                        {/* Preview/Icon */}
                        {preview ? (
                          <img
                            src={preview}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="bg-muted flex h-full w-full items-center justify-center">
                            <Icon className="text-muted-foreground h-12 w-12" />
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="bg-primary text-primary-foreground absolute top-2 left-2 rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}

                        {/* Delete Button (on hover) */}
                        <button
                          type="button"
                          className="bg-destructive text-destructive-foreground absolute top-2 right-2 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={(e) => handleDeleteFile(file._id, e)}
                        >
                          <Trash className="h-4 w-4" />
                        </button>

                        {/* File Info */}
                        <div className="absolute right-0 bottom-0 left-0 bg-black/70 p-2 text-xs text-white">
                          <p className="truncate font-medium">{file.name}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="capitalize">
                              {file.metadata?.file_type}
                            </span>
                            <span>{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-muted-foreground text-sm">
                      Page {page + 1} of {totalPages} ({data?.meta?.total || 0}{" "}
                      files)
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </Modal.Body>

          {/* Footer */}
          <Modal.Footer>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {isMultiple ? (
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedFiles.length === 0}
              >
                Select {selectedFiles.length} file
                {selectedFiles.length !== 1 ? "s" : ""}
              </Button>
            ) : (
              <Button onClick={handleCancel}>Close</Button>
            )}
          </Modal.Footer>
        </Modal.Content>
      </Modal.Backdrop>
    </Modal>
  );
};

export default FileSelectionModal;

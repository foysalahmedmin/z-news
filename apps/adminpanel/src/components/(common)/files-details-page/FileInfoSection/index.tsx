import type { TFile, TFileStatus } from "@/types/file.type";
import {
  Archive,
  Calendar,
  Eye,
  EyeOff,
  File,
  FileText,
  Image,
  Music,
  Video,
} from "lucide-react";
import React from "react";

const getStatusColor = (status?: TFileStatus) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "inactive":
      return "bg-red-100 text-red-800 border-red-200";
    case "archived":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status?: TFileStatus) => {
  switch (status) {
    case "active":
      return <Eye className="h-4 w-4" />;
    case "inactive":
      return <EyeOff className="h-4 w-4" />;
    case "archived":
      return <Archive className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

const getFileTypeIcon = (type?: string) => {
  switch (type) {
    case "image":
      return <Image className="h-8 w-8" />;
    case "video":
      return <Video className="h-8 w-8" />;
    case "audio":
      return <Music className="h-8 w-8" />;
    case "pdf":
    case "doc":
    case "txt":
      return <FileText className="h-8 w-8" />;
    default:
      return <File className="h-8 w-8" />;
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

type FileInfoSectionProps = {
  file?: Partial<TFile>;
};

const FileInfoSection: React.FC<FileInfoSectionProps> = ({ file }) => {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        {file?.metadata?.file_type === "image" && file?.url ? (
          <img
            src={file.url}
            alt={file.name}
            className="size-32 rounded-md object-cover"
          />
        ) : (
          <div className="bg-muted flex size-32 items-center justify-center rounded-md">
            {getFileTypeIcon(file?.metadata?.file_type)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {file?.name || "Untitled File"}
          </h2>
        </div>
        <div className="text-muted-foreground flex items-center space-x-4 text-sm">
          <span className="flex items-center">
            <File className="mr-1 h-4 w-4" />
            {file?.filename}
          </span>
          <span>Size: {formatFileSize(file?.size)}</span>
          <span className="capitalize">Type: {file?.metadata?.file_type}</span>
        </div>
        <div
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(file?.status)}`}
        >
          {getStatusIcon(file?.status)}
          <span className="ml-1 capitalize">{file?.status}</span>
        </div>
        {file?.author && (
          <div className="text-muted-foreground text-sm">
            Author: {file.author.name || file.author.email || "Unknown"}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileInfoSection;

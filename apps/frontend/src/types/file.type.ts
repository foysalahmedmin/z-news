import type { Response } from "./response.type";

export type TFileType =
  | "image"
  | "video"
  | "audio"
  | "file"
  | "pdf"
  | "doc"
  | "txt";

export type TFileStatus = "active" | "inactive" | "archived";

export type TFileProvider = "local" | "gcs";

export type TFile = {
  _id: string;
  name: string;
  originalname: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  author: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  provider: TFileProvider;
  category?: string;
  description?: string;
  caption?: string;
  status: TFileStatus;
  metadata?: {
    path?: string;
    bucket?: string;
    extension?: string;
    file_type?: TFileType;
  };
  created_at?: string;
  updated_at?: string;
};

export type TFileCreatePayload = {
  name?: string;
  category?: string;
  description?: string;
  caption?: string;
  status?: TFileStatus;
  file: File;
};

export type TFileUpdatePayload = {
  name?: string;
  category?: string;
  description?: string;
  caption?: string;
  status?: TFileStatus;
};

export type TFileResponse = Response<TFile>;
export type TFilesResponse = Response<TFile[]>;

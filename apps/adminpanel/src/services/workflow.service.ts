import api from "@/lib/api";
import { Response } from "@/types/response.type";

export type TWorkflowStageStatus =
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected";
export type TWorkflowPriority = "low" | "medium" | "high" | "urgent";

export type TWorkflowStage = {
  name: string;
  status: TWorkflowStageStatus;
  assignee?: { _id: string; name: string; email: string };
  comment?: string;
  updated_at?: Date;
};

export type TWorkflow = {
  _id: string;
  news: { _id: string; title: string; slug: string };
  current_stage: string;
  stages: TWorkflowStage[];
  deadline?: Date;
  priority: TWorkflowPriority;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

export async function fetchAllWorkflows(
  query?: Record<string, any>,
): Promise<Response<TWorkflow[]>> {
  const response = await api.get("/api/workflow", { params: query });
  return response.data;
}

export async function startWorkflow(payload: {
  news: string;
  stages?: any[];
  priority?: string;
  deadline?: Date;
}): Promise<Response<TWorkflow>> {
  const response = await api.post("/api/workflow/start", payload);
  return response.data;
}

export async function updateWorkflowStage(
  id: string,
  payload: {
    stage_name: string;
    status: TWorkflowStageStatus;
    assignee?: string;
    comment?: string;
  },
): Promise<Response<TWorkflow>> {
  const response = await api.patch(`/api/workflow/${id}/stage`, payload);
  return response.data;
}

export async function fetchWorkflowByNewsId(
  newsId: string,
): Promise<Response<TWorkflow>> {
  const response = await api.get(`/api/workflow/news/${newsId}`);
  return response.data;
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Send, User, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import Loader from "@/components/partials/Loader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormControl } from "@/components/ui/FormControl";
import type { TWorkflowStageStatus } from "@/services/workflow.service";
import {
  fetchWorkflowByNewsId,
  startWorkflow,
  updateWorkflowStage,
} from "@/services/workflow.service";
import type { TNews } from "@/types/news.type";

type TNewsArticleWorkflowSectionProps = {
  news: TNews;
};

const NewsArticleWorkflowSection: React.FC<
  TNewsArticleWorkflowSectionProps
> = ({ news }) => {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: workflowData, isLoading } = useQuery({
    queryKey: ["news-workflow", news._id],
    queryFn: () => fetchWorkflowByNewsId(news._id),
    retry: false, // Don't retry if not found (404 is expected if workflow hasn't started)
  });

  const startMutation = useMutation({
    mutationFn: (payload: { news: string; priority: string }) =>
      startWorkflow(payload),
    onSuccess: () => {
      toast.success("Editorial workflow started!");
      queryClient.invalidateQueries({ queryKey: ["news-workflow", news._id] });
    },
  });

  const stageMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      stage_name: string;
      status: TWorkflowStageStatus;
      comment: string;
    }) =>
      updateWorkflowStage(payload.id, {
        stage_name: payload.stage_name,
        status: payload.status,
        comment: payload.comment,
      }),
    onSuccess: () => {
      toast.success("Stage status updated!");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["news-workflow", news._id] });
    },
  });

  if (isLoading) return <Loader />;

  const workflow = workflowData?.data;

  if (!workflow) {
    return (
      <div className="bg-muted/20 flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed py-12">
        <div className="bg-primary/10 text-primary rounded-full p-4">
          <Clock className="h-10 w-10" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold">No Workflow Started</h3>
          <p className="text-muted-foreground max-w-sm text-sm">
            This article isn't currently in the editorial pipeline. Start a
            workflow to assign reviewers and editors.
          </p>
        </div>
        <Button
          onClick={() =>
            startMutation.mutate({ news: news._id, priority: "medium" })
          }
          isLoading={startMutation.isPending}
        >
          <Send className="mr-2 h-4 w-4" />
          Start Editorial Pipeline
        </Button>
      </div>
    );
  }

  const currentStageName = workflow.current_stage;

  return (
    <div className="space-y-8">
      {/* Workflow Header */}
      <div className="bg-primary/5 border-primary/20 flex items-center justify-between rounded-lg border p-4">
        <div>
          <h3 className="flex items-center gap-2 font-bold">
            Status:{" "}
            <span className="text-primary uppercase">
              {currentStageName.replace("_", " ")}
            </span>
          </h3>
          <p className="text-muted-foreground text-xs">
            Original deadline:{" "}
            {workflow.deadline
              ? new Date(workflow.deadline).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
        <Badge
          className={
            workflow.priority === "urgent"
              ? "bg-red-500"
              : workflow.priority === "high"
                ? "bg-orange-500"
                : "bg-blue-500"
          }
        >
          {workflow.priority} priority
        </Badge>
      </div>

      {/* Progress Timeline */}
      <div className="relative">
        <div className="bg-border absolute top-0 bottom-0 left-4 hidden w-0.5 sm:block" />
        <div className="space-y-6 sm:ml-4">
          {workflow.stages.map((stage) => {
            const isCompleted = stage.status === "approved";
            const isActive = workflow.current_stage === stage.name;
            const isRejected = stage.status === "rejected";

            return (
              <div
                key={stage.name}
                className={`relative flex flex-col gap-4 rounded-lg p-4 transition-all sm:flex-row ${isActive ? "bg-muted ring-primary/20 border shadow-sm ring-1" : "opacity-70 grayscale-[0.5]"}`}
              >
                {/* Status Icon Pillar */}
                <div
                  className={`bg-background absolute -left-[2.1rem] z-10 hidden h-8 w-8 items-center justify-center rounded-full border-2 sm:flex ${isCompleted ? "border-green-500 text-green-500" : isRejected ? "border-red-500 text-red-500" : isActive ? "border-primary text-primary animate-pulse" : "border-muted-foreground text-muted-foreground opacity-30"}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isRejected ? (
                    <XCircle className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold tracking-wider uppercase">
                      {stage.name.replace("_", " ")}
                    </h4>
                    <Badge
                      className={
                        stage.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : stage.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-800"
                      }
                    >
                      {stage.status}
                    </Badge>
                  </div>

                  <div className="text-muted-foreground flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />{" "}
                      {stage.assignee?.name || "Unassigned"}
                    </span>
                    {stage.updated_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{" "}
                        {new Date(stage.updated_at).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {stage.comment && (
                    <div className="rounded border bg-white/40 p-3 text-sm italic">
                      "{stage.comment}"
                    </div>
                  )}

                  {isActive && (
                    <div className="mt-2 space-y-4 border-t pt-4">
                      <FormControl
                        as="textarea"
                        placeholder="Add editorial feedback or comments..."
                        value={comment}
                        onChange={(e: any) => setComment(e.target.value)}
                        className="bg-background min-h-[100px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() =>
                            stageMutation.mutate({
                              id: workflow._id,
                              stage_name: stage.name,
                              status: "rejected",
                              comment,
                            })
                          }
                          isLoading={stageMutation.isPending}
                          disabled={stageMutation.isPending}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Send Back (Reject)
                        </Button>
                        <Button
                          variant="gradient"
                          onClick={() =>
                            stageMutation.mutate({
                              id: workflow._id,
                              stage_name: stage.name,
                              status: "approved",
                              comment,
                            })
                          }
                          isLoading={stageMutation.isPending}
                          disabled={stageMutation.isPending}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve Stage
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewsArticleWorkflowSection;

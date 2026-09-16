import Loader from "@/components/partials/Loader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { TWorkflow } from "@/services/workflow.service";
import { fetchAllWorkflows } from "@/services/workflow.service";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Clock, MoreVertical, User } from "lucide-react";

const COLUMNS = [
  { id: "drafting", title: "Drafting" },
  { id: "editing", title: "Editing" },
  { id: "reviewing", title: "Reviewing" },
  { id: "legal_review", title: "Legal Review" },
  { id: "final_approval", title: "Final Approval" },
];

const NewsArticlesWorkflowKanbanSection = () => {
  const { data: workflowsData, isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => fetchAllWorkflows(),
  });

  if (isLoading) return <Loader />;

  const workflows = workflowsData?.data || [];

  const groupedWorkflows = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = workflows.filter((w) => w.current_stage === col.id);
      return acc;
    },
    {} as Record<string, TWorkflow[]>,
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => (
        <div
          key={col.id}
          className="bg-muted/30 flex min-w-[280px] flex-1 flex-col rounded-lg p-2"
        >
          <div className="mb-4 flex items-center justify-between px-2">
            <h3 className="text-muted-foreground text-sm font-bold uppercase">
              {col.title} ({groupedWorkflows[col.id]?.length || 0})
            </h3>
            <div className="bg-primary/40 h-2 w-2 rounded-full" />
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {groupedWorkflows[col.id]?.map((w) => (
              <Card
                key={w._id}
                className="border-l-primary/60 cursor-pointer border-l-4 transition-shadow hover:shadow-md"
              >
                <Card.Content className="p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge className={getPriorityColor(w.priority)}>
                      {w.priority}
                    </Badge>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>

                  <h4 className="mb-3 line-clamp-2 leading-snug font-semibold">
                    {w.news?.title || "Untitled Article"}
                  </h4>

                  <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {w.deadline
                        ? new Date(w.deadline).toLocaleDateString()
                        : "No deadline"}
                    </div>
                    {w.stages.find((s) => s.name === w.current_stage)
                      ?.assignee && (
                      <div className="bg-primary/5 flex items-center gap-1 rounded-full px-2 py-0.5">
                        <User className="h-3 w-3" strokeWidth={3} />
                        <span className="font-bold">
                          {
                            w.stages
                              .find((s) => s.name === w.current_stage)
                              ?.assignee?.name.split(" ")[0]
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </Card.Content>
              </Card>
            ))}

            {groupedWorkflows[col.id]?.length === 0 && (
              <div className="text-muted-foreground/30 flex flex-col items-center justify-center py-8">
                <AlertCircle className="mb-2 h-8 w-8" />
                <span className="text-xs">No articles here</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
export default NewsArticlesWorkflowKanbanSection;

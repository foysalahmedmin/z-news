import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, History, RefreshCcw, User } from "lucide-react";
import React from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/Button";
import { fetchNewsVersions, restoreNewsVersion } from "@/services/news.service";
import type { TArticleVersion, TNews } from "@/types/news.type";
import VersionDiffModal from "./VersionDiffModal";

type TNewsArticleHistorySectionProps = {
  news: TNews;
};

const NewsArticleHistorySection: React.FC<TNewsArticleHistorySectionProps> = ({
  news,
}) => {
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] =
    React.useState<TArticleVersion | null>(null);
  const [isDiffOpen, setIsDiffOpen] = React.useState(false);

  const { data: versionsData, isLoading } = useQuery({
    queryKey: ["news-versions", news._id],
    queryFn: () => fetchNewsVersions(news._id),
  });

  const restoreMutation = useMutation({
    mutationFn: (versionId: string) => restoreNewsVersion(versionId),
    onSuccess: () => {
      toast.success("Version restored successfully!");
      queryClient.invalidateQueries({ queryKey: ["news", news._id] });
      queryClient.invalidateQueries({ queryKey: ["news-versions", news._id] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to restore version",
      );
    },
  });

  if (isLoading) return <div>Loading history...</div>;

  const versions = versionsData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b pb-2">
        <History className="text-muted-foreground h-5 w-5" />
        <h3 className="text-lg font-semibold">Article Version History</h3>
      </div>

      {versions.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center">
          No version history found.
        </p>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => (
            <div
              key={v._id}
              className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                    v{v.version_number}
                  </span>
                  <span className="font-medium">
                    {new Date(v.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {v.changed_by?.name || "Unknown"}
                  </div>
                  {v.change_summary && (
                    <div className="italic">"{v.change_summary}"</div>
                  )}
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setSelectedVersion(v);
                    setIsDiffOpen(true);
                  }}
                >
                  <Eye className="h-3 w-3" />
                  Compare
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => restoreMutation.mutate(v._id)}
                  isLoading={restoreMutation.isPending}
                >
                  <RefreshCcw className="h-3 w-3" />
                  Restore
                </Button>
              </div>
            </div>
          ))}

          <VersionDiffModal
            isOpen={isDiffOpen}
            onClose={() => setIsDiffOpen(false)}
            version={selectedVersion}
            currentNews={news}
          />
        </div>
      )}
    </div>
  );
};

export default NewsArticleHistorySection;

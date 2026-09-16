import NewsArticlesCalendarSection from "@/components/(common)/news-articles-page/NewsArticlesCalendarSection";
import NewsArticlesDataTableSection from "@/components/(common)/news-articles-page/NewsArticlesDataTableSection";
import NewsArticlesFilterSection from "@/components/(common)/news-articles-page/NewsArticlesFilterSection";
import NewsArticlesStatisticsSection from "@/components/(common)/news-articles-page/NewsArticlesStatisticsSection";
import NewsArticlesWorkflowKanbanSection from "@/components/(common)/news-articles-page/NewsArticlesWorkflowKanbanSection";
import PageHeader from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import useMenu from "@/hooks/states/useMenu";
import useUser from "@/hooks/states/useUser";
import useAlert from "@/hooks/ui/useAlert";
import { fetchCategoriesTree } from "@/services/category.service";
import {
  deleteNews,
  deleteSelfNews,
  fetchBulkNews,
  fetchPublicBulkNews,
  updateNews,
  updateSelfNews,
} from "@/services/news.service";
import { fetchWritersUsers } from "@/services/user.service";
import type { TNews, TUpdateNewsPayload } from "@/types/news.type";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  Calendar as CalendarIcon,
  LayoutDashboard,
  Plus,
  Table,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";

const NewsArticlesPage = () => {
  const { user } = useUser();
  const { info } = user || {};

  // Hooks and state initialization
  const { activeBreadcrumbs } = useMenu();
  const queryClient = useQueryClient();
  const confirm = useAlert();

  // Filtering and pagination state
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-published_at");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("");
  const [featured, setFeatured] = useState("");
  const [publishedAtGte, setPublishedAtGte] = useState("");
  const [publishedAtLte, setPublishedAtLte] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "kanban">(
    "table",
  );

  // API mutations
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: TUpdateNewsPayload;
    }) =>
      ["super-admin", "admin", "editor"].includes(info?.role || "")
        ? updateNews(id, payload)
        : updateSelfNews(id, payload),
    onSuccess: (data) => {
      toast.success(data?.message || "News updated successfully!");
      // Invalidate and refetch to get updated data
      queryClient.invalidateQueries({ queryKey: ["news_articles"] });
      queryClient.refetchQueries({ queryKey: ["news_articles"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update news";
      toast.error(errorMessage);
      console.error("Update news error:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      ["super-admin", "admin"].includes(info?.role || "")
        ? deleteNews(id)
        : deleteSelfNews(id),
    onSuccess: (data) => {
      toast.success(data?.message || "News deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["news_articles"] });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete news");
      console.error("Delete news error:", error);
    },
  });

  // API queries
  const newsQuery = useQuery({
    queryKey: [
      "news_articles",
      {
        sort,
        search,
        page,
        limit,
        category,
        publishedAtGte,
        publishedAtLte,
        author,
        status,
        featured,
      },
    ],
    queryFn: () =>
      ["super-admin", "admin", "editor"].includes(info?.role || "")
        ? fetchBulkNews({
            page,
            limit,
            ...(category && { category }),
            sort: sort || "-published_at",
            ...(search && { search }),
            ...(publishedAtGte && { published_at_gte: publishedAtGte }),
            ...(publishedAtLte && { published_at_lte: publishedAtLte }),
            ...(author && { author }),
            ...(status && { status }),
            ...(featured && {
              is_featured: featured === "featured" ? true : false,
            }),
          })
        : fetchPublicBulkNews({
            page,
            limit,
            ...(category && { category }),
            sort: sort || "-published_at",
            ...(search && { search }),
            ...(publishedAtGte && { published_at_gte: publishedAtGte }),
            ...(publishedAtLte && { published_at_lte: publishedAtLte }),
            ...(author && { author }),
            ...(status && { status: "published" }),
            ...(featured && {
              is_featured: featured === "featured" ? true : false,
            }),
          }),
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      fetchCategoriesTree({ sort: "sequence", status: "active", limit: 25 }),
  });

  const { data: usersResponse } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchWritersUsers(),
  });

  // Event handlers
  const handleToggleFeatured = useCallback(
    (news: TNews) => {
      try {
        const payload: TUpdateNewsPayload = {
          is_featured: !news.is_featured,
        };

        // Only include thumbnail if it exists
        if (news.thumbnail?._id) {
          payload.thumbnail = news.thumbnail._id;
        }

        updateMutation.mutate({
          id: news._id,
          payload,
        });
      } catch (error) {
        console.error("Error in handleToggleFeatured:", error);
        toast.error("Failed to toggle featured status");
      }
    },
    [updateMutation],
  );

  const handleDelete = useCallback(
    async (news: TNews) => {
      const ok = await confirm({
        title: "Delete news",
        message: "Are you sure you want to delete this news?",
        confirmText: "Delete",
        cancelText: "Cancel",
      });
      if (ok) {
        deleteMutation.mutate(news._id);
      }
    },
    [confirm, deleteMutation],
  );

  return (
    <main className="space-y-6">
      <PageHeader
        name="News Articles"
        slot={
          <div className="flex gap-2">
            <div className="bg-muted/20 mr-4 flex rounded-md border">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                title="Table View"
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                title="Calendar View"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                title="Kanban Board"
              >
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </div>

            {["admin", "author"].includes(info?.role || "") && (
              <Button asChild>
                <Link
                  className="flex h-full items-center"
                  to="/news-articles/add"
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <NewsArticlesStatisticsSection meta={newsQuery.data?.meta} />

      {viewMode === "table" && (
        <>
          <Card>
            <Card.Content>
              <NewsArticlesFilterSection
                state={{
                  category,
                  setCategory,
                  author,
                  setAuthor,
                  status,
                  setStatus,
                  featured,
                  setFeatured,
                  publishedAtGte,
                  setPublishedAtGte,
                  publishedAtLte,
                  setPublishedAtLte,
                  categories: categoriesResponse?.data || [],
                  users: usersResponse?.data || [],
                }}
              />
            </Card.Content>
          </Card>

          <Card>
            <Card.Content>
              <NewsArticlesDataTableSection
                data={newsQuery.data?.data || []}
                breadcrumbs={activeBreadcrumbs || []}
                isLoading={newsQuery.isLoading}
                isError={newsQuery.isError}
                onDelete={handleDelete}
                onToggleFeatured={handleToggleFeatured}
                state={{
                  total: newsQuery.data?.meta?.total || 0,
                  page,
                  setPage,
                  limit,
                  setLimit,
                  search,
                  setSearch,
                  sort,
                  setSort,
                }}
              />
            </Card.Content>
          </Card>
        </>
      )}

      {viewMode === "calendar" && (
        <Card>
          <Card.Content className="pt-6">
            <NewsArticlesCalendarSection />
          </Card.Content>
        </Card>
      )}

      {viewMode === "kanban" && <NewsArticlesWorkflowKanbanSection />}
    </main>
  );
};

export default NewsArticlesPage;

import Loader from "@/components/partials/Loader";
import PageHeader from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import useAlert from "@/hooks/ui/useAlert";
import { cn } from "@/lib/utils";
import {
  deleteCategoryPermanent,
  fetchCategories,
  restoreCategory,
} from "@/services/category.service";
import {
  deleteCommentPermanent,
  fetchComments,
  restoreComment,
} from "@/services/comment.service";
import {
  deleteNewsPermanent,
  fetchBulkNews,
  restoreNews,
} from "@/services/news.service";
import {
  deleteUserPermanent,
  fetchUsers,
  restoreUser,
} from "@/services/user.service";
import type { TCategory } from "@/types/category.type";
import type { TComment } from "@/types/comment.type";
import type { TNews } from "@/types/news.type";
import type { TUser } from "@/types/user.type";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  FolderOpen,
  MessageSquare,
  RefreshCw,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const BinPage = () => {
  const confirm = useAlert();
  const [activeTab, setActiveTab] = useState<string>("users");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Fetch deleted users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["deleted-users", page, limit],
    queryFn: () => fetchUsers({ page, limit, is_deleted: true }),
    enabled: activeTab === "users",
  });

  // Fetch deleted categories
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["deleted-categories", page, limit],
    queryFn: () => fetchCategories({ page, limit, is_deleted: true }),
    enabled: activeTab === "categories",
  });

  // Fetch deleted news
  const {
    data: newsData,
    isLoading: isLoadingNews,
    refetch: refetchNews,
  } = useQuery({
    queryKey: ["deleted-news", page, limit],
    queryFn: () => fetchBulkNews({ page, limit, is_deleted: true }),
    enabled: activeTab === "news",
  });

  // Fetch deleted comments
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useQuery({
    queryKey: ["deleted-comments", page, limit],
    queryFn: () => fetchComments({ page, limit, is_deleted: true }),
    enabled: activeTab === "comments",
  });

  // Handle restore user
  const handleRestoreUser = async (user: TUser) => {
    try {
      const ok = await confirm({
        title: "Restore User",
        message: `Are you sure you want to restore ${user.name}?`,
        confirmText: "Restore",
        cancelText: "Cancel",
      });

      if (ok) {
        await restoreUser(user._id);
        toast.success("User restored successfully");
        refetchUsers();
      }
    } catch (error) {
      toast.error("Failed to restore user");
      console.error(error);
    }
  };

  // Handle permanent delete user
  const handleDeleteUserPermanent = async (user: TUser) => {
    try {
      const ok = await confirm({
        title: "Delete User Permanently",
        message: `Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`,
        confirmText: "Delete Permanently",
        cancelText: "Cancel",
      });

      if (ok) {
        await deleteUserPermanent(user._id);
        toast.success("User deleted permanently");
        refetchUsers();
      }
    } catch (error) {
      toast.error("Failed to delete user");
      console.error(error);
    }
  };

  // Handle restore category
  const handleRestoreCategory = async (category: TCategory) => {
    try {
      const ok = await confirm({
        title: "Restore Category",
        message: `Are you sure you want to restore ${category.name}?`,
        confirmText: "Restore",
        cancelText: "Cancel",
      });

      if (ok) {
        await restoreCategory(category._id);
        toast.success("Category restored successfully");
        refetchCategories();
      }
    } catch (error) {
      toast.error("Failed to restore category");
      console.error(error);
    }
  };

  // Handle permanent delete category
  const handleDeleteCategoryPermanent = async (category: TCategory) => {
    try {
      const ok = await confirm({
        title: "Delete Category Permanently",
        message: `Are you sure you want to permanently delete ${category.name}? This action cannot be undone.`,
        confirmText: "Delete Permanently",
        cancelText: "Cancel",
      });

      if (ok) {
        await deleteCategoryPermanent(category._id);
        toast.success("Category deleted permanently");
        refetchCategories();
      }
    } catch (error) {
      toast.error("Failed to delete category");
      console.error(error);
    }
  };

  // Handle restore news
  const handleRestoreNews = async (news: TNews) => {
    try {
      const ok = await confirm({
        title: "Restore News",
        message: `Are you sure you want to restore ${news.title}?`,
        confirmText: "Restore",
        cancelText: "Cancel",
      });

      if (ok) {
        await restoreNews(news._id);
        toast.success("News restored successfully");
        refetchNews();
      }
    } catch (error) {
      toast.error("Failed to restore news");
      console.error(error);
    }
  };

  // Handle permanent delete news
  const handleDeleteNewsPermanent = async (news: TNews) => {
    try {
      const ok = await confirm({
        title: "Delete News Permanently",
        message: `Are you sure you want to permanently delete ${news.title}? This action cannot be undone.`,
        confirmText: "Delete Permanently",
        cancelText: "Cancel",
      });

      if (ok) {
        await deleteNewsPermanent(news._id);
        toast.success("News deleted permanently");
        refetchNews();
      }
    } catch (error) {
      toast.error("Failed to delete news");
      console.error(error);
    }
  };

  // Handle restore comment
  const handleRestoreComment = async (comment: TComment) => {
    try {
      const ok = await confirm({
        title: "Restore Comment",
        message: `Are you sure you want to restore this comment?`,
        confirmText: "Restore",
        cancelText: "Cancel",
      });

      if (ok) {
        await restoreComment(comment._id);
        toast.success("Comment restored successfully");
        refetchComments();
      }
    } catch (error) {
      toast.error("Failed to restore comment");
      console.error(error);
    }
  };

  // Handle permanent delete comment
  const handleDeleteCommentPermanent = async (comment: TComment) => {
    try {
      const ok = await confirm({
        title: "Delete Comment Permanently",
        message: `Are you sure you want to permanently delete this comment? This action cannot be undone.`,
        confirmText: "Delete Permanently",
        cancelText: "Cancel",
      });

      if (ok) {
        await deleteCommentPermanent(comment._id);
        toast.success("Comment deleted permanently");
        refetchComments();
      }
    } catch (error) {
      toast.error("Failed to delete comment");
      console.error(error);
    }
  };

  // Get icon for each tab
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "users":
        return <User className="size-4" />;
      case "categories":
        return <FolderOpen className="size-4" />;
      case "news":
        return <FileText className="size-4" />;
      case "comments":
        return <MessageSquare className="size-4" />;
      default:
        return null;
    }
  };

  // Render users tab content
  const renderUsersTab = () => {
    if (isLoadingUsers) {
      return (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <Loader className="min-h-auto lg:min-h-auto" />
        </div>
      );
    }

    const users = usersData?.data || [];
    const metaTotal = Number(usersData?.meta?.total || 0);
    const metaPage = Number(usersData?.meta?.page || page);
    const metaLimit = Number(usersData?.meta?.limit || limit);

    return (
      <>
        <div className="text-muted-foreground text-sm">
          <span className="font-medium">Total:</span> {metaTotal}
        </div>

        <div className="flex flex-1 flex-col space-y-4">
          {users.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              No deleted users found.
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-card rounded border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <User className="text-muted-foreground size-4" />
                        <p className="text-foreground truncate font-semibold">
                          {user.name}
                        </p>
                        <span className="bg-muted text-muted-foreground rounded-full border px-2 py-1 text-xs font-medium capitalize">
                          {user.role}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-muted-foreground text-sm">
                          <span className="font-medium">Email:</span>{" "}
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-2">
                      <Button
                        onClick={() => handleRestoreUser(user)}
                        size={"sm"}
                        variant="outline"
                        className="[--accent:green]"
                        shape={"default"}
                      >
                        <RefreshCw className="size-4" />
                        Restore
                      </Button>
                      <Button
                        onClick={() => handleDeleteUserPermanent(user)}
                        size={"sm"}
                        variant="outline"
                        className="text-red-600 [--accent:red] hover:text-red-700"
                        shape={"default"}
                      >
                        <Trash2 className="size-4" />
                        Delete Permanently
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Pagination
          total={metaTotal}
          limit={metaLimit}
          page={metaPage}
          setLimit={setLimit}
          setPage={setPage}
        />
      </>
    );
  };

  // Render categories tab content
  const renderCategoriesTab = () => {
    if (isLoadingCategories) {
      return (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <Loader className="min-h-auto lg:min-h-auto" />
        </div>
      );
    }

    const categories = categoriesData?.data || [];
    const metaTotal = Number(categoriesData?.meta?.total || 0);
    const metaPage = Number(categoriesData?.meta?.page || page);
    const metaLimit = Number(categoriesData?.meta?.limit || limit);

    return (
      <>
        <div className="text-muted-foreground text-sm">
          <span className="font-medium">Total:</span> {metaTotal}
        </div>

        <div className="flex flex-1 flex-col space-y-4">
          {categories.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              No deleted categories found.
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="bg-card rounded border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="text-muted-foreground size-4" />
                        <p className="text-foreground truncate font-semibold">
                          {category.name}
                        </p>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-muted-foreground text-sm">
                          <span className="font-medium">Slug:</span>{" "}
                          {category.slug}
                        </p>
                        {category.description && (
                          <p className="text-foreground leading-relaxed">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-2">
                      <Button
                        onClick={() => handleRestoreCategory(category)}
                        size={"sm"}
                        variant="outline"
                        className="[--accent:green]"
                        shape={"default"}
                      >
                        <RefreshCw className="size-4" />
                        Restore
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategoryPermanent(category)}
                        size={"sm"}
                        variant="outline"
                        className="text-red-600 [--accent:red] hover:text-red-700"
                        shape={"default"}
                      >
                        <Trash2 className="size-4" />
                        Delete Permanently
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Pagination
          total={metaTotal}
          limit={metaLimit}
          page={metaPage}
          setLimit={setLimit}
          setPage={setPage}
        />
      </>
    );
  };

  // Render news tab content
  const renderNewsTab = () => {
    if (isLoadingNews) {
      return (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <Loader className="min-h-auto lg:min-h-auto" />
        </div>
      );
    }

    const news = newsData?.data || [];
    const metaTotal = Number(newsData?.meta?.total || 0);
    const metaPage = Number(newsData?.meta?.page || page);
    const metaLimit = Number(newsData?.meta?.limit || limit);

    return (
      <>
        <div className="text-muted-foreground text-sm">
          <span className="font-medium">Total:</span> {metaTotal}
        </div>

        <div className="flex flex-1 flex-col space-y-4">
          {news.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              No deleted news found.
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div
                  key={item._id}
                  className="bg-card rounded border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <FileText className="text-muted-foreground size-4" />
                        <p className="text-foreground truncate font-semibold">
                          {item.title}
                        </p>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-muted-foreground text-sm">
                          <span className="font-medium">Slug:</span> {item.slug}
                        </p>
                        {item.description && (
                          <p className="text-foreground leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-2">
                      <Button
                        onClick={() => handleRestoreNews(item)}
                        size={"sm"}
                        variant="outline"
                        className="[--accent:green]"
                        shape={"default"}
                      >
                        <RefreshCw className="size-4" />
                        Restore
                      </Button>
                      <Button
                        onClick={() => handleDeleteNewsPermanent(item)}
                        size={"sm"}
                        variant="outline"
                        className="text-red-600 [--accent:red] hover:text-red-700"
                        shape={"default"}
                      >
                        <Trash2 className="size-4" />
                        Delete Permanently
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Pagination
          total={metaTotal}
          limit={metaLimit}
          page={metaPage}
          setLimit={setLimit}
          setPage={setPage}
        />
      </>
    );
  };

  // Render comments tab content
  const renderCommentsTab = () => {
    if (isLoadingComments) {
      return (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <Loader className="min-h-auto lg:min-h-auto" />
        </div>
      );
    }

    const comments = commentsData?.data || [];
    const metaTotal = Number(commentsData?.meta?.total || 0);
    const metaPage = Number(commentsData?.meta?.page || page);
    const metaLimit = Number(commentsData?.meta?.limit || limit);

    return (
      <>
        <div className="text-muted-foreground text-sm">
          <span className="font-medium">Total:</span> {metaTotal}
        </div>

        <div className="flex flex-1 flex-col space-y-4">
          {comments.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              No deleted comments found.
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="bg-card rounded border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="text-muted-foreground size-4" />
                        <p className="text-foreground truncate font-semibold">
                          {comment.news?.title || "Unknown News"}
                        </p>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-muted-foreground text-sm">
                          <span className="font-medium">By:</span>{" "}
                          {comment.name} ({comment.email})
                        </p>
                        <p className="text-foreground leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-2">
                      <Button
                        onClick={() => handleRestoreComment(comment)}
                        size={"sm"}
                        variant="outline"
                        className="[--accent:green]"
                        shape={"default"}
                      >
                        <RefreshCw className="size-4" />
                        Restore
                      </Button>
                      <Button
                        onClick={() => handleDeleteCommentPermanent(comment)}
                        size={"sm"}
                        variant="outline"
                        className="text-red-600 [--accent:red] hover:text-red-700"
                        shape={"default"}
                      >
                        <Trash2 className="size-4" />
                        Delete Permanently
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Pagination
          total={metaTotal}
          limit={metaLimit}
          page={metaPage}
          setLimit={setLimit}
          setPage={setPage}
        />
      </>
    );
  };

  // Render active tab content
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "users":
        return renderUsersTab();
      case "categories":
        return renderCategoriesTab();
      case "news":
        return renderNewsTab();
      case "comments":
        return renderCommentsTab();
      default:
        return null;
    }
  };

  return (
    <main className="flex size-full flex-col space-y-6">
      <PageHeader name="Recycle Bin" />

      <section className="flex flex-1 flex-col space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-muted-foreground text-sm">
            Select a category to view deleted items
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex overflow-hidden rounded border">
              {["users", "categories", "news", "comments"].map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm",
                    activeTab === tab
                      ? "bg-accent text-accent-foreground"
                      : "bg-card",
                  )}
                  onClick={() => setActiveTab(tab)}
                >
                  {getTabIcon(tab)}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {renderActiveTabContent()}
      </section>
    </main>
  );
};

export default BinPage;

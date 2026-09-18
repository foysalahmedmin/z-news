"use client";

import { URLS } from "@/config";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import useAlert from "@/hooks/ui/useAlert";
import {
  getMyProfile,
  unfollowAuthor,
  unfollowCategory,
  unfollowTopic,
} from "@/services/user-profile.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Folder, Loader2, Tag, UserMinus, Users } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "react-toastify";

// `/user/following` — lists the authors/categories/topics the current user
// follows (from `getMyProfile()`) with an Unfollow action per item. Each
// unfollow is confirmed via useAlert(), then invalidates the profile query
// on success so the list reflects the server state.
const PROFILE_QUERY_KEY = ["my-profile"];

const EmptyState = ({ icon, message }: { icon: ReactNode; message: string }) => (
  <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-center text-sm">
    {icon}
    {message}
  </div>
);

export default function UserFollowingPage() {
  const queryClient = useQueryClient();
  const confirm = useAlert();

  const {
    data: profileResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getMyProfile,
  });

  const profile = profileResponse?.data;
  const invalidateProfile = () =>
    queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });

  const unfollowAuthorMutation = useMutation({
    mutationFn: unfollowAuthor,
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data?.message || "Failed to unfollow author");
        return;
      }
      toast.success("Unfollowed author");
      invalidateProfile();
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const unfollowCategoryMutation = useMutation({
    mutationFn: unfollowCategory,
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data?.message || "Failed to unfollow category");
        return;
      }
      toast.success("Unfollowed category");
      invalidateProfile();
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const unfollowTopicMutation = useMutation({
    mutationFn: unfollowTopic,
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data?.message || "Failed to unfollow topic");
        return;
      }
      toast.success("Unfollowed topic");
      invalidateProfile();
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const handleUnfollowAuthor = async (id: string, name: string) => {
    const ok = await confirm({
      title: "Unfollow author",
      message: `Stop following ${name}?`,
      confirmText: "Unfollow",
    });
    if (ok) unfollowAuthorMutation.mutate(id);
  };

  const handleUnfollowCategory = async (id: string, name: string) => {
    const ok = await confirm({
      title: "Unfollow category",
      message: `Stop following ${name}?`,
      confirmText: "Unfollow",
    });
    if (ok) unfollowCategoryMutation.mutate(id);
  };

  const handleUnfollowTopic = async (topic: string) => {
    const ok = await confirm({
      title: "Unfollow topic",
      message: `Stop following "${topic}"?`,
      confirmText: "Unfollow",
    });
    if (ok) unfollowTopicMutation.mutate(topic);
  };

  const authors = profile?.following_authors || [];
  const categories = profile?.following_categories || [];
  const topics = profile?.following_topics || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-foreground text-2xl font-semibold">Following</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Authors, categories, and topics you follow.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-muted-foreground text-sm">
          Failed to load your following list. Please try again later.
        </p>
      ) : (
        <>
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Authors</CardTitle>
            </CardHeader>
            <CardContent>
              {authors.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-8 w-8" />}
                  message="You're not following any authors yet."
                />
              ) : (
                <ul className="divide-y">
                  {authors.map((author) => (
                    <li
                      key={author._id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            author.image
                              ? `${URLS.user}/${author.image}`
                              : "/images/avatar.png"
                          }
                          alt={author.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-foreground text-sm font-medium">
                            {author.name}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {author.email}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={unfollowAuthorMutation.isPending}
                        onClick={() =>
                          handleUnfollowAuthor(author._id, author.name)
                        }
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Unfollow
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <EmptyState
                  icon={<Folder className="h-8 w-8" />}
                  message="You're not following any categories yet."
                />
              ) : (
                <ul className="divide-y">
                  {categories.map((category) => (
                    <li
                      key={category._id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="text-foreground text-sm font-medium">
                        {category.name}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={unfollowCategoryMutation.isPending}
                        onClick={() =>
                          handleUnfollowCategory(category._id, category.name)
                        }
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Unfollow
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Topics</CardTitle>
            </CardHeader>
            <CardContent>
              {topics.length === 0 ? (
                <EmptyState
                  icon={<Tag className="h-8 w-8" />}
                  message="You're not following any topics yet."
                />
              ) : (
                <ul className="divide-y">
                  {topics.map((topic) => (
                    <li
                      key={topic}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="text-foreground text-sm font-medium">
                        {topic}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={unfollowTopicMutation.isPending}
                        onClick={() => handleUnfollowTopic(topic)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Unfollow
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import type React from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";
import { fetchPollsByNews, votePoll } from "@/services/poll.service";
import { getMyProfile } from "@/services/user-profile.service";

type PollWidgetProps = {
  newsId?: string;
};

const GUEST_ID_STORAGE_KEY = "z-news_guest_id";

// The poll vote endpoint (POST /api/poll/:pollId/vote) does NOT derive
// guest identity from the httpOnly `guest_token` cookie/req.guest
// server-side -- unlike reaction/view/comment, its controller only reads
// `guest_id` off the request body. So anonymous voting needs a
// client-generated id, persisted so a guest's re-vote on the same poll gets
// rejected by the backend's own "already voted" check just like a signed-in
// user's would.
const getOrCreateGuestId = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.localStorage.getItem(GUEST_ID_STORAGE_KEY);
    if (existing) return existing;

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(GUEST_ID_STORAGE_KEY, id);
    return id;
  } catch {
    return undefined;
  }
};

// `GET /api/poll/news/:newsId` never includes `has_voted` (only
// `GET /api/poll/:pollId` computes it, and only for authenticated
// requesters), so a local "already voted on this poll" flag is kept to
// survive refreshes for both guests and logged-in users.
const votedStorageKey = (pollId: string) => `z-news_poll_voted:${pollId}`;

const hasVotedLocally = (pollId: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(votedStorageKey(pollId)) === "1";
  } catch {
    return false;
  }
};

const markVotedLocally = (pollId: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(votedStorageKey(pollId), "1");
  } catch {
    // Private browsing / storage disabled -- vote still went through server-side.
  }
};

const PollWidget: React.FC<PollWidgetProps> = ({ newsId }) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<number[]>([]);
  const [votedJustNow, setVotedJustNow] = useState(false);
  const [votedFromStorage, setVotedFromStorage] = useState(false);

  const pollsQueryKey = ["polls", "news", newsId];
  const { data: pollsRes } = useQuery({
    queryKey: pollsQueryKey,
    queryFn: () => fetchPollsByNews(newsId!),
    enabled: !!newsId,
  });

  const poll = pollsRes?.data?.[0];

  // Only used to decide whether to present this as a personalized vote vs.
  // an anonymous/guest one -- polls that allow_anonymous never hard-block
  // voting just because the visitor isn't signed in.
  const { data: profileRes } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    retry: false,
  });
  const isLoggedIn = !!profileRes?.data;

  useEffect(() => {
    if (poll?._id) setVotedFromStorage(hasVotedLocally(poll._id));
  }, [poll?._id]);

  const hasVoted = !!poll?.has_voted || votedFromStorage || votedJustNow;

  const { mutate: submitVote, isPending: isVoting } = useMutation({
    mutationFn: () => {
      if (!poll?._id) throw new Error("No poll to vote on");
      const payload: { option_indices: number[]; guest_id?: string } = {
        option_indices: selected,
      };
      if (!isLoggedIn) {
        payload.guest_id = getOrCreateGuestId();
      }
      return votePoll(poll._id, payload);
    },
    onSuccess: (res) => {
      if (res?.success === false) {
        toast.error(res?.message || "Failed to submit vote");
        return;
      }
      if (poll?._id) markVotedLocally(poll._id);
      setVotedJustNow(true);
      toast.success("Vote submitted");
      queryClient.invalidateQueries({ queryKey: pollsQueryKey });
    },
    onError: () => {
      toast.error("Something went wrong while submitting your vote.");
    },
  });

  if (!newsId || !poll) return null;

  const status = poll.status;
  const canVote = status === "active" && !hasVoted;
  const showResults = hasVoted || poll.show_results_before_vote;
  const canSelectMore = poll.allow_multiple_votes
    ? selected.length < poll.max_votes
    : selected.length < 1;

  const toggleOption = (index: number) => {
    if (!poll.allow_multiple_votes) {
      setSelected([index]);
      return;
    }
    setSelected((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      if (prev.length >= poll.max_votes) return prev;
      return [...prev, index];
    });
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      toast.error("Please select an option to vote");
      return;
    }
    if (!isLoggedIn && !poll.allow_anonymous) {
      toast.error("Please log in to vote on this poll");
      return;
    }
    submitVote();
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="size-5" />
          {poll.title}
        </CardTitle>
        {poll.description && (
          <p className="text-muted-foreground text-sm">{poll.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {canVote && (
          <div className="space-y-3">
            {poll.options.map((option, index) => (
              <label
                key={index}
                className={cn(
                  "hover:border-accent flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors",
                  selected.includes(index) && "border-accent bg-accent/5",
                )}
              >
                {poll.allow_multiple_votes ? (
                  <Checkbox
                    checked={selected.includes(index)}
                    onChange={() => toggleOption(index)}
                    disabled={!selected.includes(index) && !canSelectMore}
                  />
                ) : (
                  <input
                    type="radio"
                    name={`poll-${poll._id}`}
                    checked={selected.includes(index)}
                    onChange={() => toggleOption(index)}
                    className="accent-accent size-4"
                  />
                )}
                <span className="text-sm">{option.text}</span>
              </label>
            ))}

            {poll.allow_multiple_votes && (
              <p className="text-muted-foreground text-xs">
                Select up to {poll.max_votes} option
                {poll.max_votes > 1 ? "s" : ""}
              </p>
            )}

            {!isLoggedIn && !poll.allow_anonymous ? (
              <p className="text-destructive text-sm">
                Please log in to vote on this poll.
              </p>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                isLoading={isVoting}
                disabled={isVoting || selected.length === 0}
              >
                {isVoting ? "Submitting..." : "Submit Vote"}
              </Button>
            )}

            {!isLoggedIn && poll.allow_anonymous && (
              <p className="text-muted-foreground text-xs">
                You&apos;re voting anonymously as a guest.
              </p>
            )}
          </div>
        )}

        {showResults && (
          <div className="space-y-3">
            {hasVoted && (
              <p className="text-sm font-medium text-green-600">
                Thanks for voting! Here are the current results.
              </p>
            )}
            {poll.results.map((result, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{result.text}</span>
                  <span className="text-muted-foreground">
                    {result.percentage}% ({result.votes})
                  </span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-accent h-full rounded-full transition-all"
                    style={{ width: `${result.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-muted-foreground text-xs">
              {poll.total_votes} vote{poll.total_votes === 1 ? "" : "s"} &middot;{" "}
              {poll.unique_voters} participant
              {poll.unique_voters === 1 ? "" : "s"}
            </p>
          </div>
        )}

        {!canVote && status !== "active" && !showResults && (
          <p className="text-muted-foreground text-sm">
            {status === "scheduled"
              ? "Voting hasn't started yet."
              : "Voting has ended for this poll."}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PollWidget;

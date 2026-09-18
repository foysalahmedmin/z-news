"use client";

import type { QueryKey } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Vote } from "lucide-react";
import { useEffect, useState } from "react";
import type React from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormControl, FormControlLabel } from "@/components/ui/FormControl";
import { createPoll, fetchPollsByNews, updatePoll } from "@/services/poll.service";
import type { TPoll } from "@/types/poll.type";

// A Poll references its article via `news` on the Poll document (the
// inverse of Templates, which get injected into `content`) -- so unlike
// TemplateSelector this can only run once the article already has an id,
// i.e. edit mode only (see NewsArticleForm/index.tsx).
type PollSelectorProps = {
  newsId: string;
};

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

const PollSelector: React.FC<PollSelectorProps> = ({ newsId }) => {
  const pollsQueryKey: QueryKey = ["polls", "news", newsId];

  const { data: pollsRes, isLoading } = useQuery({
    queryKey: pollsQueryKey,
    queryFn: () => fetchPollsByNews(newsId),
    enabled: !!newsId,
  });

  const poll = pollsRes?.data?.[0];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Vote className="size-5" />
            Poll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading poll...</p>
        </CardContent>
      </Card>
    );
  }

  return poll ? (
    <ExistingPoll poll={poll} pollsQueryKey={pollsQueryKey} />
  ) : (
    <CreatePollForm newsId={newsId} pollsQueryKey={pollsQueryKey} />
  );
};

const CreatePollForm = ({
  newsId,
  pollsQueryKey,
}: {
  newsId: string;
  pollsQueryKey: QueryKey;
}) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createPoll({
        news: newsId,
        title: title.trim(),
        description: description.trim() || undefined,
        options: options
          .map((text) => ({ text: text.trim() }))
          .filter((option) => option.text.length > 0),
      }),
    onSuccess: (res) => {
      if (res?.success === false) {
        toast.error(res?.message || "Failed to create poll");
        return;
      }
      toast.success("Poll created for this article");
      queryClient.invalidateQueries({ queryKey: pollsQueryKey });
    },
    onError: () => {
      toast.error("Failed to create poll");
    },
  });

  const validOptionsCount = options.filter(
    (option) => option.trim().length > 0,
  ).length;

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    setOptions((prev) => [...prev, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Poll title is required");
      return;
    }
    if (validOptionsCount < MIN_OPTIONS) {
      toast.error(`Add at least ${MIN_OPTIONS} options`);
      return;
    }
    mutate();
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Vote className="size-5" />
          Poll
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Create a poll for this article
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <FormControlLabel htmlFor="poll-title">Title *</FormControlLabel>
            <FormControl
              id="poll-title"
              placeholder="Ask a question..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <FormControlLabel htmlFor="poll-description">
              Description
            </FormControlLabel>
            <FormControl
              as="textarea"
              id="poll-description"
              className="h-16 py-2"
              placeholder="Optional context for this poll"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <FormControlLabel>Options * (2-10)</FormControlLabel>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <FormControl
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  shape="icon"
                  size="sm"
                  disabled={options.length <= MIN_OPTIONS}
                  onClick={() => removeOption(index)}
                  aria-label="Remove option"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={options.length >= MAX_OPTIONS}
              onClick={addOption}
            >
              <Plus className="size-4" />
              Add option
            </Button>
          </div>

          <Button
            type="submit"
            size="sm"
            isLoading={isPending}
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create Poll"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ExistingPoll = ({
  poll,
  pollsQueryKey,
}: {
  poll: TPoll;
  pollsQueryKey: QueryKey;
}) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(poll.title);
  const [description, setDescription] = useState(poll.description || "");
  const [isActive, setIsActive] = useState(poll.is_active);

  useEffect(() => {
    setTitle(poll.title);
    setDescription(poll.description || "");
    setIsActive(poll.is_active);
  }, [poll._id, poll.title, poll.description, poll.is_active]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updatePoll(poll._id, {
        title: title.trim(),
        description: description.trim() || undefined,
        is_active: isActive,
      }),
    onSuccess: (res) => {
      if (res?.success === false) {
        toast.error(res?.message || "Failed to update poll");
        return;
      }
      toast.success("Poll updated");
      queryClient.invalidateQueries({ queryKey: pollsQueryKey });
    },
    onError: () => {
      toast.error("Failed to update poll");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Poll title is required");
      return;
    }
    mutate();
  };

  const hasVotes = poll.total_votes > 0;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Vote className="size-5" />
          Poll
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {poll.total_votes} vote{poll.total_votes === 1 ? "" : "s"} from{" "}
          {poll.unique_voters} participant{poll.unique_voters === 1 ? "" : "s"}
          {" · "}
          Status: {poll.status}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <FormControlLabel>Options</FormControlLabel>
          <ul className="space-y-1">
            {poll.options.map((option, index) => (
              <li
                key={index}
                className="bg-muted flex items-center justify-between rounded-md px-3 py-2 text-sm"
              >
                <span>{option.text}</span>
                <span className="text-muted-foreground">
                  {option.votes} vote{option.votes === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-xs">
            {hasVotes
              ? "Options can't be edited once voting has started -- delete and recreate the poll to change them."
              : "Options can only be set when the poll is created."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          <div>
            <FormControlLabel htmlFor="poll-edit-title">
              Title *
            </FormControlLabel>
            <FormControl
              id="poll-edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <FormControlLabel htmlFor="poll-edit-description">
              Description
            </FormControlLabel>
            <FormControl
              as="textarea"
              id="poll-edit-description"
              className="h-16 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Poll is active
          </label>

          <Button
            type="submit"
            size="sm"
            isLoading={isPending}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Poll"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PollSelector;

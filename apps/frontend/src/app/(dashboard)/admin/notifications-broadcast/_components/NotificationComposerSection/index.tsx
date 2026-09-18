"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  FormControl,
  FormControlError,
  FormControlHelper,
  FormControlLabel,
} from "@/components/ui/FormControl";
import useUser from "@/hooks/states/useUser";
import { createNotification } from "@/services/admin-notification.service";
import { fetchUsers } from "@/services/admin-user.service";
import type { TRole, TUser } from "@/types/admin-user.type";
import type {
  TCreateNotificationPayload,
  TNotificationAudience,
  TNotificationChannel,
  TNotificationPriority,
  TNotificationType,
} from "@/types/admin-notification.type";
import type { ErrorResponse } from "@/types/response.type";
import debounce from "@/utils/debounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2, Send, X } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// Composer for the admin-authored `Notification` module (/api/notification)
// — a broadcast an admin sends out, not the per-user inbox feed
// (notification-recipient, already covered by /admin/notifications). Built
// as a dedicated page section (not a Modal) since composing + sending is the
// primary action of this page rather than an aside on a list.

const TYPE_OPTIONS: { value: TNotificationType; label: string }[] = [
  { value: "news-request", label: "News Request" },
  { value: "news-request-approval", label: "News Request Approval" },
  { value: "news-headline-request", label: "News Headline Request" },
  {
    value: "news-headline-request-approval",
    label: "News Headline Request Approval",
  },
  { value: "news-break-request", label: "News Break Request" },
  {
    value: "news-break-request-approval",
    label: "News Break Request Approval",
  },
  { value: "reaction", label: "Reaction" },
  { value: "comment", label: "Comment" },
  { value: "reply", label: "Reply" },
];

const PRIORITY_OPTIONS: TNotificationPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

const CHANNEL_OPTIONS: TNotificationChannel[] = ["web", "push", "email"];

const ROLE_OPTIONS: TRole[] = [
  "super-admin",
  "admin",
  "editor",
  "author",
  "contributor",
  "subscriber",
  "user",
];

type ComposerFormValues = {
  title: string;
  message: string;
  type: TNotificationType;
  priority: TNotificationPriority;
  channels: TNotificationChannel[];
  expires_at?: string;
  audienceType: "roles" | "users";
  audience: {
    roles?: TRole[];
  };
};

const defaultValues: ComposerFormValues = {
  title: "",
  message: "",
  type: "reaction",
  priority: "medium",
  channels: [],
  expires_at: "",
  audienceType: "roles",
  audience: { roles: [] },
};

const NotificationComposerSection: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const senderId = user?.info?._id;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ComposerFormValues>({ defaultValues });

  const audienceType = watch("audienceType");

  // Specific-users audience picker: searchable multi-select backed by
  // admin-user.service's fetchUsers, kept outside react-hook-form since it
  // needs to display selected users (name/email), not just ids.
  const [userSearchInput, setUserSearchInput] = React.useState("");
  const [userSearchQuery, setUserSearchQuery] = React.useState("");
  const [selectedUsers, setSelectedUsers] = React.useState<TUser[]>([]);

  const debouncedSetUserSearchQuery = React.useMemo(
    () => debounce((value: string) => setUserSearchQuery(value), 300),
    [],
  );

  const onUserSearchChange = (value: string) => {
    setUserSearchInput(value);
    debouncedSetUserSearchQuery(value);
  };

  const { data: usersData, isFetching: isUsersFetching } = useQuery({
    queryKey: ["users-picker", userSearchQuery],
    queryFn: () => fetchUsers({ search: userSearchQuery, limit: 8 }),
    enabled: audienceType === "users",
  });

  const toggleSelectedUser = (candidate: TUser) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === candidate._id)
        ? prev.filter((u) => u._id !== candidate._id)
        : [...prev, candidate],
    );
  };

  const removeSelectedUser = (id: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== id));
  };

  const mutation = useMutation({
    mutationFn: createNotification,
    onSuccess: (data) => {
      toast.success(data?.message || "Broadcast sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      reset(defaultValues);
      setSelectedUsers([]);
      setUserSearchInput("");
      setUserSearchQuery("");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to send broadcast");
      console.error("Create Notification Error:", error);
    },
  });

  const onSubmit = (formData: ComposerFormValues) => {
    if (!senderId) {
      toast.error("Unable to determine the signed-in admin. Please sign in again.");
      return;
    }

    let audience: TNotificationAudience | undefined;
    if (formData.audienceType === "roles") {
      if (formData.audience?.roles?.length) {
        audience = { roles: formData.audience.roles };
      }
    } else if (selectedUsers.length) {
      audience = { user_ids: selectedUsers.map((u) => u._id) };
    }

    const payload: TCreateNotificationPayload = {
      title: formData.title,
      message: formData.message,
      type: formData.type,
      priority: formData.priority,
      channels: formData.channels,
      sender: senderId,
      ...(formData.expires_at && {
        expires_at: new Date(formData.expires_at).toISOString(),
      }),
      ...(audience && { audience }),
    };

    mutation.mutate(payload);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compose Broadcast</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          {/* Title */}
          <div>
            <FormControlLabel>Title</FormControlLabel>
            <FormControl
              type="text"
              placeholder="Notification title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <FormControlError>{errors.title.message}</FormControlError>
            )}
          </div>

          {/* Message */}
          <div>
            <FormControlLabel>Message</FormControlLabel>
            <FormControl
              as="textarea"
              className="h-auto min-h-24 py-2"
              placeholder="Notification message"
              {...register("message", { required: "Message is required" })}
            />
            {errors.message && (
              <FormControlError>{errors.message.message}</FormControlError>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Type */}
            <div>
              <FormControlLabel>Type</FormControlLabel>
              <FormControl
                as="select"
                className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm"
                {...register("type", { required: "Type is required" })}
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </FormControl>
              {errors.type && (
                <FormControlError>{errors.type.message}</FormControlError>
              )}
            </div>

            {/* Priority */}
            <div>
              <FormControlLabel>Priority</FormControlLabel>
              <FormControl
                as="select"
                className="border-input bg-card w-full rounded-md border px-3 py-2 text-sm capitalize"
                {...register("priority")}
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option className="capitalize" key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </FormControl>
            </div>
          </div>

          {/* Channels */}
          <div>
            <FormControlLabel>Channels</FormControlLabel>
            <div className="flex flex-wrap gap-4 pt-1">
              {CHANNEL_OPTIONS.map((channel) => (
                <label
                  key={channel}
                  className="inline-flex items-center gap-2 capitalize"
                >
                  <input
                    className="accent-accent size-5"
                    type="checkbox"
                    value={channel}
                    {...register("channels", {
                      validate: (value) =>
                        (value && value.length > 0) ||
                        "Select at least one channel",
                    })}
                  />
                  <span className="text-sm font-medium">{channel}</span>
                </label>
              ))}
            </div>
            <FormControlHelper>Select 1 to 3 delivery channels.</FormControlHelper>
            {errors.channels && (
              <FormControlError>{errors.channels.message}</FormControlError>
            )}
          </div>

          {/* Expires At */}
          <div>
            <FormControlLabel>Expires At (Optional)</FormControlLabel>
            <FormControl type="datetime-local" {...register("expires_at")} />
          </div>

          {/* Audience */}
          <div className="border-border rounded-md border p-4">
            <FormControlLabel>Audience</FormControlLabel>
            <div className="flex flex-wrap gap-4 pt-1 pb-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  value="roles"
                  className="accent-accent size-4"
                  {...register("audienceType")}
                />
                <span className="text-sm font-medium">By role</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  value="users"
                  className="accent-accent size-4"
                  {...register("audienceType")}
                />
                <span className="text-sm font-medium">Specific users</span>
              </label>
            </div>

            {audienceType === "roles" ? (
              <div className="flex flex-wrap gap-4">
                {ROLE_OPTIONS.map((role) => (
                  <label
                    key={role}
                    className="inline-flex items-center gap-2 capitalize"
                  >
                    <input
                      className="accent-accent size-5"
                      type="checkbox"
                      value={role}
                      {...register("audience.roles")}
                    />
                    <span className="text-sm font-medium">{role}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid gap-2">
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-1">
                    {selectedUsers.map((selected) => (
                      <span
                        key={selected._id}
                        className="bg-muted inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                      >
                        {selected.name}
                        <button
                          type="button"
                          onClick={() => removeSelectedUser(selected._id)}
                          aria-label={`Remove ${selected.name}`}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <FormControl
                  type="text"
                  placeholder="Search users by name or email"
                  value={userSearchInput}
                  onChange={(e) => onUserSearchChange(e.target.value)}
                />

                <div className="max-h-48 overflow-y-auto rounded-md border">
                  {isUsersFetching && (
                    <div className="text-muted-foreground p-3 text-sm">
                      Searching...
                    </div>
                  )}
                  {!isUsersFetching &&
                    (usersData?.data?.length ?? 0) === 0 && (
                      <div className="text-muted-foreground p-3 text-sm">
                        No users found.
                      </div>
                    )}
                  {!isUsersFetching &&
                    usersData?.data?.map((candidate) => {
                      const checked = selectedUsers.some(
                        (u) => u._id === candidate._id,
                      );
                      return (
                        <label
                          key={candidate._id}
                          className="hover:bg-muted flex items-center gap-3 border-b px-3 py-2 last:border-b-0"
                        >
                          <Checkbox
                            checked={checked}
                            onChange={() => toggleSelectedUser(candidate)}
                          />
                          <span className="text-sm">
                            {candidate.name}{" "}
                            <span className="text-muted-foreground">
                              ({candidate.email})
                            </span>
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Broadcast
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NotificationComposerSection;

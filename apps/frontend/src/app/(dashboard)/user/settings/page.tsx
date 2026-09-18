"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormControl, FormControlLabel } from "@/components/ui/FormControl";
import { Switch } from "@/components/ui/Switch";
import {
  getMyProfile,
  updateNotificationPreferences,
} from "@/services/user-profile.service";
import type {
  TNotificationPreferences,
  TUserProfile,
} from "@/types/user-profile.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

// Notification-preferences form for the `/user/settings` dashboard route.
// No local form state — the toggles/select are derived straight from the
// `getMyProfile()` query cache and each change fires its own
// `updateNotificationPreferences` mutation immediately (autosave), then
// invalidates the profile query so the UI reflects the saved server state.
const PROFILE_QUERY_KEY = ["my-profile"];

type TEmailFrequency = NonNullable<TUserProfile["email_frequency"]>;

const DEFAULT_PREFERENCES: TNotificationPreferences = {
  email_notifications: true,
  push_notifications: true,
  comment_replies: true,
  article_updates: true,
  newsletter: false,
};

const TOGGLES: {
  key: keyof TNotificationPreferences;
  label: string;
  description: string;
}[] = [
  {
    key: "email_notifications",
    label: "Email Notifications",
    description: "Receive account and activity updates via email.",
  },
  {
    key: "push_notifications",
    label: "Push Notifications",
    description: "Receive push notifications on your devices.",
  },
  {
    key: "comment_replies",
    label: "Comment Replies",
    description: "Get notified when someone replies to your comments.",
  },
  {
    key: "article_updates",
    label: "Article Updates",
    description: "Get notified about updates to articles you follow.",
  },
  {
    key: "newsletter",
    label: "Newsletter",
    description: "Receive our periodic email newsletter.",
  },
];

const FREQUENCY_OPTIONS: { value: TEmailFrequency; label: string }[] = [
  { value: "instant", label: "Instant" },
  { value: "daily", label: "Daily digest" },
  { value: "weekly", label: "Weekly digest" },
  { value: "never", label: "Never" },
];

export default function UserSettingsPage() {
  const queryClient = useQueryClient();

  const {
    data: profileResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getMyProfile,
  });

  const profile = profileResponse?.data;

  const currentPreferences: TNotificationPreferences = {
    ...DEFAULT_PREFERENCES,
    ...profile?.notification_preferences,
  };
  const currentFrequency: TEmailFrequency = profile?.email_frequency || "instant";

  const mutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data?.message || "Failed to update notification preferences");
        return;
      }
      toast.success(data?.message || "Notification preferences updated!");
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleToggle = (key: keyof TNotificationPreferences, checked: boolean) => {
    mutation.mutate({
      notification_preferences: { ...currentPreferences, [key]: checked },
    });
  };

  const handleFrequencyChange = (value: TEmailFrequency) => {
    mutation.mutate({ email_frequency: value });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-foreground text-2xl font-semibold">
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage how and when we notify you.
        </p>
      </header>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : isError ? (
            <p className="text-muted-foreground text-sm">
              Failed to load your preferences. Please try again later.
            </p>
          ) : (
            <div className="space-y-5">
              {TOGGLES.map((toggle) => (
                <div
                  key={toggle.key}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-foreground text-sm font-medium">
                      {toggle.label}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {toggle.description}
                    </div>
                  </div>
                  <Switch
                    id={toggle.key}
                    checked={currentPreferences[toggle.key]}
                    disabled={mutation.isPending}
                    onChange={(checked) => handleToggle(toggle.key, checked)}
                  />
                </div>
              ))}

              <div className="border-t pt-5">
                <FormControlLabel htmlFor="email_frequency">
                  Email Frequency
                </FormControlLabel>
                <FormControl
                  as="select"
                  id="email_frequency"
                  className="max-w-xs"
                  value={currentFrequency}
                  disabled={mutation.isPending}
                  onChange={(e) =>
                    handleFrequencyChange(e.target.value as TEmailFrequency)
                  }
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FormControl>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

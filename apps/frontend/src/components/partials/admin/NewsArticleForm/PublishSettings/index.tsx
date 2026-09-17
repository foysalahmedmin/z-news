"use client";

import type React from "react";
import { useFormContext } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormControl, FormControlLabel } from "@/components/ui/FormControl";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";
import type { NewsFormData } from "../schema";

// Ported from apps/adminpanel's
// news-articles-mutation-page/PublishSettings/index.tsx.
const PublishSettings = () => {
  const { setValue, watch } = useFormContext<NewsFormData>();
  const status = watch("status");
  const publishedAt = watch("published_at");

  const handlePublishedAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("published_at", value ? new Date(value) : undefined);
  };

  const handleExpiredAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("expired_at", value ? new Date(value) : undefined);
  };

  const formatDateTimeLocal = (date: Date | undefined) => {
    if (!date) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Publish Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <FormControlLabel htmlFor="is_news_headline">
                Headline
              </FormControlLabel>
              <p className="text-muted-foreground text-sm">
                Display at the top of news headline section
              </p>
            </div>
            <Switch
              id="is_news_headline"
              checked={watch("is_news_headline") || false}
              onChange={(checked) => setValue("is_news_headline", checked)}
            />
          </div>

          {watch("is_news_headline") && (
            <div className="ml-4 space-y-3 border-l-2 pl-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <FormControlLabel htmlFor="headline_status">
                    Status
                  </FormControlLabel>
                  <FormControl
                    as="select"
                    id="headline_status"
                    value={watch("headline_status") || "draft"}
                    onChange={(e) =>
                      setValue(
                        "headline_status",
                        e.target.value as
                          | "draft"
                          | "pending"
                          | "published"
                          | "archived",
                      )
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </FormControl>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormControlLabel htmlFor="headline_published_at">
                    Publish Date
                  </FormControlLabel>
                  <FormControl
                    as="input"
                    type="datetime-local"
                    id="headline_published_at"
                    value={formatDateTimeLocal(watch("headline_published_at"))}
                    onChange={(e) =>
                      setValue(
                        "headline_published_at",
                        e.target.value ? new Date(e.target.value) : undefined,
                      )
                    }
                  />
                </div>
                <div>
                  <FormControlLabel htmlFor="headline_expired_at">
                    Expiry Date
                  </FormControlLabel>
                  <FormControl
                    as="input"
                    type="datetime-local"
                    id="headline_expired_at"
                    value={formatDateTimeLocal(watch("headline_expired_at"))}
                    min={formatDateTimeLocal(watch("headline_published_at"))}
                    onChange={(e) =>
                      setValue(
                        "headline_expired_at",
                        e.target.value ? new Date(e.target.value) : undefined,
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <FormControlLabel htmlFor="is_news_break">
                Break
              </FormControlLabel>
              <p className="text-muted-foreground text-sm">
                Display as news break
              </p>
            </div>
            <Switch
              id="is_news_break"
              checked={watch("is_news_break") || false}
              onChange={(checked) => setValue("is_news_break", checked)}
            />
          </div>

          {watch("is_news_break") && (
            <div className="ml-4 space-y-3 border-l-2 pl-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <FormControlLabel htmlFor="break_status">
                    Status
                  </FormControlLabel>
                  <FormControl
                    as="select"
                    id="break_status"
                    value={watch("break_status") || "draft"}
                    onChange={(e) =>
                      setValue(
                        "break_status",
                        e.target.value as
                          | "draft"
                          | "pending"
                          | "published"
                          | "archived",
                      )
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </FormControl>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormControlLabel htmlFor="break_published_at">
                    Publish Date
                  </FormControlLabel>
                  <FormControl
                    as="input"
                    type="datetime-local"
                    id="break_published_at"
                    value={formatDateTimeLocal(watch("break_published_at"))}
                    onChange={(e) =>
                      setValue(
                        "break_published_at",
                        e.target.value ? new Date(e.target.value) : undefined,
                      )
                    }
                  />
                </div>
                <div>
                  <FormControlLabel htmlFor="break_expired_at">
                    Expiry Date
                  </FormControlLabel>
                  <FormControl
                    as="input"
                    type="datetime-local"
                    id="break_expired_at"
                    value={formatDateTimeLocal(watch("break_expired_at"))}
                    min={formatDateTimeLocal(watch("break_published_at"))}
                    onChange={(e) =>
                      setValue(
                        "break_expired_at",
                        e.target.value ? new Date(e.target.value) : undefined,
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <FormControlLabel htmlFor="is_featured">
                Featured
              </FormControlLabel>
              <p className="text-muted-foreground text-sm">
                Show in featured articles section
              </p>
            </div>
            <Switch
              id="is_featured"
              checked={watch("is_featured")}
              onChange={(checked) => setValue("is_featured", checked)}
            />
          </div>
        </div>
        <hr />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormControlLabel htmlFor="published_at">
              Publish Date
            </FormControlLabel>
            <FormControl
              as="input"
              className="w-full"
              id="published_at"
              type="datetime-local"
              value={formatDateTimeLocal(publishedAt)}
              onChange={handlePublishedAtChange}
            />
          </div>

          <div>
            <FormControlLabel htmlFor="expired_at">
              Expiry Date
            </FormControlLabel>
            <FormControl
              as="input"
              className="w-full"
              id="expired_at"
              type="datetime-local"
              min={formatDateTimeLocal(publishedAt)}
              onChange={handleExpiredAtChange}
            />
          </div>
        </div>
        <div>
          <FormControlLabel htmlFor="status">Status</FormControlLabel>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {["draft", "pending", "published", "archived"].map(
              (statusOption) => (
                <div
                  key={statusOption}
                  className={cn(
                    "cursor-pointer rounded-md border p-2 text-center",
                    status === statusOption
                      ? "border-primary bg-primary/10"
                      : "border-muted",
                  )}
                  onClick={() =>
                    setValue(
                      "status",
                      statusOption as
                        | "draft"
                        | "pending"
                        | "scheduled"
                        | "published"
                        | "archived",
                    )
                  }
                >
                  <div className="font-medium capitalize">{statusOption}</div>
                </div>
              ),
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublishSettings;

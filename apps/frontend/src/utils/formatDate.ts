import { SETTINGS } from "@/config";
import { toBanglaNumber } from "./toBanglaNumber";

// Always format in the site's timezone; server renders otherwise use the
// server's (UTC) clock and show the wrong day/hour for Dhaka readers.
const format = (date: Date | string, options: Intl.DateTimeFormatOptions) =>
  new Date(date).toLocaleString("bn-BD", {
    timeZone: SETTINGS.timezone,
    ...options,
  });

export const formatDate = (
  date: Date | string | undefined,
  type: "relative" | "datetime" | "date" = "relative",
) => {
  if (!date) return "";

  if (type === "date") {
    return format(date, { year: "numeric", month: "long", day: "numeric" });
  }

  if (type !== "relative") {
    return format(date, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const now = new Date();
  const commentDate = new Date(date);
  const diffInHours =
    (now.getTime() - commentDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return `${toBanglaNumber(diffInMinutes)} মিনিট আগে`;
  } else if (diffInHours < 24) {
    return `${toBanglaNumber(Math.floor(diffInHours))} ঘন্টা আগে`;
  } else {
    return format(commentDate, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
};

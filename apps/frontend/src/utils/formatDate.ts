import { toBanglaNumber } from "./toBanglaNumber";

export const formatDate = (date: Date | string, type = "relative") => {
  if (!date) return "";

  if (type !== "relative") {
    return new Date(date).toLocaleString("bn-BD", {
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
    return commentDate.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
};

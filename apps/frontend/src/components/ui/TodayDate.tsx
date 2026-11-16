"use client";

import { SETTINGS } from "@/config";
import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

const today = () =>
  new Date().toLocaleString("bn-BD", {
    timeZone: SETTINGS.timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

// Empty on the server and during hydration, filled in on the client: the
// server's clock (and a cached page) would otherwise produce different text
// than the browser and break hydration.
const TodayDate = () => (
  <span>{useSyncExternalStore(noSubscribe, today, () => "")}</span>
);

export default TodayDate;

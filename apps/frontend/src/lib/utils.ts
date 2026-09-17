import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// date-fns isn't a dependency of this app, so `formatDistanceToNow(date, { addSuffix: true })`
// from apps/adminpanel is reimplemented here on top of the built-in Intl.RelativeTimeFormat.
const RELATIVE_TIME_UNITS: {
  limitSeconds: number
  divisor: number
  unit: Intl.RelativeTimeFormatUnit
}[] = [
  { limitSeconds: 60, divisor: 1, unit: "second" },
  { limitSeconds: 3600, divisor: 60, unit: "minute" },
  { limitSeconds: 86400, divisor: 3600, unit: "hour" },
  { limitSeconds: 604800, divisor: 86400, unit: "day" },
  { limitSeconds: 2629800, divisor: 604800, unit: "week" },
  { limitSeconds: 31557600, divisor: 2629800, unit: "month" },
  { limitSeconds: Infinity, divisor: 31557600, unit: "year" },
]

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
})

export function formatTimeAgo(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  const diffSeconds = (Date.now() - date.getTime()) / 1000

  const { divisor, unit } =
    RELATIVE_TIME_UNITS.find(({ limitSeconds }) => diffSeconds < limitSeconds) ??
    RELATIVE_TIME_UNITS[RELATIVE_TIME_UNITS.length - 1]

  return relativeTimeFormatter.format(-Math.round(diffSeconds / divisor), unit)
}

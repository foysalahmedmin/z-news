import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  /** Seconds for one full pass of the content. */
  duration?: number;
};

// CSS-only ticker (renders on the server, unlike react-fast-marquee). The
// content scrolls as two identical copies; the second is aria-hidden and
// inert, so assistive tech and keyboard users get the list once. Pauses on
// hover/focus; with prefers-reduced-motion it stops and becomes scrollable.
const Marquee = ({ children, className, duration = 40 }: MarqueeProps) => (
  <div
    className={cn(
      "group flex overflow-hidden motion-reduce:overflow-x-auto",
      className,
    )}
  >
    {[false, true].map((isCopy) => (
      <div
        key={String(isCopy)}
        aria-hidden={isCopy || undefined}
        inert={isCopy}
        className={cn(
          "animate-marquee flex min-w-full shrink-0 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none",
          isCopy && "motion-reduce:hidden",
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        {children}
      </div>
    ))}
  </div>
);

export default Marquee;

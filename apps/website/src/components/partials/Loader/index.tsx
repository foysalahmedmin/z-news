import { cn } from "@/lib/utils";
import React, { HTMLAttributes, ReactNode } from "react";

type SpanProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  className?: string;
};

const Span: React.FC<SpanProps> = ({ children, className, ...props }) => (
  <span
    className={cn(
      "animate-loading-spin border-background border-l-border border-r-border border-t-accent m-2 block rounded-full border-2",
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

type NestedSpanProps = SpanProps & {
  depth: number;
};

const NestedSpan: React.FC<NestedSpanProps> = ({
  depth,
  className,
  ...props
}) => {
  if (depth === 0) {
    return (
      <Span
        className={cn(
          "border-accent border-b-accent border-l-accent border-t-accent",
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <Span className={className} {...props}>
      <NestedSpan className={className} depth={depth - 1} {...props} />
    </Span>
  );
};

type LoaderProps = {
  className?: string;
  spanProps?: SpanProps;
  depth?: number;
};

const Loader: React.FC<LoaderProps> = ({ className, spanProps, depth = 7 }) => {
  return (
    <main
      className={cn(
        "bg-background/75 fixed top-0 right-0 left-0 z-[100] flex h-screen w-screen items-center justify-center backdrop-blur-sm",
        className,
      )}
    >
      <div>
        <NestedSpan {...spanProps} depth={depth} />
      </div>
    </main>
  );
};

export default Loader;

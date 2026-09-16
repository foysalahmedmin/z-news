import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

const CardRoot: React.FC<ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    className={cn(
      "bg-card text-card-foreground rounded-md border shadow-sm",
      className,
    )}
    {...props}
  />
);

const CardHeader: React.FC<ComponentProps<"div">> = ({
  className,
  ...props
}) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

const CardTitle: React.FC<ComponentProps<"h3">> = ({ className, ...props }) => (
  <h3
    className={cn(
      "text-xl leading-none font-semibold tracking-tight",
      className,
    )}
    {...props}
  />
);

const CardContent: React.FC<ComponentProps<"div">> = ({
  className,
  ...props
}) => <div className={cn("p-6", className)} {...props} />;

const CardFooter: React.FC<ComponentProps<"div">> = ({
  className,
  ...props
}) => <div className={cn("flex items-center p-6", className)} {...props} />;

const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
});

export { Card };

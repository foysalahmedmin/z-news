import type { TBreadcrumbs } from "@/components/ui/Breadcrumb";
import Breadcrumb from "@/components/ui/Breadcrumb";
import useMenu from "@/hooks/states/useMenu";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PageHeaderProps = {
  className?: string;
  name?: string;
  description?: string;
  breadcrumbs?: TBreadcrumbs;
  slot?: ReactNode;
};

const PageHeader = ({
  className,
  name: nameProp,
  description: descriptionProp,
  breadcrumbs,
  slot,
}: PageHeaderProps) => {
  const { activeBreadcrumbs } = useMenu();

  const items = breadcrumbs || activeBreadcrumbs || [];
  const name = nameProp || items[items.length - 1]?.name || "";
  const description =
    descriptionProp || items[items.length - 1]?.description || "";
  return (
    <header className={cn("flex flex-col gap-2", className)}>
      {/* Breadcrumbs */}
      {items?.length > 0 && <Breadcrumb items={items} />}

      {/* Name Description & Slot */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold capitalize">
            {name}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>

        {/* Right Slot */}
        {slot && <div className="flex items-center space-x-2">{slot}</div>}
      </div>
    </header>
  );
};

export default PageHeader;

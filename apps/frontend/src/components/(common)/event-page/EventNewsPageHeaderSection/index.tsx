import Icon from "@/components/ui/Icon";
import { TEvent } from "@/types/event.type";
import React from "react";

type EventNewsPageHeaderSectionProps = {
  event?: Partial<TEvent>;
};
const EventNewsPageHeaderSection: React.FC<EventNewsPageHeaderSectionProps> = ({
  event,
}) => {
  return (
    <section>
      <div className="bg-accent text-accent-foreground shadow">
        <div className="space-y-4 py-6">
          <div className="container flex items-center gap-2 md:gap-4">
            {event?.icon && (
              <Icon className="size-8 md:size-10" name={event?.icon || ""} />
            )}
            <h1 className="text-xl font-bold md:text-3xl">{event?.name}</h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventNewsPageHeaderSection;

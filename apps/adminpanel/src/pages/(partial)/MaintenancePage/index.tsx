import { Button } from "@/components/ui/Button";
import { Settings } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

type MaintenancePageProps = {
  date?: Date | string;
};

const MaintenancePage: React.FC<MaintenancePageProps> = ({
  date = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const end = useMemo(() => new Date(date), [date]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = end.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 text-center">
      <div className="space-y-6 py-6">
        <div>
          <Settings className="mx-auto size-16" />
        </div>

        <div className="mx-auto max-w-xl space-y-4">
          <h1 className="text-accent text-3xl font-extrabold uppercase md:text-5xl">
            Under Maintenance
          </h1>
          <div className="space-y-2">
            <h2 className="text-muted-foreground text-xl font-semibold md:text-2xl">
              We'll be back soon!
            </h2>
            <p className="text-muted-foreground">
              Our website is currently undergoing scheduled maintenance. We
              apologize for any inconvenience.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-xs grid-cols-4 gap-2">
          <div className="bg-muted rounded-lg p-4">
            <div className="text-accent text-2xl font-bold">
              {timeLeft.days.toString().padStart(2, "0")}
            </div>
            <div className="text-muted-foreground text-sm">Days</div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="text-accent text-2xl font-bold">
              {timeLeft.hours.toString().padStart(2, "0")}
            </div>
            <div className="text-muted-foreground text-sm">Hours</div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="text-accent text-2xl font-bold">
              {timeLeft.minutes.toString().padStart(2, "0")}
            </div>
            <div className="text-muted-foreground text-sm">Minutes</div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="text-accent text-2xl font-bold">
              {timeLeft.seconds.toString().padStart(2, "0")}
            </div>
            <div className="text-muted-foreground text-sm">Seconds</div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="bg-muted h-2 w-full rounded-full">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    100 -
                      ((end.getTime() - Date.now()) /
                        (end.getTime() -
                          (end.getTime() - 2 * 24 * 60 * 60 * 1000))) *
                        100,
                  ),
                )}%`,
              }}
            ></div>
          </div>
        </div>

        <div>
          <Button asChild>
            <Link to="/">Check Status</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default MaintenancePage;

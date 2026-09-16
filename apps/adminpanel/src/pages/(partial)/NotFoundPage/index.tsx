import { Button } from "@/components/ui/Button";
import React from "react";
import { Link } from "react-router";

const NotFoundPage: React.FC = () => {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-xl space-y-6 py-6 text-center">
        <h1 className="text-accent text-9xl font-extrabold uppercase">404</h1>

        <div className="skew-y-2">
          <h2 className="text-muted-foreground text-xl font-semibold uppercase md:text-2xl">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div>
          <Button asChild>
            <Link to="/">Go Back Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;

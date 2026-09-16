import { Button } from "@/components/ui/Button";
import { ENV } from "@/config";
import React from "react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";

const ErrorPage: React.FC = () => {
  const error = useRouteError();
  let statusCode = 500;
  let errorMessage = "An unexpected error occurred";

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Custom messages for different status codes
  const errorTitles: Record<number, string> = {
    404: "Page Not Found",
    500: "Server Error",
    403: "Access Forbidden",
    401: "Unauthorized",
  };

  const errorDescriptions: Record<number, string> = {
    404: "Sorry, the page you are looking for doesn't exist or has been moved.",
    500: "Something went wrong on our end. Please try again later.",
    403: "You don't have permission to access this resource.",
    401: "Please log in to access this page.",
  };

  const title = errorTitles[statusCode] || `Error ${statusCode}`;
  const description = errorDescriptions[statusCode] || errorMessage;

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-xl space-y-6 py-6 text-center">
        <h1 className="text-accent text-9xl font-extrabold">{statusCode}</h1>

        <div>
          <h2 className="text-muted-foreground text-xl font-semibold uppercase md:text-2xl">
            {title}
          </h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="flex gap-4">
          <Button asChild variant="default">
            <Link to="/">Go to Dashboard</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <span>Try Again</span>
          </Button>
        </div>

        {ENV.environment === "development" && (
          <div className="bg-muted mx-4 space-y-2 rounded p-4">
            <h3 className="text-sm font-semibold">
              Error Details (Development Only):
            </h3>
            <pre className="overflow-auto text-xs">
              {error instanceof Error
                ? error.stack
                : JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
};

export default ErrorPage;

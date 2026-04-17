"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if configured
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="w-full max-w-md rounded-[28px] border border-red-500/20 bg-red-500/5 p-8 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred while rendering the application. We've logged this issue."}
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border border-border/60 bg-secondary px-5 py-2.5 text-sm font-medium transition hover:bg-secondary/80 focus:outline-none"
          >
            Go Home
          </button>
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

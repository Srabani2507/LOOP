'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting in production
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
          {/* Ambient blob */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
              style={{ background: 'var(--primary-gradient)' }}
            />
          </div>

          {/* Icon */}
          <div
            className="relative flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg mb-6"
            style={{ background: 'var(--primary-gradient)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred. You can try again or return to the
            dashboard. If the problem persists, contact your workspace admin.
          </p>

          {/* Error digest for debugging */}
          {error.digest && (
            <p className="mt-3 text-[11px] font-mono text-muted-foreground/60 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50">
              Error ID: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              style={{ background: 'var(--primary-gradient)' }}
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Go to Dashboard
            </Link>
          </div>

          <p className="mt-12 text-xs text-muted-foreground/50 tracking-widest uppercase">
            LOOP — AI Customer Feedback Intelligence
          </p>
        </div>
      </body>
    </html>
  );
}

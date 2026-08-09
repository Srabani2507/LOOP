import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found | LOOP',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      {/* Ambient background blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--primary-gradient)' }}
        />
      </div>

      {/* 404 number */}
      <div className="relative select-none">
        <p
          className="text-[120px] sm:text-[180px] font-extrabold leading-none tracking-tighter text-primary-gradient"
          style={{
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </p>
      </div>

      {/* Message */}
      <h1 className="mt-2 text-2xl font-bold text-foreground">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Double-check the URL or head back home.
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          style={{ background: 'var(--primary-gradient)' }}
        >
          Go to Dashboard
        </Link>
        <Link
          href="/inbox"
          className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Open Inbox
        </Link>
      </div>

      {/* LOOP branding */}
      <p className="mt-12 text-xs text-muted-foreground/50 tracking-widest uppercase">
        LOOP — AI Customer Feedback Intelligence
      </p>
    </div>
  );
}

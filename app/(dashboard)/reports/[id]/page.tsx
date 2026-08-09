'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  Printer,
  Share2,
  CheckCircle2,
  BarChart2,
  TrendingUp,
  Sparkles,
  CalendarDays,
  User2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportContent {
  narrative?: string;
  summary?: string;
  metrics?: {
    totalFeedback: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    sentimentDelta: number;
  };
  topThemes?: Array<{ name: string; count: number }>;
  periodLabel?: string;
  generatedWith?: string;
}

interface ReportDetail {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  contentJson: ReportContent;
  createdAt: string;
  generatedBy?: { name: string; email: string };
  workspace?: { name: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm print:shadow-none print:border-border/30">
      <p className={`text-3xl font-extrabold ${colorClass ?? 'text-foreground'}`}>
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${params.id}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setReport(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [params.id]);

  function handlePrint() {
    window.print();
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select text
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (notFound || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-5xl font-extrabold text-muted-foreground/20 mb-4">404</p>
        <h2 className="text-xl font-bold mb-2">Report not found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This report may have been deleted or you don&apos;t have access to it.
        </p>
        <Button onClick={() => router.push('/reports')} className="gap-2 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Button>
      </div>
    );
  }

  const content = report.contentJson;
  const maxThemeCount = content.topThemes?.[0]?.count || 1;
  const negDelta = content.metrics?.sentimentDelta ?? 0;
  const positivePct = content.metrics
    ? Math.round((content.metrics.positiveCount / (content.metrics.totalFeedback || 1)) * 100)
    : 0;
  const negativePct = content.metrics
    ? Math.round((content.metrics.negativeCount / (content.metrics.totalFeedback || 1)) * 100)
    : 0;

  return (
    <>
      {/* ── Print-only header (hidden on screen) ── */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">{report.title}</h1>
        <p className="text-sm text-muted-foreground">
          {content.periodLabel} · Generated {new Date(report.createdAt).toLocaleDateString()} ·{' '}
          {report.generatedBy?.name ?? 'System'} · {report.workspace?.name}
        </p>
      </div>

      {/* ── Screen header (hidden when printing) ── */}
      <div className="print:hidden space-y-1 mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/reports')}
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Reports
          </button>
          <h1 className="text-3xl font-bold tracking-tight">{report.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {content.periodLabel ??
                `${new Date(report.periodStart).toLocaleDateString()} – ${new Date(
                  report.periodEnd
                ).toLocaleDateString()}`}
            </span>
            <span className="flex items-center gap-1">
              <User2 className="h-3.5 w-3.5" />
              {report.generatedBy?.name ?? 'System'}
            </span>
            {report.workspace?.name && (
              <Badge variant="secondary" className="text-[10px]">
                {report.workspace.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                Copy Link
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="gap-2 rounded-xl"
            onClick={handlePrint}
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      <div className="space-y-8 max-w-4xl">
        {/* ── Metrics grid ── */}
        {content.metrics && (
          <section aria-label="Report metrics">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Period Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard label="Total Feedback" value={content.metrics.totalFeedback} />
              <MetricCard
                label="Positive"
                value={content.metrics.positiveCount}
                colorClass="text-emerald-500"
              />
              <MetricCard
                label="Negative"
                value={content.metrics.negativeCount}
                colorClass="text-rose-500"
              />
              <MetricCard
                label="Neutral"
                value={content.metrics.neutralCount}
                colorClass="text-amber-500"
              />
            </div>

            {/* Sentiment bar */}
            <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Sentiment Split
              </p>
              <div className="flex h-3 rounded-full overflow-hidden gap-px">
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${positivePct}%` }}
                  title={`Positive: ${positivePct}%`}
                />
                <div
                  className="bg-amber-400 transition-all"
                  style={{
                    width: `${100 - positivePct - negativePct}%`,
                  }}
                  title={`Neutral: ${100 - positivePct - negativePct}%`}
                />
                <div
                  className="bg-rose-500 transition-all"
                  style={{ width: `${negativePct}%` }}
                  title={`Negative: ${negativePct}%`}
                />
              </div>
              <div className="mt-2 flex items-center gap-5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Positive {positivePct}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                  Neutral {100 - positivePct - negativePct}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                  Negative {negativePct}%
                </span>
              </div>

              {/* Sentiment delta */}
              {negDelta !== 0 && (
                <div
                  className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${
                    negDelta > 0 ? 'text-rose-500' : 'text-emerald-500'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  {negDelta > 0 ? '+' : ''}
                  {negDelta}% negativity vs prior 30-day period
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Top Themes ── */}
        {content.topThemes && content.topThemes.length > 0 && (
          <section aria-label="Top themes">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-primary" />
              Top Themes
            </h2>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              {content.topThemes.map((t, idx) => {
                const pct = Math.round((t.count / maxThemeCount) * 100);
                return (
                  <div key={t.name} className="flex items-center gap-3">
                    <span className="w-4 text-[11px] font-bold text-muted-foreground/50 shrink-0 text-right">
                      {idx + 1}
                    </span>
                    <span className="w-36 text-sm font-medium truncate">{t.name}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: 'var(--primary-gradient)',
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-muted-foreground shrink-0">
                      {t.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── AI Narrative ── */}
        <section aria-label="AI-generated narrative">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Generated Analysis
          </h2>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-7 text-foreground/80 whitespace-pre-wrap">
              {content.narrative ?? content.summary ?? 'No narrative available.'}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        {content.generatedWith && (
          <p className="text-[10px] text-muted-foreground/50 text-center">
            Powered by {content.generatedWith}
          </p>
        )}
      </div>

      {/* ─── Print styles ─────────────────────────────────────────────────── */}
      <style jsx global>{`
        @media print {
          /* Hide nav, sidebar, topbar */
          aside,
          nav,
          header,
          [data-sidebar],
          [data-topbar] {
            display: none !important;
          }
          /* Full width */
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          body {
            background: white !important;
          }
          /* Avoid page breaks inside cards */
          section {
            break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}

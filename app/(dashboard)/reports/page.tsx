'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download, Eye, Loader2, FileText, X, Sparkles, TrendingUp, BarChart2, Share2, CheckCircle2, ExternalLink } from 'lucide-react';
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

interface ReportItem {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  contentJson: ReportContent;
  createdAt: string;
  generatedBy?: { name: string; email: string };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [viewingReport, setViewingReport] = useState<ReportItem | null>(null);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function fetchReports() {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const json = await res.json();
        setReports(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReports(); }, []);

  async function handleGenerateReport() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Voice of Customer Intelligence Digest' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to generate report');
      }
      await fetchReports();
    } catch (err: any) {
      setError(err.message || 'Failed to generate report. Please try again.');
      setTimeout(() => setError(''), 6000);
    } finally {
      setGenerating(false);
    }
  }

  async function handleShare(report: ReportItem) {
    const url = `${window.location.origin}/reports/${report.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(report.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // fallback for browsers without clipboard API
      window.prompt('Copy this link:', url);
    }
  }

  function handleDownload(report: ReportItem) {
    const content = report.contentJson;
    const text = [
      `${report.title}`,
      `Period: ${content.periodLabel ?? `${new Date(report.periodStart).toLocaleDateString()} – ${new Date(report.periodEnd).toLocaleDateString()}`}`,
      `Generated: ${new Date(report.createdAt).toLocaleDateString()}`,
      `By: ${report.generatedBy?.name ?? 'System'}`,
      '',
      '─'.repeat(60),
      '',
      content.narrative ?? content.summary ?? 'No narrative available.',
      '',
      '─'.repeat(60),
      '',
      'Metrics:',
      `  Total feedback: ${content.metrics?.totalFeedback ?? '—'}`,
      `  Positive: ${content.metrics?.positiveCount ?? '—'}`,
      `  Negative: ${content.metrics?.negativeCount ?? '—'}`,
      `  Neutral: ${content.metrics?.neutralCount ?? '—'}`,
      `  Sentiment delta vs prior period: ${content.metrics?.sentimentDelta !== undefined ? (content.metrics.sentimentDelta >= 0 ? '+' : '') + content.metrics.sentimentDelta + '%' : '—'}`,
      '',
      'Top Themes:',
      ...(content.topThemes?.map((t) => `  • ${t.name}: ${t.count} mentions`) ?? ['  —']),
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LOOP-VoC-Report-${report.id.slice(-8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-muted-foreground">
            AI-generated Voice of Customer intelligence digests
          </p>
        </div>
        <Button onClick={handleGenerateReport} disabled={generating} className="gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generating ? 'Generating AI Report…' : 'Generate New Report'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Generation in-progress note */}
      {generating && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary font-medium flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Analysing feedback, computing statistics, and generating AI narrative… this may take 10–30 seconds.
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No reports generated yet</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Generate your first AI-powered Voice of Customer report. LOOP will analyse your feedback, compute metrics, and write a leadership-ready narrative.
          </p>
          <Button onClick={handleGenerateReport} disabled={generating}>
            {generating ? 'Generating…' : 'Generate First Report'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const content = report.contentJson;
            const negDelta = content.metrics?.sentimentDelta;
            return (
              <div
                key={report.id}
                className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
              >
                <div className="px-5 pt-5 pb-4 flex-1">
                  {/* Badge row */}
                  <div className="mb-3 flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      AI Report
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      By {report.generatedBy?.name ?? 'System'}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="font-semibold text-foreground mb-1">{report.title}</p>
                  <p className="text-[11px] text-muted-foreground mb-4">
                    {content.periodLabel ?? `${new Date(report.periodStart).toLocaleDateString()} – ${new Date(report.periodEnd).toLocaleDateString()}`}
                  </p>

                  {/* Metrics row */}
                  {content.metrics && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="rounded-lg bg-muted/40 px-2 py-2 text-center">
                        <p className="text-xs font-bold text-foreground">{content.metrics.totalFeedback}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">Total</p>
                      </div>
                      <div className="rounded-lg bg-emerald-500/10 px-2 py-2 text-center">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{content.metrics.positiveCount}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">Positive</p>
                      </div>
                      <div className="rounded-lg bg-rose-500/10 px-2 py-2 text-center">
                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{content.metrics.negativeCount}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">Negative</p>
                      </div>
                    </div>
                  )}

                  {/* Sentiment delta */}
                  {negDelta !== undefined && (
                    <div className={`mb-4 flex items-center gap-1.5 text-xs font-medium ${negDelta > 0 ? 'text-rose-500' : negDelta < 0 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      <TrendingUp className="h-3.5 w-3.5" />
                      {negDelta > 0 ? '+' : ''}{negDelta}% negativity vs prior period
                    </div>
                  )}

                  {/* Top themes */}
                  {content.topThemes && content.topThemes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                        <BarChart2 className="h-3 w-3" />Top Themes
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {content.topThemes.slice(0, 3).map((t) => (
                          <span key={t.name} className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium">
                            {t.name} · {t.count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary preview */}
                  <p className="text-xs leading-relaxed text-foreground/70 line-clamp-3">
                    {content.summary ?? content.narrative?.slice(0, 200) ?? 'No summary available.'}
                  </p>
                </div>

                {/* Footer actions */}
                <div className="flex flex-col gap-2 px-5 pb-5">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 rounded-xl"
                      onClick={() => handleDownload(report)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 rounded-xl"
                      onClick={() => handleShare(report)}
                    >
                      {copiedId === report.id ? (
                        <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Copied!</>
                      ) : (
                        <><Share2 className="h-3.5 w-3.5" />Share</>
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2 rounded-xl"
                      onClick={() => setViewingReport(report)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Quick View
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-2 rounded-xl"
                      onClick={() => router.push(`/reports/${report.id}`)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Full Report
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full report modal */}
      {viewingReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setViewingReport(null)}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="font-bold text-lg">{viewingReport.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {viewingReport.contentJson.periodLabel} · Generated {new Date(viewingReport.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl"
                  onClick={() => handleDownload(viewingReport)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <button
                  onClick={() => setViewingReport(null)}
                  className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Metrics */}
              {viewingReport.contentJson.metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Total', value: viewingReport.contentJson.metrics.totalFeedback, cls: '' },
                    { label: 'Positive', value: viewingReport.contentJson.metrics.positiveCount, cls: 'text-emerald-500' },
                    { label: 'Negative', value: viewingReport.contentJson.metrics.negativeCount, cls: 'text-rose-500' },
                    { label: 'Neutral', value: viewingReport.contentJson.metrics.neutralCount, cls: 'text-amber-500' },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                      <p className={`text-xl font-bold ${m.cls}`}>{m.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Top themes */}
              {viewingReport.contentJson.topThemes && viewingReport.contentJson.topThemes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <BarChart2 className="h-4 w-4 text-primary" />Top Themes
                  </h3>
                  <div className="space-y-2">
                    {viewingReport.contentJson.topThemes.map((t) => (
                      <div key={t.name} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-32 truncate">{t.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, (t.count / (viewingReport.contentJson.topThemes![0].count || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full AI narrative */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI-Generated Narrative
                </h3>
                <div className="rounded-xl border border-border bg-muted/20 p-5">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-7 text-foreground/80 whitespace-pre-wrap">
                    {viewingReport.contentJson.narrative ?? viewingReport.contentJson.summary ?? 'No narrative available.'}
                  </div>
                </div>
              </div>

              {/* Powered by */}
              {viewingReport.contentJson.generatedWith && (
                <p className="text-[10px] text-muted-foreground/50 text-center">
                  Powered by {viewingReport.contentJson.generatedWith}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

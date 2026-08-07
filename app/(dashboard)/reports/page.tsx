'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye, Loader2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReportItem {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  contentJson: any;
  createdAt: string;
  generatedBy?: {
    name: string;
    email: string;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function fetchReports() {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const json = await res.json();
        setReports(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports from database:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  async function handleGenerateReport() {
    setGenerating(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Voice of Customer Intelligence Digest',
        }),
      });

      if (res.ok) {
        await fetchReports();
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-muted-foreground">Generated insights and analysis reports from database</p>
        </div>
        <Button onClick={handleGenerateReport} disabled={generating} className="gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {generating ? 'Generating...' : 'Generate New Report'}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm">Fetching reports from database...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">No reports generated yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate your first comprehensive Voice of Customer report from live database feedback
          </p>
          <Button onClick={handleGenerateReport} disabled={generating}>
            {generating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="secondary">Intelligence Digest</Badge>
                <span className="text-[11px] text-muted-foreground">
                  By {report.generatedBy?.name || 'Admin'}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Report Title</p>
                <p className="font-semibold text-foreground">{report.title}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Date Range</p>
                <p className="text-sm font-medium">
                  {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
                </p>
              </div>

              <div className="mb-6 flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Summary</p>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {report.contentJson?.summary || 'Voice of Customer insights compiled from feedback entries.'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button size="sm" className="flex-1 gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

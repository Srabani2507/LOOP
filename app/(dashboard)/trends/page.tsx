'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeGrowthChart } from '@/components/charts/theme-growth-chart';
import { AlertCircle, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ThemeData {
  id: string;
  theme: string;
  count: number;
  trend: number;
  description: string;
}

interface SpikeAlert {
  theme: string;
  change: string;
  description: string;
}

export default function TrendsPage() {
  const router = useRouter();

  const [themesData, setThemesData] = useState<ThemeData[]>([]);
  const [spikeAlerts, setSpikeAlerts] = useState<SpikeAlert[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTrends() {
    try {
      setLoading(true);
      setError('');

      const [trendsRes, chartsRes] = await Promise.all([
        fetch('/api/trends'),
        fetch('/api/dashboard/charts'),
      ]);

      // Trends is the primary data source — treat failure as fatal
      if (!trendsRes.ok) {
        throw new Error('Failed to load theme trends data');
      }

      const trendsData = await trendsRes.json();
      setThemesData(trendsData.themesData || []);
      setSpikeAlerts(trendsData.spikeAlerts || []);

      // Chart data is supplementary — degrade gracefully
      if (chartsRes.ok) {
        const data = await chartsRes.json();
        setChartData(data.chartData || []);
      }
    } catch (err: any) {
      console.error('Failed to load trends data:', err);
      setError(err.message || 'Failed to load trends data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTrends(); }, []);

  const maxCount = themesData.length > 0 ? Math.max(...themesData.map((t) => t.count)) || 1 : 1;

  /** Navigate to inbox pre-filtered by the selected theme (no URL param) */
  const handleThemeClick = (themeId: string) => {
    sessionStorage.setItem('inbox_themeFilter', themeId);
    router.push('/inbox');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trends</h1>
        <p className="mt-1 text-muted-foreground">Analyze feedback patterns and emerging themes</p>
      </div>

      {/* ── Error state */}
      {error && !loading && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive animate-in fade-in">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Unable to load trends</p>
            <p className="mt-0.5 text-xs text-destructive/80">{error}</p>
          </div>
          <button
            onClick={loadTrends}
            className="text-xs underline hover:no-underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading theme trends…</p>
        </div>
      ) : !error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ── Left column: chart + spike alerts */}
          <div className="lg:col-span-2 space-y-6">
            <ThemeGrowthChart data={chartData} />

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Spike Alerts</h2>
                <p className="text-sm text-muted-foreground">
                  Themes growing &gt;20% week-over-week vs the prior 7 days
                </p>
              </div>
              <div className="space-y-3">
                {spikeAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No significant theme spikes detected this week.</p>
                ) : (
                  spikeAlerts.map((alert) => (
                    <div
                      key={alert.theme}
                      className="flex items-start gap-4 rounded-lg border border-chart-3/20 bg-chart-3/5 p-4"
                    >
                      <AlertCircle className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{alert.theme}</p>
                          <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">{alert.change}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Right column: top themes with drill-down */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Top Themes</h2>
                {themesData.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs h-7 text-muted-foreground hover:text-foreground"
                    onClick={() => router.push('/inbox')}
                  >
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {themesData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No themes registered yet.</p>
                ) : (
                  themesData.slice(0, 5).map((theme) => (
                    <button
                      key={theme.id || theme.theme}
                      onClick={() => handleThemeClick(theme.id)}
                      className="w-full text-left rounded-lg border border-border bg-card p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                      title={`View inbox filtered by "${theme.theme}"`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                          {theme.theme}
                        </p>
                        <span
                          className={`text-xs font-semibold ${theme.trend >= 0 ? 'text-chart-2' : 'text-chart-3'}`}
                        >
                          {theme.trend >= 0 ? '↑' : '↓'} {Math.abs(theme.trend)}%
                        </span>
                      </div>
                      <p className="text-2xl font-bold mb-2">{theme.count}</p>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-chart-1 transition-all"
                          style={{ width: `${(theme.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground group-hover:text-primary/70 transition-colors">
                        Click to drill into feedback →
                      </p>
                    </button>
                  ))
                )}
              </div>

              {/* Overflow: link to remaining themes */}
              {themesData.length > 5 && (
                <button
                  onClick={() => router.push('/inbox')}
                  className="mt-3 w-full rounded-lg border border-dashed border-border py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors flex items-center justify-center gap-1"
                >
                  +{themesData.length - 5} more themes — view all in Inbox
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

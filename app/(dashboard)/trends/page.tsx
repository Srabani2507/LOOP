'use client';

import { useEffect, useState } from 'react';
import { ThemeGrowthChart } from '@/components/charts/theme-growth-chart';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const [themesData, setThemesData] = useState<ThemeData[]>([]);
  const [spikeAlerts, setSpikeAlerts] = useState<SpikeAlert[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrends() {
      try {
        const [trendsRes, chartsRes] = await Promise.all([
          fetch('/api/trends'),
          fetch('/api/dashboard/charts'),
        ]);

        if (trendsRes.ok) {
          const data = await trendsRes.json();
          setThemesData(data.themesData || []);
          setSpikeAlerts(data.spikeAlerts || []);
        }

        if (chartsRes.ok) {
          const data = await chartsRes.json();
          setChartData(data.chartData || []);
        }
      } catch (err) {
        console.error('Failed to load trends data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTrends();
  }, []);

  const maxCount = themesData.length > 0 ? Math.max(...themesData.map((t) => t.count)) || 1 : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trends</h1>
        <p className="mt-1 text-muted-foreground">Analyze feedback patterns and emerging themes</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm">Loading database theme trends...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ThemeGrowthChart data={chartData} />

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Spike Alerts</h2>
                <p className="text-sm text-muted-foreground">Unusual patterns detected from database</p>
              </div>
              <div className="space-y-3">
                {spikeAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No significant theme spikes detected yet.</p>
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

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Top Themes</h2>
              <div className="space-y-3">
                {themesData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No themes registered yet.</p>
                ) : (
                  themesData.slice(0, 5).map((theme) => (
                    <div
                      key={theme.id || theme.theme}
                      className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm">{theme.theme}</p>
                        <span
                          className={`text-xs font-semibold ${theme.trend >= 0 ? 'text-chart-2' : 'text-chart-3'}`}
                        >
                          {theme.trend >= 0 ? '↑' : '↓'} {Math.abs(theme.trend)}%
                        </span>
                      </div>
                      <p className="text-2xl font-bold mb-2">{theme.count}</p>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-chart-1"
                          style={{ width: `${(theme.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

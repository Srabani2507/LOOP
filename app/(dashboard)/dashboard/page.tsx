'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/stats-card';
import { VolumeChart } from '@/components/charts/volume-chart';
import { SentimentChart } from '@/components/charts/sentiment-chart';
import { FeedbackTable } from '@/components/feedback-table';
import { TrendingUp, MessageSquare, Zap, Target, Loader2 } from 'lucide-react';

interface StatsData {
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  newThisWeek: number;
  aiProcessed: number;
  topTheme: string;
  themesData: Array<{
    theme: string;
    count: number;
    trend: number;
  }>;
}

interface ChartsData {
  chartData: Array<{
    month: string;
    volume: number;
    positive: number;
    negative: number;
    neutral: number;
  }>;
  sentimentData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/charts'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (chartsRes.ok) {
          const chartsData = await chartsRes.json();
          setCharts(chartsData);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics from database:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Live customer feedback metrics & database insights</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm">Fetching real feedback data from database...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            <StatsCard
              label="Total Feedback"
              value={stats?.totalFeedback ?? 0}
              icon={<MessageSquare className="h-5 w-5" />}
            />
            <StatsCard
              label="Positive Feedback"
              value={stats?.positiveFeedback ?? 0}
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatsCard
              label="Negative Feedback"
              value={stats?.negativeFeedback ?? 0}
              icon={<Zap className="h-5 w-5" />}
            />
            <StatsCard
              label="New This Week"
              value={stats?.newThisWeek ?? 0}
              icon={<Target className="h-5 w-5" />}
            />
            <StatsCard
              label="AI Processed"
              value={stats?.aiProcessed ?? 0}
              icon={<MessageSquare className="h-5 w-5" />}
            />
            <StatsCard
              label="Top Theme"
              value={stats?.topTheme ?? 'N/A'}
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VolumeChart data={charts?.chartData || []} />
            </div>
            <SentimentChart data={charts?.sentimentData || []} />
          </div>

          {stats?.themesData && stats.themesData.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Top Themes</h2>
                <p className="text-sm text-muted-foreground">Most discussed topics in feedback</p>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
                {stats.themesData.map((theme) => (
                  <StatsCard
                    key={theme.theme}
                    label={theme.theme}
                    value={theme.count}
                    trend={theme.trend}
                    trendLabel="share"
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Recent Feedback</h2>
          <p className="text-sm text-muted-foreground">Latest customer feedback across all channels</p>
        </div>
        <FeedbackTable />
      </div>
    </div>
  );
}

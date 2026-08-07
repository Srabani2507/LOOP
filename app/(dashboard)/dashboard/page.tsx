'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/stats-card';
import { VolumeChart } from '@/components/charts/volume-chart';
import { SentimentChart } from '@/components/charts/sentiment-chart';
import { ThemesChart } from '@/components/charts/themes-chart';
import {
  TrendingUp,
  MessageSquare,
  ThumbsDown,
  Sparkles,
  Target,
  CalendarDays,
  Loader2,
} from 'lucide-react';

interface StatsData {
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  neutralFeedback: number;
  newThisWeek: number;
  aiProcessed: number;
  percentNegative: number;
  topTheme: string;
  themesData: Array<{
    theme: string;
    count: number;
    color: string;
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
  topThemesChart: Array<{
    name: string;
    count: number;
    color: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        } else {
          setError('Failed to load stats');
        }

        if (chartsRes.ok) {
          const chartsData = await chartsRes.json();
          setCharts(chartsData);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data');
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
        <p className="text-sm text-muted-foreground mt-1">
          Live customer feedback metrics &amp; insights
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium">Loading dashboard data…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatsCard
              label="Total Feedback"
              value={stats?.totalFeedback ?? 0}
              icon={<MessageSquare className="h-5 w-5" />}
            />
            <StatsCard
              label="Positive"
              value={stats?.positiveFeedback ?? 0}
              icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
            />
            <StatsCard
              label="Negative"
              value={stats?.negativeFeedback ?? 0}
              icon={<ThumbsDown className="h-5 w-5 text-rose-500" />}
            />
            <StatsCard
              label="New This Week"
              value={stats?.newThisWeek ?? 0}
              icon={<CalendarDays className="h-5 w-5" />}
            />
            <StatsCard
              label="AI Processed"
              value={stats?.aiProcessed ?? 0}
              icon={<Sparkles className="h-5 w-5 text-violet-500" />}
            />
            <StatsCard
              label="Top Theme"
              value={stats?.topTheme ?? 'N/A'}
              icon={<Target className="h-5 w-5" />}
            />
          </div>

          {/* Charts row 1 — Volume + Sentiment */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VolumeChart data={charts?.chartData || []} />
            </div>
            <SentimentChart data={charts?.sentimentData || []} />
          </div>

          {/* Charts row 2 — Top Themes bar chart */}
          <ThemesChart data={charts?.topThemesChart || []} />
        </>
      )}
    </div>
  );
}

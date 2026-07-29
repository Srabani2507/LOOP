import { StatsCard } from '@/components/stats-card'
import { VolumeChart } from '@/components/charts/volume-chart'
import { SentimentChart } from '@/components/charts/sentiment-chart'
import { FeedbackTable } from '@/components/feedback-table'
import { mockStats, themesData } from '@/lib/mock-data'
import { TrendingUp, MessageSquare, Zap, Target } from 'lucide-react'

export const metadata = {
  title: 'Dashboard - LOOP',
  description: 'Customer Feedback Intelligence Dashboard',
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Welcome back! Here&apos;s your feedback overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatsCard
          label="Total Feedback"
          value={mockStats.totalFeedback}
          trend={8}
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <StatsCard
          label="Positive Feedback"
          value={mockStats.positiveFeedback}
          trend={12}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatsCard
          label="Negative Feedback"
          value={mockStats.negativeFeedback}
          trend={-5}
          icon={<Zap className="h-5 w-5" />}
        />
        <StatsCard
          label="New This Week"
          value={mockStats.newThisWeek}
          trend={3}
          icon={<Target className="h-5 w-5" />}
        />
        <StatsCard
          label="AI Processed"
          value={mockStats.aiProcessed}
          trend={95}
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <StatsCard
          label="Top Theme"
          value={mockStats.topTheme}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VolumeChart />
        </div>
        <SentimentChart />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Top Themes</h2>
          <p className="text-sm text-muted-foreground">Most discussed topics in feedback</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
          {themesData.map((theme) => (
            <div
              key={theme.theme}
              className="rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-medium text-muted-foreground">{theme.theme}</p>
              <p className="mt-2 text-2xl font-semibold">{theme.count.toLocaleString()}</p>
              <p className={`mt-2 text-xs font-medium ${theme.trend > 0 ? 'text-chart-2' : 'text-chart-3'}`}>
                {theme.trend > 0 ? '↑' : '↓'} {Math.abs(theme.trend)}% this week
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Recent Feedback</h2>
          <p className="text-sm text-muted-foreground">Latest customer feedback across all channels</p>
        </div>
        <FeedbackTable />
      </div>
    </div>
  )
}

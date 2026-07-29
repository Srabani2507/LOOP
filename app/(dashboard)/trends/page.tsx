import { themesData, chartData } from '@/lib/mock-data'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertCircle, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Trends - LOOP',
}

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trends</h1>
        <p className="mt-1 text-muted-foreground">Analyze feedback patterns and emerging themes</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Theme Growth Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Line type="monotone" dataKey="positive" stroke="var(--chart-2)" strokeWidth={2} />
                <Line type="monotone" dataKey="negative" stroke="var(--chart-3)" strokeWidth={2} />
                <Line type="monotone" dataKey="neutral" stroke="var(--chart-4)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Spike Alerts</h2>
              <p className="text-sm text-muted-foreground">Unusual patterns detected</p>
            </div>
            <div className="space-y-3">
              {[
                {
                  theme: 'Performance',
                  change: '+23%',
                  description: 'Sudden spike in performance-related feedback',
                },
                {
                  theme: 'Pricing',
                  change: '+15%',
                  description: 'Increased pricing inquiries this week',
                },
              ].map((alert) => (
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
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Top Themes</h2>
            <div className="space-y-3">
              {themesData.slice(0, 5).map((theme) => (
                <div
                  key={theme.theme}
                  className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm">{theme.theme}</p>
                    <span
                      className={`text-xs font-semibold ${theme.trend > 0 ? 'text-chart-2' : 'text-chart-3'}`}
                    >
                      {theme.trend > 0 ? '↑' : '↓'} {Math.abs(theme.trend)}%
                    </span>
                  </div>
                  <p className="text-2xl font-bold mb-2">{theme.count}</p>
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-chart-1"
                      style={{ width: `${(theme.count / themesData[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

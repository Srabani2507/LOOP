'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card } from '@/components/ui/card'

interface ThemesChartProps {
  data?: Array<{
    name: string
    count: number
    color?: string
  }>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">{payload[0]?.value}</span> feedback items
      </p>
    </div>
  )
}

const THEME_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#f97316', '#84cc16',
]

export function ThemesChart({ data = [] }: ThemesChartProps) {
  const isEmpty = !data.length || data.every((d) => d.count === 0)

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-base">Top Themes</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Most discussed topics by feedback volume</p>
      </div>

      {isEmpty ? (
        <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
          <div className="text-center">
            <p className="font-medium">No themes yet</p>
            <p className="text-xs mt-1">Run theme clustering to populate this chart</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} horizontal={false} />
            <XAxis
              type="number"
              stroke="currentColor"
              strokeOpacity={0.4}
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="currentColor"
              strokeOpacity={0.4}
              tick={{ fontSize: 12 }}
              width={110}
              tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + '…' : v}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} name="count">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color ?? THEME_COLORS[index % THEME_COLORS.length]}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

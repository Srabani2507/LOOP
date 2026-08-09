'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/card'

interface SentimentChartProps {
  data?: Array<{
    name: string
    value: number
    color?: string
  }>
}

// Three distinct hue zones (85° apart) at ~22-25% saturation — warm/mid/cool
const FALLBACK_COLORS = ['#905690', '#6a5a87', '#445a79', '#7e8ba5']

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  const total = payload[0]?.payload?.total ?? 1
  const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-sm">
      <p className="font-semibold" style={{ color: entry.payload.color }}>
        {entry.name}
      </p>
      <p className="text-muted-foreground">
        {entry.value} items ({pct}%)
      </p>
    </div>
  )
}

const CustomLabel = ({ cx, cy, midAngle, outerRadius, name, value, percent }: any) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const r = outerRadius + 22
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
      opacity={0.8}
    >
      {`${name} (${Math.round(percent * 100)}%)`}
    </text>
  )
}

export function SentimentChart({ data = [] }: SentimentChartProps) {
  const isEmpty = !data.length || data.every((d) => d.value === 0)
  const total = data.reduce((acc, d) => acc + d.value, 0)
  const enriched = data.map((d) => ({ ...d, total }))

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-base">Sentiment Breakdown</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Distribution across all feedback</p>
      </div>

      {isEmpty ? (
        <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
          <div className="text-center">
            <p className="font-medium">No sentiment data yet</p>
            <p className="text-xs mt-1">Run AI classification to generate sentiment data</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={enriched}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={90}
              innerRadius={45}
              dataKey="value"
              paddingAngle={2}
            >
              {enriched.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span className="text-xs">{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

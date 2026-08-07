'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/card'

interface VolumeChartProps {
  data?: Array<{
    month: string
    volume: number
    positive?: number
    negative?: number
    neutral?: number
  }>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-sm">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function VolumeChart({ data = [] }: VolumeChartProps) {
  const isEmpty = !data.length || data.every((d) => d.volume === 0)

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-base">Feedback Volume Over Time</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Monthly feedback count — last 6 months</p>
      </div>

      {isEmpty ? (
        <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
          <div className="text-center">
            <p className="font-medium">No data yet</p>
            <p className="text-xs mt-1">Import or simulate feedback to populate this chart</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={2}>
            <defs>
              <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="neuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
            <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.4} tick={{ fontSize: 12 }} />
            <YAxis stroke="currentColor" strokeOpacity={0.4} tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span className="text-xs capitalize">{v}</span>}
            />
            <Bar dataKey="positive" stackId="a" fill="url(#posGrad)" radius={[0, 0, 0, 0]} name="positive" />
            <Bar dataKey="neutral" stackId="a" fill="url(#neuGrad)" name="neutral" />
            <Bar dataKey="negative" stackId="a" fill="url(#negGrad)" radius={[4, 4, 0, 0]} name="negative" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

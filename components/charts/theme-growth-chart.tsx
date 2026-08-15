'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'

interface ThemeGrowthChartProps {
  data?: Array<{
    month: string
    volume?: number
    positive?: number
    negative?: number
    neutral?: number
  }>
}

export function ThemeGrowthChart({ data = [] }: ThemeGrowthChartProps) {
  return (
    <Card className="relative p-6 overflow-hidden">
      <div className="absolute inset-0 bg-primary-gradient opacity-[0.12] dark:opacity-[0.16] pointer-events-none" />
      <div className="relative z-10 h-full flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Theme Growth Trends</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
            />
            <Line type="monotone" dataKey="positive" stroke="#905690" strokeWidth={2} />
            <Line type="monotone" dataKey="negative" stroke="#445a79" strokeWidth={2} />
            <Line type="monotone" dataKey="neutral" stroke="#6a5a87" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}


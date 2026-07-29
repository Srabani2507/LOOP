'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { chartData } from '@/lib/mock-data'

export function ThemeGrowthChart() {
  return (
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
  )
}

'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { chartData } from '@/lib/mock-data'
import { Card } from '@/components/ui/card'

export function VolumeChart() {
  return (
    <Card className="p-6">
      <h3 className="mb-4 font-semibold">Feedback Volume</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a2a6c" />
              <stop offset="50%" stopColor="#3a1c71" />
              <stop offset="100%" stopColor="#8b2fc9" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--foreground)" strokeOpacity={0.15} />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          />
          <Bar dataKey="volume" fill="url(#barGradient)" opacity={0.45} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}


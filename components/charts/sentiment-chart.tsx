'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { sentimentData } from '@/lib/mock-data'
import { Card } from '@/components/ui/card'

const COLORS = ['var(--chart-2)', 'var(--chart-4)', 'var(--chart-3)']

export function SentimentChart() {
  return (
    <Card className="p-6">
      <h3 className="mb-4 font-semibold">Sentiment Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={sentimentData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${entry.value}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {sentimentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}


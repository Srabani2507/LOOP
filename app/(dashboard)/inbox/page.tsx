'use client'

import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { feedbackTableData } from '@/lib/mock-data'
import { useState } from 'react'

const sentimentColors = {
  positive: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  negative: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  neutral: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
}

export default function InboxPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="mt-1 text-muted-foreground">Manage and review all customer feedback</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search feedback..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold">
                <input type="checkbox" className="h-4 w-4 rounded border-border" />
              </th>
              <th className="px-6 py-3 text-left font-semibold">Customer</th>
              <th className="px-6 py-3 text-left font-semibold">Channel</th>
              <th className="px-6 py-3 text-left font-semibold">Theme</th>
              <th className="px-6 py-3 text-left font-semibold">Sentiment</th>
              <th className="px-6 py-3 text-left font-semibold">Message</th>
              <th className="px-6 py-3 text-left font-semibold">Date</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {feedbackTableData.map((item) => (
              <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <input type="checkbox" className="h-4 w-4 rounded border-border" />
                </td>
                <td className="px-6 py-4 font-medium">{item.customer}</td>
                <td className="px-6 py-4">
                  <Badge variant="outline">{item.channel}</Badge>
                </td>
                <td className="px-6 py-4">{item.theme}</td>
                <td className="px-6 py-4">
                  <Badge className={sentimentColors[item.sentiment as keyof typeof sentimentColors]}>
                    {item.sentiment}
                  </Badge>
                </td>
                <td className="px-6 py-4 max-w-xs text-muted-foreground">{item.message}</td>
                <td className="px-6 py-4 text-muted-foreground text-xs">{item.date}</td>
                <td className="px-6 py-4">
                  <Badge variant="secondary">Unreviewed</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Showing {feedbackTableData.length} results</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

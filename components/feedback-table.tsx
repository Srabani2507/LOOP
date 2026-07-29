import { feedbackTableData } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { MoreVertical } from 'lucide-react'
import { Card } from '@/components/ui/card'

const sentimentColors = {
  positive: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  negative: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  neutral: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
}

export function FeedbackTable() {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left font-semibold">Customer</th>
              <th className="px-6 py-3 text-left font-semibold">Channel</th>
              <th className="px-6 py-3 text-left font-semibold">Theme</th>
              <th className="px-6 py-3 text-left font-semibold">Sentiment</th>
              <th className="px-6 py-3 text-left font-semibold">Message</th>
              <th className="px-6 py-3 text-left font-semibold">Date</th>
              <th className="px-6 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedbackTableData.map((item) => (
              <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
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
                <td className="px-6 py-4 max-w-xs truncate text-muted-foreground">{item.message}</td>
                <td className="px-6 py-4 text-muted-foreground">{item.date}</td>
                <td className="px-6 py-4 text-center">
                  <button className="inline-flex items-center justify-center rounded hover:bg-muted p-2">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}


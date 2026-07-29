import { reportCards } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Download, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Reports - LOOP',
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-muted-foreground">Generated insights and analysis reports</p>
        </div>
        <Button>Generate New Report</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((report) => (
          <div
            key={report.id}
            className="rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="mb-4">
              <Badge variant="secondary">Monthly Report</Badge>
            </div>

            <div className="mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Date Range</p>
              <p className="font-semibold">{report.dateRange}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Generated</p>
              <p className="text-sm">{report.generatedDate}</p>
            </div>

            <div className="mb-6 flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Summary</p>
              <p className="text-sm leading-relaxed text-foreground/80">{report.summary}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button size="sm" className="flex-1 gap-2">
                <Eye className="h-4 w-4" />
                View
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h3 className="font-semibold mb-2">No more reports yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Generate your first comprehensive report to get started
        </p>
        <Button>Generate Report</Button>
      </div>
    </div>
  )
}

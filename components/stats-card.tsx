import { ArrowUp, ArrowDown } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  trend?: number
  icon?: React.ReactNode
}

export function StatsCard({ label, value, trend, icon }: StatsCardProps) {
  const isPositive = trend && trend > 0

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value.toLocaleString()}</p>
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {isPositive ? (
            <ArrowUp className="h-4 w-4 text-chart-2" />
          ) : (
            <ArrowDown className="h-4 w-4 text-chart-3" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-chart-2' : 'text-chart-3'}`}>
            {Math.abs(trend)}% from last week
          </span>
        </div>
      )}
    </div>
  )
}

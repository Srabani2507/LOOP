import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { Card } from './ui/card'

export interface StatsCardProps {
  label: string
  value: string | number
  trend?: number
  icon?: React.ReactNode
}

export function StatsCard({ label, value, trend, icon }: StatsCardProps) {
  const isPositive = trend !== undefined && trend > 0

  return (
    <Card className="relative p-3.5 transition-all duration-300 hover:shadow-md group">
      {/* Increased gradient color effect using primary theme gradient at higher opacity */}
      <div className="absolute inset-0 bg-primary-gradient opacity-[0.18] dark:opacity-[0.22] transition-opacity group-hover:opacity-[0.16] dark:group-hover:opacity-[0.28] pointer-events-none" />
      
      {/* Small Watermark Icon/Logo at Bottom Right (fully visible inside card margins) */}
      {icon && (
        <div className="absolute bottom-3 right-3 w-9 h-9 text-primary opacity-[0.22] dark:opacity-[0.32] pointer-events-none z-0 transition-transform duration-300 group-hover:scale-110">
          {React.cloneElement(icon as React.ReactElement, { className: 'w-full h-full' })}
        </div>
      )}

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[85px]">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
          </div>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">{value.toLocaleString()}</p>
        </div>

        {trend !== undefined && (
          <div className="mt-2 flex flex-col items-start gap-0.5">
            <div>
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isPositive 
                    ? 'bg-chart-2/15 text-chart-2 border border-chart-2/20' 
                    : 'bg-chart-3/15 text-chart-3 border border-chart-3/20'
                }`}
              >
                {isPositive ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {Math.abs(trend)}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground">from last week</span>
          </div>
        )}
      </div>
    </Card>
  )
}

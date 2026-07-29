'use client'

import { Search, Bell, ChevronDown } from 'lucide-react'

export function TopNavbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-30 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search feedback..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative rounded-lg p-2 hover:bg-muted">
            <Bell className="h-5 w-5 text-foreground/60" />
            <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-chart-3" />
          </button>

          <div className="h-8 w-px bg-border" />

          <button className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted">
            <div className="h-8 w-8 rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg, #2e4391 0%, #59329c 50%, #8529bd 100%)' }} />
            <div className="text-left">
              <p className="text-sm font-medium">Alex Rivera</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  )
}

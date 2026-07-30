'use client'

import { Search, Bell, ChevronDown, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function TopNavbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <header className="sticky top-0 z-50 rounded-b-4xl flex h-20 items-center justify-between border-b-2 border-primary/20 bg-card/40 backdrop-blur-md px-4 lg:px-6 shadow-lg shadow-primary/5 w-full">
      <div className="flex flex-1 items-center gap-4">
        <SidebarTrigger className="-ml-1 mr-2 text-foreground/70 hover:text-foreground" />
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search feedback..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 hover:bg-muted text-foreground/60 transition-colors"
          aria-label="Toggle theme"
        >
          {mounted ? (
            theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )
          ) : (
            <div className="h-5 w-5" />
          )}
        </button>

        <button className="relative rounded-lg p-2 hover:bg-muted" aria-label="Notifications">
          <Bell className="h-5 w-5 text-foreground/60" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
        </button>

        <div className="h-8 w-px bg-border" />

        <button className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted">
          <div className="h-8 w-8 rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg, #2e4391 0%, #59329c 50%, #8529bd 100%)' }} />
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium">Alex Rivera</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}


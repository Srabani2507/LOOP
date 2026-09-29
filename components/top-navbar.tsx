'use client'

import { Bell, Sun, Moon, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSidebar } from '@/lib/sidebar-context'

export function TopNavbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const { toggle } = useSidebar()

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
    <header className="shrink-0 z-50 relative overflow-hidden rounded-b-4xl flex h-20 items-center justify-between border-b-2 border-primary/20 bg-card/25 backdrop-blur-md px-4 lg:px-6 shadow-lg shadow-primary/5 w-full">
      <span className="absolute inset-0 bg-primary-gradient opacity-[0.07] dark:opacity-[0.10] pointer-events-none" />
      <div className="relative z-10 flex flex-1 items-center gap-4">
        {/* Hamburger — visible on mobile, hidden on desktop since sidebar is always open */}
        <button
          onClick={toggle}
          className="lg:hidden -ml-1 mr-2 rounded-lg p-2 text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* LOOP Header */}
        <div className="flex items-center gap-0 mr-4 w-80 lg:w-72 shrink-0">
          <Image src="/LOOP-logo.svg" alt="LOOP Logo" width={60} height={60} className="h-12 w-auto relative z-10" priority />
          <Image src="/LOOP-text.svg" alt="LOOP Text" width={100} height={28} className="h-14 w-auto -ml-8" priority />
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 lg:gap-3">
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
        </button>
      </div>
    </header>
  )
}

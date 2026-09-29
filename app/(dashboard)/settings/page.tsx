'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Save, Copy, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const userName = session?.user?.name || ''
  const userEmail = session?.user?.email || ''

  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'auto'
    setTheme(savedTheme)
  }, [])

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else if (newTheme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.remove('dark', 'light')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3 w-full">
        <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="absolute inset-0 bg-primary-gradient opacity-[0.12] dark:opacity-[0.16] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  defaultValue={userName}
                  disabled
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  defaultValue={userEmail}
                  disabled
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm opacity-50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>


        <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="absolute inset-0 bg-primary-gradient opacity-[0.12] dark:opacity-[0.16] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-lg font-semibold mb-4">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Theme</label>
                <div className="flex gap-2">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'auto', label: 'Auto' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleThemeChange(option.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        theme === option.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {option.icon && <option.icon className="h-4 w-4" />}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="absolute inset-0 bg-primary-gradient opacity-[0.12] dark:opacity-[0.16] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              {['Email notifications', 'Slack alerts', 'Spike notifications'].map((notif) => (
                <div key={notif} className="flex items-center justify-between">
                  <p className="text-sm">{notif}</p>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}

import { Sidebar } from '@/components/sidebar'
import { TopNavbar } from '@/components/top-navbar'
import { SidebarProvider } from '@/lib/sidebar-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <TopNavbar />
        <div className="flex-1 flex min-h-0 relative">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 lg:ml-64">
            <div className="bg-card border border-border/50 rounded-3xl p-6 min-h-[calc(100vh-8rem)] shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

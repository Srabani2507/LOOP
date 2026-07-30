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
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        {/* Main content shifts right on desktop to account for the fixed sidebar */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          <TopNavbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

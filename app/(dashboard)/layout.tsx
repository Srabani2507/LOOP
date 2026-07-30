import { Sidebar } from '@/components/sidebar'
import { TopNavbar } from '@/components/top-navbar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="bg-background">
        <TopNavbar />
        <main className="p-6 min-h-screen">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

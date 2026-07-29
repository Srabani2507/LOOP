import { Sidebar } from '@/components/sidebar'
import { TopNavbar } from '@/components/top-navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background">
      <Sidebar />
      <TopNavbar />
      <main className="ml-64 pt-20 p-6 min-h-screen">
        {children}
      </main>
    </div>
  )
}

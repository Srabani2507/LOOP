'use client'

import { teamMembers } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreVertical, UserPlus, Trash2 } from 'lucide-react'
import { useState } from 'react'

const roleColors = {
  Admin: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  Editor: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  Viewer: 'bg-muted text-foreground border-border',
}

export default function MembersPage() {
  const [members, setMembers] = useState(teamMembers)

  const handleRemove = (id: string) => {
    setMembers(members.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="mt-1 text-muted-foreground">Manage your team and permissions</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Role</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium">{member.name}</td>
                <td className="px-6 py-4 text-muted-foreground text-sm">{member.email}</td>
                <td className="px-6 py-4">
                  <Badge
                    className={roleColors[member.role as keyof typeof roleColors]}
                  >
                    {member.role}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline">Active</Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="inline-flex items-center justify-center rounded hover:bg-muted p-2">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { role: 'Admin', description: 'Full access to all features and settings' },
          { role: 'Editor', description: 'Can create and edit feedback, view reports' },
          { role: 'Viewer', description: 'Read-only access to feedback and analytics' },
        ].map((role) => (
          <div key={role.role} className="rounded-lg border border-border bg-card p-4">
            <p className="font-semibold text-sm mb-1">{role.role}</p>
            <p className="text-xs text-muted-foreground">{role.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

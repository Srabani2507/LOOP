"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  X,
  Mail,
  User,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  createdAt: string;
}

const roleColors = {
  ADMIN: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-semibold",
  ANALYST: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-semibold",
  VIEWER: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 font-semibold",
};

export default function MembersPage() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const currentUserRole = (session?.user as any)?.role as "ADMIN" | "ANALYST" | "VIEWER" | undefined;
  const currentUserId = (session?.user as any)?.id as string | undefined;
  const isAdmin = currentUserRole === "ADMIN";

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
    role: "VIEWER" as "ADMIN" | "ANALYST" | "VIEWER",
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Role Change state
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (!res.ok) {
        throw new Error("Failed to load workspace members");
      }
      const data = await res.json();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add member");
      }

      setSuccessMessage(`Successfully added ${newMember.name} to workspace.`);
      setIsModalOpen(false);
      setNewMember({ name: "", email: "", password: "", role: "VIEWER" });
      fetchMembers();

      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: "ADMIN" | "ANALYST" | "VIEWER") => {
    setUpdatingId(memberId);
    try {
      const res = await fetch(`/api/users/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update role");
      }

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      setSuccessMessage("Member role updated successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(""), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const executeRemoveMember = async (memberId: string, name: string) => {
    setRemovingId(memberId);
    try {
      const res = await fetch(`/api/users/${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to remove member");
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setSuccessMessage(`Removed ${name} from workspace.`);
      setMemberToRemove(null);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(""), 4000);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
            {isAdmin ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1.5 py-1 px-3">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin Control
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1.5 py-1 px-3 text-muted-foreground">
                <ShieldAlert className="h-3.5 w-3.5" /> Read Only ({currentUserRole})
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your workspace team members and role-based permissions (RBAC).
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-primary-gradient text-white shadow-md hover:opacity-95"
          >
            <UserPlus className="h-4 w-4" />
            Add Team Member
          </Button>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive dark:text-red-400 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Members Table Card */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Joined Date</th>
                {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading workspace members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-muted-foreground">
                    No members found in this workspace.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const isSelf = member.id === currentUserId;
                  return (
                    <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                            {member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {member.name} {isSelf && <span className="text-xs text-muted-foreground font-normal">(You)</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {member.email}
                      </td>

                      {/* Role Selector / Badge */}
                      <td className="px-6 py-4">
                        {isAdmin && !isSelf ? (
                          <div className="relative inline-block">
                            <select
                              value={member.role}
                              disabled={updatingId === member.id}
                              onChange={(e) =>
                                handleRoleChange(
                                  member.id,
                                  e.target.value as "ADMIN" | "ANALYST" | "VIEWER"
                                )
                              }
                              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold bg-background focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${
                                roleColors[member.role]
                              }`}
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="ANALYST">ANALYST</option>
                              <option value="VIEWER">VIEWER</option>
                            </select>
                          </div>
                        ) : (
                          <Badge variant="outline" className={roleColors[member.role]}>
                            {member.role}
                          </Badge>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(member.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          {!isSelf && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMemberToRemove(member)}
                              className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive gap-1 text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-2">
        {[
          {
            role: "ADMIN",
            color: "text-purple-600 dark:text-purple-400",
            description: "Full access to add/remove workspace members, change roles, delete feedback, and modify workspace settings.",
          },
          {
            role: "ANALYST",
            color: "text-blue-600 dark:text-blue-400",
            description: "Can create, update, and analyze feedback and generate reports. Cannot manage team members or delete items.",
          },
          {
            role: "VIEWER",
            color: "text-slate-600 dark:text-slate-400",
            description: "Read-only access to feedback stream, trends, and dashboard insights. Cannot create or edit items.",
          },
        ].map((item) => (
          <div key={item.role} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <p className={`font-bold text-sm mb-1 ${item.color}`}>{item.role}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-6 sm:p-7 shadow-2xl backdrop-blur-xl transition-all">
            {/* Top Primary Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient" />

            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -top-20 -left-20 h-44 w-44 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 relative z-10 mb-5">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                    Add Workspace Member
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    Create a new team user account for your workspace.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 relative z-10">
              {modalError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive dark:text-red-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    required
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Rupak Sarkar"
                    className="pl-10 h-10 rounded-xl bg-background/60 border-border/80 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="rupaksarkar1102@gmail.com"
                    className="pl-10 h-10 rounded-xl bg-background/60 border-border/80 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="pl-10 h-10 rounded-xl bg-background/60 border-border/80 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Assign Role */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5">
                  Assign RBAC Role
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      role: e.target.value as "ADMIN" | "ANALYST" | "VIEWER",
                    })
                  }
                  className="w-full h-10 rounded-xl border border-border/80 bg-background/60 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer font-medium"
                >
                  <option value="VIEWER">VIEWER (Read-only)</option>
                  <option value="ANALYST">ANALYST (Create/Edit feedback & reports)</option>
                  <option value="ADMIN">ADMIN (Full workspace access)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 rounded-xl border-border/80 bg-background/50 hover:bg-muted px-4 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-10 rounded-xl bg-primary-gradient text-white font-semibold text-xs px-5 shadow-lg shadow-primary/25 transition-all hover:opacity-95 active:scale-[0.99] flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Adding Member...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Add Member</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-6 sm:p-7 shadow-2xl backdrop-blur-xl transition-all">
            {/* Top Red Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-600 to-pink-600" />

            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -top-20 -left-20 h-44 w-44 rounded-full bg-rose-500/20 blur-3xl dark:bg-rose-500/30" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-inner">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                    Remove Workspace Member
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    Member will lose workspace access immediately.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMemberToRemove(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Member Card Preview */}
            <div className="relative z-10 mt-5 rounded-2xl border border-border/70 bg-background/60 p-4 shadow-sm backdrop-blur-sm flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 text-primary border border-primary/20 font-bold text-xs flex items-center justify-center shrink-0">
                {memberToRemove.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{memberToRemove.name}</p>
                <p className="text-xs text-muted-foreground font-mono truncate">{memberToRemove.email}</p>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold py-0.5 px-2">
                {memberToRemove.role}
              </Badge>
            </div>

            {/* Actions */}
            <div className="relative z-10 flex items-center justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                disabled={removingId === memberToRemove.id}
                onClick={() => setMemberToRemove(null)}
                className="h-10 rounded-xl border-border/80 bg-background/50 hover:bg-muted px-4 text-xs font-semibold transition-all"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={removingId === memberToRemove.id}
                onClick={() => executeRemoveMember(memberToRemove.id, memberToRemove.name)}
                className="h-10 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white font-semibold text-xs px-5 shadow-lg shadow-rose-500/25 transition-all hover:opacity-95 hover:shadow-rose-500/35 active:scale-[0.99] flex items-center gap-2"
              >
                {removingId === memberToRemove.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Remove Member</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

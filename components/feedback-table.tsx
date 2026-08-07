"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Pencil, X } from "lucide-react";

interface FeedbackItem {
  id: string;
  content: string;
  channel: "WEBSITE" | "MOBILE_APP" | "EMAIL" | "API" | "CSV";
  customerLabel: string | null;
  externalReference: string | null;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | null;
  sentimentScore: number | null;
  status: "NEW" | "PROCESSING" | "ANALYZED" | "FAILED";
  createdAt: string;
}

const sentimentColors = {
  POSITIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold",
  NEGATIVE: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold",
  NEUTRAL: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold",
};

export function FeedbackTable() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const canEdit = userRole === "ADMIN" || userRole === "ANALYST";

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [feedbackToEdit, setFeedbackToEdit] = useState<FeedbackItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    content: "",
    channel: "WEBSITE" as "WEBSITE" | "MOBILE_APP" | "EMAIL" | "API" | "CSV",
    customerLabel: "",
    externalReference: "",
    sentiment: "NEUTRAL" as "POSITIVE" | "NEUTRAL" | "NEGATIVE",
    sentimentScore: "0",
    status: "NEW" as "NEW" | "PROCESSING" | "ANALYZED" | "FAILED",
  });

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch("/api/feedback?limit=5");
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch recent feedback:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecent();
  }, []);

  const openEditModal = (item: FeedbackItem) => {
    setFeedbackToEdit(item);
    setEditForm({
      content: item.content || "",
      channel: item.channel || "WEBSITE",
      customerLabel: item.customerLabel || "",
      externalReference: item.externalReference || "",
      sentiment: item.sentiment || "NEUTRAL",
      sentimentScore: item.sentimentScore !== null && item.sentimentScore !== undefined ? item.sentimentScore.toString() : "0",
      status: item.status || "NEW",
    });
    setEditError("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackToEdit) return;
    setSavingEdit(true);
    setEditError("");

    try {
      const payload: any = {
        content: editForm.content,
        channel: editForm.channel,
        customerLabel: editForm.customerLabel || undefined,
        externalReference: editForm.externalReference || undefined,
        sentiment: editForm.sentiment || undefined,
        sentimentScore: editForm.sentimentScore !== "" ? parseFloat(editForm.sentimentScore) : undefined,
        status: editForm.status,
      };

      const res = await fetch(`/api/feedback/${feedbackToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update feedback");
      }

      const updatedItem = await res.json();
      setFeedbacks((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item))
      );
      setFeedbackToEdit(null);
    } catch (err: any) {
      setEditError(err.message || "An error occurred while updating feedback");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden border border-border/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Channel</th>
                <th className="px-6 py-3.5">Sentiment</th>
                <th className="px-6 py-3.5">Message</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                {canEdit && <th className="px-6 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="px-6 py-10 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-1 text-primary" />
                    Loading feedback...
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="px-6 py-10 text-center text-muted-foreground">
                    <MessageSquare className="h-6 w-6 mx-auto mb-1 text-muted-foreground/50" />
                    No recent feedback entries found.
                  </td>
                </tr>
              ) : (
                feedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {item.customerLabel || item.externalReference || "Anonymous"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{item.channel.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {item.sentiment ? (
                        <Badge className={sentimentColors[item.sentiment]}>
                          {item.sentiment}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-foreground/80">
                      {item.content}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary" className="text-[11px]">
                        {item.status}
                      </Badge>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg cursor-pointer transition-colors"
                          title="Edit Feedback (Admin & Analyst)"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal */}
      {feedbackToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient" />
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                    Edit Feedback Entry
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    Modify feedback details, status, sentiment, or message content
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackToEdit(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="relative z-10 mt-6 space-y-4">
              {editError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Customer Label
                  </label>
                  <input
                    type="text"
                    value={editForm.customerLabel}
                    onChange={(e) => setEditForm({ ...editForm, customerLabel: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full h-10 rounded-xl border border-border bg-background px-3.5 text-xs transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    External Reference ID
                  </label>
                  <input
                    type="text"
                    value={editForm.externalReference}
                    onChange={(e) => setEditForm({ ...editForm, externalReference: e.target.value })}
                    placeholder="e.g. ID: 174"
                    className="w-full h-10 rounded-xl border border-border bg-background px-3.5 text-xs transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Channel
                  </label>
                  <select
                    value={editForm.channel}
                    onChange={(e) => setEditForm({ ...editForm, channel: e.target.value as any })}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="WEBSITE">Website</option>
                    <option value="MOBILE_APP">Mobile App</option>
                    <option value="EMAIL">Email</option>
                    <option value="API">API</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Sentiment
                  </label>
                  <select
                    value={editForm.sentiment}
                    onChange={(e) => setEditForm({ ...editForm, sentiment: e.target.value as any })}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="POSITIVE">Positive</option>
                    <option value="NEUTRAL">Neutral</option>
                    <option value="NEGATIVE">Negative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="NEW">New</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="ANALYZED">Analyzed</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Sentiment Score (-1.0 to 1.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="-1"
                  max="1"
                  value={editForm.sentimentScore}
                  onChange={(e) => setEditForm({ ...editForm, sentimentScore: e.target.value })}
                  placeholder="e.g. -0.8"
                  className="w-full h-10 rounded-xl border border-border bg-background px-3.5 text-xs transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Feedback Message *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter feedback message..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingEdit}
                  onClick={() => setFeedbackToEdit(null)}
                  className="h-10 rounded-xl border-border/80 bg-background/50 hover:bg-muted px-4 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingEdit}
                  className="h-10 rounded-xl bg-primary-gradient text-white font-semibold text-xs px-5 shadow-lg shadow-primary/20 transition-all hover:opacity-95 flex items-center gap-2"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

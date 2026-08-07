"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  MessageSquare, 
  RefreshCw,
  X,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Pencil
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  workspace: {
    id: string;
    name: string;
  };
}

const sentimentStyles = {
  POSITIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold",
  NEGATIVE: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold",
  NEUTRAL: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold",
};

const statusStyles = {
  NEW: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  PROCESSING: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 animate-pulse",
  ANALYZED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  FAILED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const channelStyles = {
  WEBSITE: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  MOBILE_APP: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  EMAIL: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  API: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  CSV: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
};

export default function InboxPage() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";
  const isAnalyst = userRole === "ANALYST";
  const canEdit = isAdmin || isAnalyst;
  const canDelete = isAdmin;
  const showActions = canEdit || canDelete;

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<FeedbackItem | null>(null);
  
  // Edit State
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
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Query parameters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [channelFilter, setChannelFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) query.append("search", search);
      if (sentimentFilter) query.append("sentiment", sentimentFilter);
      if (statusFilter) query.append("status", statusFilter);
      if (channelFilter) query.append("channel", channelFilter);

      const res = await fetch(`/api/feedback?${query.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch customer feedback data");
      }

      const responseData = await res.json();
      setFeedbacks(responseData.data || []);
      setTotalPages(responseData.totalPages || 1);
      setTotalItems(responseData.total || 0);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sentimentFilter, statusFilter, channelFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Handle Search Input submit / keypress
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setSentimentFilter("");
    setStatusFilter("");
    setChannelFilter("");
    setPage(1);
  };

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
      setSuccessMessage("Feedback entry updated successfully.");
      setFeedbackToEdit(null);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setEditError(err.message || "An error occurred while updating feedback");
    } finally {
      setSavingEdit(false);
    }
  };

  const executeDeleteFeedback = async (id: string) => {
    setDeletingId(id);
    setError("");
    setSuccessMessage("");
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete feedback");
      }

      setFeedbacks((prev) => prev.filter((item) => item.id !== id));
      setTotalItems((prev) => Math.max(prev - 1, 0));
      setSuccessMessage("Feedback record successfully deleted from database.");
      setFeedbackToDelete(null);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to delete feedback");
    } finally {
      setDeletingId(null);
    }
  };

  const hasActiveFilters = search || sentimentFilter || statusFilter || channelFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and review all customer feedback in your workspace ({totalItems} total)
          </p>
        </div>
        <Button
          onClick={() => fetchFeedback()}
          variant="outline"
          size="sm"
          disabled={loading}
          className="gap-2 self-start sm:self-auto rounded-xl"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search feedback message or customer label (press Enter)..."
              className="w-full rounded-xl border border-border/80 bg-background py-2.5 pl-10 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>

          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 rounded-xl h-10"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="gap-1 rounded-xl h-10 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 p-4 rounded-2xl border border-border/60 bg-muted/20 backdrop-blur-md animate-in fade-in">
            {/* Sentiment Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Sentiment
              </label>
              <select
                value={sentimentFilter}
                onChange={(e) => {
                  setSentimentFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Sentiments</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEUTRAL">Neutral</option>
                <option value="NEGATIVE">Negative</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="NEW">New</option>
                <option value="PROCESSING">Processing</option>
                <option value="ANALYZED">Analyzed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {/* Channel Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Channel
              </label>
              <select
                value={channelFilter}
                onChange={(e) => {
                  setChannelFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Channels</option>
                <option value="WEBSITE">Website</option>
                <option value="MOBILE_APP">Mobile App</option>
                <option value="EMAIL">Email</option>
                <option value="API">API</option>
                <option value="CSV">CSV</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-medium text-destructive">
          {error}
        </div>
      )}

      {/* Inbox Data Table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Channel</th>
                <th className="px-6 py-3.5">Sentiment</th>
                <th className="px-6 py-3.5">Feedback Message</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Status</th>
                {showActions && <th className="px-6 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={showActions ? 7 : 6} className="px-6 py-16 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading database feedback records...
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 7 : 6} className="px-6 py-16 text-center text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    No feedback entries found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                feedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    {/* Customer Label / Ref */}
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {item.customerLabel || item.externalReference || "Anonymous"}
                    </td>

                    {/* Channel */}
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={channelStyles[item.channel]}>
                        {item.channel.replace("_", " ")}
                      </Badge>
                    </td>

                    {/* Sentiment */}
                    <td className="px-6 py-4">
                      {item.sentiment ? (
                        <Badge className={sentimentStyles[item.sentiment]}>
                          {item.sentiment}
                          {item.sentimentScore !== null && (
                            <span className="ml-1 opacity-80 text-[10px]">
                              ({Math.round(item.sentimentScore * 100)}%)
                            </span>
                          )}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </td>

                    {/* Message Content */}
                    <td className="px-6 py-4 max-w-md text-foreground/90 leading-relaxed font-normal">
                      <p className="line-clamp-2">{item.content}</p>
                    </td>

                    {/* Creation Date */}
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={statusStyles[item.status]}>
                        {item.status}
                      </Badge>
                    </td>

                    {/* Actions (Admin & Analyst) */}
                    {showActions && (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(item)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg cursor-pointer transition-colors"
                              title="Edit Feedback (Admin & Analyst)"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}

                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingId === item.id}
                              onClick={() => setFeedbackToDelete(item)}
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg cursor-pointer transition-colors"
                              title="Delete Feedback (Admin Only)"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{feedbacks.length}</span> of{" "}
          <span className="font-semibold text-foreground">{totalItems}</span> feedback entries
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1 || loading}
            className="h-9 rounded-xl gap-1 text-xs"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-xs font-medium px-2 text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages || loading}
            className="h-9 rounded-xl gap-1 text-xs"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modern Premium Confirmation Modal */}
      {feedbackToDelete && (
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
                    Delete Feedback Record
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFeedbackToDelete(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Item Card Preview */}
            <div className="relative z-10 mt-5 rounded-2xl border border-border/70 bg-background/60 p-4 shadow-sm backdrop-blur-sm space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Customer: {feedbackToDelete.customerLabel || feedbackToDelete.externalReference || "Anonymous"}</span>
                <Badge variant="outline" className="text-[10px] py-0 px-2 border-border/80">
                  {feedbackToDelete.channel}
                </Badge>
              </div>
              <p className="text-xs text-foreground/90 font-medium italic leading-relaxed line-clamp-3">
                &ldquo;{feedbackToDelete.content}&rdquo;
              </p>
            </div>

            {/* Actions */}
            <div className="relative z-10 flex items-center justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                disabled={deletingId === feedbackToDelete.id}
                onClick={() => setFeedbackToDelete(null)}
                className="h-10 rounded-xl border-border/80 bg-background/50 hover:bg-muted px-4 text-xs font-semibold transition-all"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={deletingId === feedbackToDelete.id}
                onClick={() => executeDeleteFeedback(feedbackToDelete.id)}
                className="h-10 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white font-semibold text-xs px-5 shadow-lg shadow-rose-500/25 transition-all hover:opacity-95 hover:shadow-rose-500/35 active:scale-[0.99] flex items-center gap-2"
              >
                {deletingId === feedbackToDelete.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Record</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Premium Edit Feedback Modal */}
      {feedbackToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
            {/* Top Primary Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient" />

            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/20 blur-3xl dark:bg-primary/30" />

            {/* Header */}
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

            {/* Edit Form */}
            <form onSubmit={handleSaveEdit} className="relative z-10 mt-6 space-y-4">
              {editError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Label */}
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

                {/* External Reference */}
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
                {/* Channel */}
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

                {/* Sentiment */}
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

                {/* Status */}
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

              {/* Sentiment Score */}
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

              {/* Content */}
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

              {/* Actions */}
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
    </div>
  );
}

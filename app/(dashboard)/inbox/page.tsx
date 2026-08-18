"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Pencil,
  Upload,
  Zap,
  Calendar,
  Tag,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ThemeRef {
  id: string;
  name: string;
  color: string | null;
}

interface FeedbackItem {
  id: string;
  content: string;
  channel: "WEBSITE" | "MOBILE_APP" | "EMAIL" | "API" | "CSV";
  customerLabel: string | null;
  externalReference: string | null;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | null;
  sentimentScore: number | null;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  createdAt: string;
  themes: Array<{ confidence: number | null; theme: ThemeRef }>;
  workspace: { id: string; name: string };
}

interface ThemeOption {
  id: string;
  name: string;
  color: string | null;
  feedbackCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Style maps
// ─────────────────────────────────────────────────────────────────────────────
const sentimentStyles: Record<string, string> = {
  POSITIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold",
  NEGATIVE: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold",
  NEUTRAL: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold",
};

const statusStyles: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  REVIEWED: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  ACTIONED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const channelStyles: Record<string, string> = {
  WEBSITE: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  MOBILE_APP: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  EMAIL: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  API: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  CSV: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
};

const SIMULATE_CHANNELS = [
  { key: "SUPPORT_TICKET", label: "Support Tickets", icon: "🎫" },
  { key: "APP_STORE", label: "App Store Reviews", icon: "⭐" },
  { key: "NPS_SURVEY", label: "NPS Survey", icon: "📊" },
  { key: "SALES_NOTE", label: "Sales Notes", icon: "💼" },
  { key: "COMMUNITY", label: "Community Posts", icon: "💬" },
] as const;

// Triage statuses available in the UI workflow
const TRIAGE_STATUSES = ["NEW", "REVIEWED", "ACTIONED"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";
  const isAnalyst = userRole === "ANALYST";
  const canEdit = isAdmin || isAnalyst;
  const canDelete = isAdmin;
  const showActions = canEdit || canDelete;

  // Read themeId passed from Trends drill-down via sessionStorage (keeps URL clean)
  const initialThemeId = (() => {
    if (typeof window === 'undefined') return '';
    const val = sessionStorage.getItem('inbox_themeFilter') ?? '';
    if (val) sessionStorage.removeItem('inbox_themeFilter'); // consume once
    return val;
  })();

  // ── Feedback list state
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<FeedbackItem | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ── Edit state
  const [feedbackToEdit, setFeedbackToEdit] = useState<FeedbackItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    content: "",
    channel: "WEBSITE" as FeedbackItem["channel"],
    customerLabel: "",
    externalReference: "",
    sentiment: "NEUTRAL" as "POSITIVE" | "NEUTRAL" | "NEGATIVE",
    sentimentScore: "0",
    status: "NEW" as FeedbackItem["status"],
  });

  // ── Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ── Filters
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [themeFilter, setThemeFilter] = useState(initialThemeId);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(!!initialThemeId);
  const [themes, setThemes] = useState<ThemeOption[]>([]);

  // ── CSV Import state
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState<{
    imported: number;
    failed: number;
    total: number;
    errors: Array<{ row: number; issues: string[] }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Simulate channel state
  const [simulatingChannel, setSimulatingChannel] = useState<string | null>(null);
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);

  // ── Inline status change
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // ── Re-classify
  const [reclassifyingId, setReclassifyingId] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch themes (for filter dropdown)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadThemes() {
      try {
        const res = await fetch("/api/themes");
        if (res.ok) {
          const data = await res.json();
          setThemes(data.data || []);
        }
      } catch (_) {}
    }
    loadThemes();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch feedback
  // ─────────────────────────────────────────────────────────────────────────
  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) query.append("search", search);
      if (sentimentFilter) query.append("sentiment", sentimentFilter);
      if (statusFilter) query.append("status", statusFilter);
      if (channelFilter) query.append("channel", channelFilter);
      if (themeFilter) query.append("themeId", themeFilter);
      if (dateFrom) query.append("dateFrom", dateFrom);
      if (dateTo) query.append("dateTo", dateTo);

      const res = await fetch(`/api/feedback?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch feedback");

      const responseData = await res.json();
      setFeedbacks(responseData.data || []);
      setTotalPages(responseData.totalPages || 1);
      setTotalItems(responseData.total || 0);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sentimentFilter, statusFilter, channelFilter, themeFilter, dateFrom, dateTo]);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers — filters, search, edit, delete
  // ─────────────────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput(""); setSearch("");
    setSentimentFilter(""); setStatusFilter("");
    setChannelFilter(""); setThemeFilter("");
    setDateFrom(""); setDateTo("");
    setPage(1);
  };

  const hasActiveFilters = !!(search || sentimentFilter || statusFilter || channelFilter || themeFilter || dateFrom || dateTo);

  const openEditModal = (item: FeedbackItem) => {
    setFeedbackToEdit(item);
    setEditForm({
      content: item.content || "",
      channel: item.channel || "WEBSITE",
      customerLabel: item.customerLabel || "",
      externalReference: item.externalReference || "",
      sentiment: item.sentiment || "NEUTRAL",
      sentimentScore: item.sentimentScore != null ? item.sentimentScore.toString() : "0",
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
      setFeedbacks((prev) => prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item)));
      setSuccessMessage("Feedback updated successfully.");
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
    setError(""); setSuccessMessage("");
    try {
      const res = await fetch(`/api/feedback/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete feedback");
      }
      setFeedbacks((prev) => prev.filter((item) => item.id !== id));
      setTotalItems((prev) => Math.max(prev - 1, 0));
      setSuccessMessage("Feedback deleted.");
      setFeedbackToDelete(null);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to delete feedback");
    } finally {
      setDeletingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Re-classify with AI
  // ─────────────────────────────────────────────────────────────────────────
  const handleReclassify = async (id: string) => {
    setReclassifyingId(id);
    try {
      const res = await fetch(`/api/feedback/${id}/classify`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Classification failed");
      // Update the item's sentiment and themes in-place
      setFeedbacks((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                sentiment: data.sentiment ?? item.sentiment,
                sentimentScore: data.sentimentScore ?? item.sentimentScore,
                themes: data.themes ?? item.themes,
              }
            : item
        )
      );
      setSuccessMessage("✓ AI re-classification complete.");
      setTimeout(() => setSuccessMessage(""), 4000);
      // Refresh to get linked theme objects
      fetchFeedback();
    } catch (err: any) {
      setError(err.message || "Failed to re-classify feedback");
      setTimeout(() => setError(""), 4000);
    } finally {
      setReclassifyingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Inline status change (NEW → REVIEWED → ACTIONED)
  // ─────────────────────────────────────────────────────────────────────────
  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingStatusId(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setFeedbacks((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus as FeedbackItem["status"] } : item))
      );
    } catch (_) {
      setError("Failed to update status. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CSV Import
  // ─────────────────────────────────────────────────────────────────────────
  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setCsvUploading(true);
    setCsvResult(null);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      const res = await fetch("/api/feedback/csv-upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setCsvResult(data);
      if (data.imported > 0) {
        fetchFeedback();
      }
    } catch (err: any) {
      setCsvResult({ imported: 0, failed: 0, total: 0, errors: [{ row: 0, issues: [err.message] }] });
    } finally {
      setCsvUploading(false);
    }
  };

  const resetCsvModal = () => {
    setShowCsvModal(false);
    setCsvFile(null);
    setCsvResult(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Simulate channel
  // ─────────────────────────────────────────────────────────────────────────
  const handleSimulate = async (channelKey: string) => {
    setSimulatingChannel(channelKey);
    setShowSimulateMenu(false);
    try {
      const res = await fetch("/api/feedback/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: channelKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Simulation failed");
      setSuccessMessage(`✓ Seeded ${data.seeded} realistic items from ${channelKey.replace("_", " ").toLowerCase()}.`);
      setTimeout(() => setSuccessMessage(""), 5000);
      fetchFeedback();
    } catch (err: any) {
      setError(err.message || "Failed to simulate channel data");
      setTimeout(() => setError(""), 4000);
    } finally {
      setSimulatingChannel(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and triage customer feedback — {totalItems} items in workspace
          </p>
        </div>

        {/* Action buttons — Import CSV + Simulate + Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {canEdit && (
            <>
              {/* CSV Import */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowCsvModal(true); setCsvResult(null); setCsvFile(null); }}
                className="gap-2 rounded-xl h-9"
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>

              {/* Simulate Channel */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSimulateMenu((v) => !v)}
                  disabled={!!simulatingChannel}
                  className="gap-2 rounded-xl h-9"
                >
                  {simulatingChannel ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  Simulate Channel
                </Button>

                {showSimulateMenu && (
                  <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                    {SIMULATE_CHANNELS.map((ch) => (
                      <button
                        key={ch.key}
                        onClick={() => handleSimulate(ch.key)}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                      >
                        <span>{ch.icon}</span>
                        <span>{ch.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <Button
            onClick={() => fetchFeedback()}
            variant="ghost"
            size="sm"
            disabled={loading}
            className="gap-2 rounded-xl h-9"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Search + Filter bar */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search feedback or customer label… (press Enter)"
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
              {hasActiveFilters && <span className="flex h-2 w-2 rounded-full bg-primary" />}
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 p-4 rounded-2xl border border-border/60 bg-muted/20 backdrop-blur-md animate-in fade-in">
            {/* Sentiment */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Sentiment
              </label>
              <select
                value={sentimentFilter}
                onChange={(e) => { setSentimentFilter(e.target.value); setPage(1); }}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Sentiments</option>
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
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="NEW">New</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="ACTIONED">Actioned</option>
              </select>
            </div>

            {/* Channel */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Channel
              </label>
              <select
                value={channelFilter}
                onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
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

            {/* Theme (Day 9) */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                <Tag className="h-3 w-3" /> Theme
              </label>
              <select
                value={themeFilter}
                onChange={(e) => { setThemeFilter(e.target.value); setPage(1); }}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Themes</option>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.feedbackCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Date From (Day 9) */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                <Calendar className="h-3 w-3" /> Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Date To (Day 9) */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                <Calendar className="h-3 w-3" /> Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Toasts */}
      {successMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Feedback table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Channel</th>
                <th className="px-5 py-3.5">Sentiment</th>
                <th className="px-5 py-3.5">Feedback</th>
                <th className="px-5 py-3.5">Themes</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Status</th>
                {showActions && <th className="px-5 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={showActions ? 8 : 7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs">Loading feedback…</span>
                    </div>
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 8 : 7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <MessageSquare className="h-10 w-10 opacity-30" />
                      <div>
                        <p className="font-medium text-sm">No feedback found</p>
                        <p className="text-xs mt-1">
                          {hasActiveFilters
                            ? "Try adjusting your filters"
                            : "Import a CSV or simulate a channel to add feedback"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                feedbacks.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border/40 transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? "" : "bg-muted/10"}`}
                  >
                    {/* Customer */}
                    <td className="px-5 py-3.5 max-w-[120px]">
                      <span className="text-xs font-medium truncate block" title={item.customerLabel ?? undefined}>
                        {item.customerLabel || <span className="text-muted-foreground italic">Anonymous</span>}
                      </span>
                    </td>

                    {/* Channel */}
                    <td className="px-5 py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0.5 px-2 rounded-full whitespace-nowrap ${channelStyles[item.channel] || ""}`}
                      >
                        {item.channel.replace("_", " ")}
                      </Badge>
                    </td>

                    {/* Sentiment */}
                    <td className="px-5 py-3.5">
                      {item.sentiment ? (
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0.5 px-2 rounded-full ${sentimentStyles[item.sentiment] || ""}`}
                        >
                          {item.sentiment}
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Unclassified</span>
                      )}
                    </td>

                    {/* Feedback content */}
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-xs leading-relaxed line-clamp-2" title={item.content}>
                        {item.content}
                      </p>
                    </td>

                    {/* Themes (Day 9) */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {item.themes && item.themes.length > 0 ? (
                          item.themes.slice(0, 2).map((ft) => (
                            <Badge
                              key={ft.theme.id}
                              variant="outline"
                              className="text-[10px] py-0.5 px-1.5 rounded-full"
                              style={{
                                borderColor: ft.theme.color ? `${ft.theme.color}40` : undefined,
                                color: ft.theme.color ?? undefined,
                                backgroundColor: ft.theme.color ? `${ft.theme.color}15` : undefined,
                              }}
                            >
                              {ft.theme.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">—</span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Inline Status (Day 8) */}
                    <td className="px-5 py-3.5">
                      {canEdit && TRIAGE_STATUSES.includes(item.status as any) ? (
                        <div className="relative">
                          {updatingStatusId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className={`rounded-full border px-2 py-1 text-[10px] font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${statusStyles[item.status] || ""}`}
                            >
                              {TRIAGE_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0.5 px-2 rounded-full ${statusStyles[item.status] || ""}`}
                        >
                          {item.status}
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    {showActions && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <>
                              {/* Re-classify with AI */}
                              <button
                                onClick={() => handleReclassify(item.id)}
                                disabled={reclassifyingId === item.id}
                                title="Re-classify with AI"
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50"
                              >
                                {reclassifyingId === item.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => openEditModal(item)}
                                title="Edit"
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setFeedbackToDelete(item)}
                              title="Delete"
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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

        {/* Pagination */}
        {!loading && feedbacks.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/40 px-5 py-3">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {totalItems} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-sm disabled:opacity-40 hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-sm disabled:opacity-40 hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CSV Import Modal (Day 6)
      ══════════════════════════════════════════════════════════════════════ */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Import CSV</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload a CSV file with columns: <code className="text-primary">content</code>, <code className="text-primary">channel</code>, <code className="text-primary">customer_label</code>, <code className="text-primary">created_at</code>
                </p>
              </div>
              <button onClick={resetCsvModal} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Channel values hint */}
            <div className="rounded-xl bg-muted/40 border border-border/60 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Valid channel values:</p>
              <p className="font-mono">WEBSITE · MOBILE_APP · EMAIL · API · CSV</p>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-colors ${csvFile ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/20"}`}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              {csvFile ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-primary">{csvFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(csvFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium">Click to select CSV file</p>
                  <p className="text-xs text-muted-foreground">or drag and drop here</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setCsvFile(f); setCsvResult(null); }
                }}
              />
            </div>

            {/* Result */}
            {csvResult && (
              <div className={`rounded-xl border p-4 text-sm space-y-2 ${csvResult.imported > 0 ? "border-emerald-500/30 bg-emerald-500/10" : "border-rose-500/30 bg-rose-500/10"}`}>
                <div className="flex gap-4">
                  <span className="text-emerald-600 font-semibold">✓ {csvResult.imported} imported</span>
                  {csvResult.failed > 0 && (
                    <span className="text-rose-500 font-semibold">✗ {csvResult.failed} failed</span>
                  )}
                </div>
                {csvResult.errors.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                    {csvResult.errors.slice(0, 5).map((e, i) => (
                      <p key={i}>Row {e.row}: {e.issues.join("; ")}</p>
                    ))}
                    {csvResult.errors.length > 5 && (
                      <p>…and {csvResult.errors.length - 5} more errors</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={resetCsvModal} className="rounded-xl">Cancel</Button>
              <Button
                size="sm"
                onClick={handleCsvUpload}
                disabled={!csvFile || csvUploading}
                className="rounded-xl gap-2"
              >
                {csvUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {csvUploading ? "Importing…" : "Import"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Delete Confirmation Modal
      ══════════════════════════════════════════════════════════════════════ */}
      {feedbackToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h2 className="font-semibold">Delete Feedback?</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  This will permanently delete this feedback record. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground line-clamp-3">
              {feedbackToDelete.content}
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setFeedbackToDelete(null)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => executeDeleteFeedback(feedbackToDelete.id)}
                disabled={deletingId === feedbackToDelete.id}
                className="rounded-xl gap-2"
              >
                {deletingId === feedbackToDelete.id && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Edit Modal
      ══════════════════════════════════════════════════════════════════════ */}
      {feedbackToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Edit Feedback</h2>
              <button onClick={() => setFeedbackToEdit(null)} className="rounded-lg p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Content */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Feedback Content *</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                  rows={3}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Channel */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Channel</label>
                  <select
                    value={editForm.channel}
                    onChange={(e) => setEditForm((f) => ({ ...f, channel: e.target.value as any }))}
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="WEBSITE">Website</option>
                    <option value="MOBILE_APP">Mobile App</option>
                    <option value="EMAIL">Email</option>
                    <option value="API">API</option>
                    <option value="CSV">CSV</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as any }))}
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="NEW">New</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="ACTIONED">Actioned</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="ANALYZED">Analyzed</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Sentiment */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Sentiment</label>
                  <select
                    value={editForm.sentiment}
                    onChange={(e) => setEditForm((f) => ({ ...f, sentiment: e.target.value as any }))}
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="POSITIVE">Positive</option>
                    <option value="NEUTRAL">Neutral</option>
                    <option value="NEGATIVE">Negative</option>
                  </select>
                </div>

                {/* Score */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Score (-1 to 1)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="-1"
                    max="1"
                    value={editForm.sentimentScore}
                    onChange={(e) => setEditForm((f) => ({ ...f, sentimentScore: e.target.value }))}
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Customer label */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Customer Label</label>
                <input
                  type="text"
                  value={editForm.customerLabel}
                  onChange={(e) => setEditForm((f) => ({ ...f, customerLabel: e.target.value }))}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {editError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">{editError}</div>
              )}

              <div className="flex gap-3 justify-end pt-1">
                <Button variant="outline" size="sm" type="button" onClick={() => setFeedbackToEdit(null)} className="rounded-xl">Cancel</Button>
                <Button size="sm" type="submit" disabled={savingEdit} className="rounded-xl gap-2">
                  {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

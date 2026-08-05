"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, MessageSquare } from "lucide-react";

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
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
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
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-1 text-primary" />
                  Loading feedback...
                </td>
              </tr>
            ) : feedbacks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

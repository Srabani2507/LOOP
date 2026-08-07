import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";

// Helper: get short month label "Jan", "Feb", etc.
function getMonthLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "short" });
}

// ---------------------------------------------------------------------------
// GET /api/dashboard/charts
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    // -----------------------------------------------------------------------
    // 1. Volume over time — last 6 months (by month)
    // -----------------------------------------------------------------------
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const allFeedback = await prisma.feedback.findMany({
      where: {
        workspaceId,
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
        sentiment: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Build a map of "YYYY-MM" → { volume, positive, negative, neutral }
    const monthMap = new Map<
      string,
      { month: string; volume: number; positive: number; negative: number; neutral: number }
    >();

    // Pre-fill the last 6 months so empty months still show
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, {
        month: getMonthLabel(d),
        volume: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
      });
    }

    allFeedback.forEach((f) => {
      const d = f.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthMap.get(key);
      if (!entry) return;
      entry.volume++;
      if (f.sentiment === "POSITIVE") entry.positive++;
      else if (f.sentiment === "NEGATIVE") entry.negative++;
      else if (f.sentiment === "NEUTRAL") entry.neutral++;
    });

    const chartData = Array.from(monthMap.values());

    // -----------------------------------------------------------------------
    // 2. Sentiment breakdown — pie chart data
    // -----------------------------------------------------------------------
    const [positive, negative, neutral, unclassified] = await Promise.all([
      prisma.feedback.count({ where: { workspaceId, sentiment: "POSITIVE" } }),
      prisma.feedback.count({ where: { workspaceId, sentiment: "NEGATIVE" } }),
      prisma.feedback.count({ where: { workspaceId, sentiment: "NEUTRAL" } }),
      prisma.feedback.count({ where: { workspaceId, sentiment: null } }),
    ]);

    const sentimentData = [
      { name: "Positive", value: positive, color: "#10b981" },
      { name: "Neutral", value: neutral, color: "#f59e0b" },
      { name: "Negative", value: negative, color: "#ef4444" },
      ...(unclassified > 0
        ? [{ name: "Unclassified", value: unclassified, color: "#94a3b8" }]
        : []),
    ].filter((d) => d.value > 0);

    // -----------------------------------------------------------------------
    // 3. Top themes — bar chart data (top 8 themes by feedback count)
    // -----------------------------------------------------------------------
    const topThemes = await prisma.theme.findMany({
      where: { workspaceId },
      orderBy: { feedbacks: { _count: "desc" } },
      take: 8,
      select: {
        name: true,
        color: true,
        _count: { select: { feedbacks: true } },
      },
    });

    const topThemesChart = topThemes.map((t) => ({
      name: t.name,
      count: t._count.feedbacks,
      color: t.color || "#6366f1",
    }));

    return NextResponse.json({
      chartData,
      sentimentData,
      topThemesChart,
    });
  } catch (error) {
    console.error("[dashboard/charts] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}

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
      { name: "Positive", value: positive, color: "#905690" },   // muted warm mauve   — HSL(300°,25%,45%) warm end
      { name: "Neutral",  value: neutral,  color: "#6a5a87" },   // muted purple-gray  — HSL(262°,20%,44%) mid
      { name: "Negative", value: negative, color: "#445a79" },   // muted steel-blue   — HSL(215°,28%,37%) cool end
      ...(unclassified > 0
        ? [{ name: "Unclassified", value: unclassified, color: "#7e8ba5" }]  // cool blue-gray
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

    // Distinct muted spectrum with clear lightness steps for better contrast
    const BRAND_THEME_COLORS = [
      '#4a306d', '#6b4c8a', '#8b6d9e', '#a37fa3', // Deep to soft purples/mauves
      '#38466b', '#50628a', '#6d7fa3', '#8496ab', // Deep to soft indigos/blue-grays
    ]

    const topThemesChart = topThemes.map((t, index) => ({
      name: t.name,
      count: t._count.feedbacks,
      color: BRAND_THEME_COLORS[index % BRAND_THEME_COLORS.length],
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

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";

// ---------------------------------------------------------------------------
// GET /api/dashboard/stats
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Run all counts in parallel
    const [
      totalFeedback,
      positiveFeedback,
      negativeFeedback,
      neutralFeedback,
      newThisWeek,
      aiProcessed,
      topThemes,
    ] = await Promise.all([
      prisma.feedback.count({ where: { workspaceId } }),
      prisma.feedback.count({ where: { workspaceId, sentiment: "POSITIVE" } }),
      prisma.feedback.count({ where: { workspaceId, sentiment: "NEGATIVE" } }),
      prisma.feedback.count({ where: { workspaceId, sentiment: "NEUTRAL" } }),
      prisma.feedback.count({
        where: { workspaceId, createdAt: { gte: oneWeekAgo } },
      }),
      prisma.feedback.count({
        where: { workspaceId, sentiment: { not: null } },
      }),
      // Top 6 themes by feedback count
      prisma.theme.findMany({
        where: { workspaceId },
        orderBy: { feedbacks: { _count: "desc" } },
        take: 6,
        select: {
          id: true,
          name: true,
          color: true,
          _count: { select: { feedbacks: true } },
        },
      }),
    ]);

    const percentNegative =
      totalFeedback > 0
        ? Math.round((negativeFeedback / totalFeedback) * 100)
        : 0;

    const themesData = topThemes.map((t) => ({
      theme: t.name,
      count: t._count.feedbacks,
      color: t.color || "#6366f1",
      trend: totalFeedback > 0
        ? Math.round((t._count.feedbacks / totalFeedback) * 100)
        : 0,
    }));

    return NextResponse.json({
      totalFeedback,
      positiveFeedback,
      negativeFeedback,
      neutralFeedback,
      newThisWeek,
      aiProcessed,
      percentNegative,
      topTheme: topThemes[0]?.name ?? "N/A",
      themesData,
    });
  } catch (error) {
    console.error("[dashboard/stats] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

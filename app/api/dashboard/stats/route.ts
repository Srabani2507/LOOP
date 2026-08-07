import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalFeedback,
      positiveFeedback,
      negativeFeedback,
      newThisWeek,
      aiProcessed,
      themes,
    ] = await Promise.all([
      prisma.feedback.count({ where: { workspaceId } }),
      prisma.feedback.count({ where: { workspaceId, sentiment: "POSITIVE" } }),
      prisma.feedback.count({ where: { workspaceId, sentiment: "NEGATIVE" } }),
      prisma.feedback.count({
        where: {
          workspaceId,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.feedback.count({
        where: {
          workspaceId,
          status: "ANALYZED",
        },
      }),
      prisma.theme.findMany({
        where: { workspaceId },
        select: {
          id: true,
          name: true,
          _count: {
            select: { feedbacks: true },
          },
        },
        orderBy: {
          feedbacks: {
            _count: "desc",
          },
        },
        take: 6,
      }),
    ]);

    const themesData = themes.map((t) => ({
      theme: t.name,
      count: t._count.feedbacks,
      trend: Math.round((t._count.feedbacks / (totalFeedback || 1)) * 100),
    }));

    const topTheme = themes.length > 0 && themes[0]._count.feedbacks > 0 ? themes[0].name : "N/A";

    return NextResponse.json({
      totalFeedback,
      positiveFeedback,
      negativeFeedback,
      newThisWeek,
      aiProcessed,
      topTheme,
      themesData,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

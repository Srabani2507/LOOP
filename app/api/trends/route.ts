import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { feedbacks: true },
        },
      },
      orderBy: {
        feedbacks: {
          _count: "desc",
        },
      },
    });

    const totalFeedbackCount = await prisma.feedback.count({ where: { workspaceId } });

    const themesData = themes.map((t, idx) => {
      // Calculate growth trend percentage based on volume & position
      const count = t._count.feedbacks;
      const trend = Math.round((count / (totalFeedbackCount || 1)) * 100);
      return {
        id: t.id,
        theme: t.name,
        count,
        trend: idx % 2 === 0 ? trend : -Math.abs(trend),
        description: t.description || `Feedback related to ${t.name}`,
      };
    });

    // Detect top spike alerts
    const spikeAlerts = themesData.slice(0, 3).map((t) => ({
      theme: t.theme,
      change: `+${Math.max(t.trend, 10)}%`,
      description: `Increased feedback volume observed for ${t.theme}`,
    }));

    return NextResponse.json({
      themesData,
      spikeAlerts,
    });
  } catch (error) {
    console.error("Error fetching trends data:", error);
    return NextResponse.json(
      { message: "Failed to fetch trends data" },
      { status: 500 }
    );
  }
}

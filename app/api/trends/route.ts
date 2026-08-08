/**
 * GET /api/trends
 * Returns theme volume data with REAL period-over-period spike detection.
 * Compares the last 7 days vs the prior 7 days for each theme.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    // All themes in workspace
    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        feedbacks: {
          select: {
            feedbackId: true,
            feedback: {
              select: { createdAt: true },
            },
          },
        },
      },
    });

    const themesData = themes
      .map((theme) => {
        const allLinks = theme.feedbacks;
        const totalCount = allLinks.length;

        // Current period: last 7 days
        const currentPeriodCount = allLinks.filter(
          (link) => link.feedback.createdAt >= sevenDaysAgo
        ).length;

        // Previous period: 7–14 days ago
        const previousPeriodCount = allLinks.filter(
          (link) =>
            link.feedback.createdAt >= fourteenDaysAgo &&
            link.feedback.createdAt < sevenDaysAgo
        ).length;

        // Spike: % change from previous → current period
        const trendPercent =
          previousPeriodCount === 0
            ? currentPeriodCount > 0
              ? 100
              : 0
            : Math.round(
                ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100
              );

        return {
          id: theme.id,
          theme: theme.name,
          color: theme.color,
          count: totalCount,
          currentPeriodCount,
          previousPeriodCount,
          trend: trendPercent,
          description: theme.description || `Feedback related to ${theme.name}`,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Spike alerts: themes with >20% growth week-over-week (real data)
    const spikeAlerts = themesData
      .filter((t) => t.trend >= 20 && t.currentPeriodCount > 0)
      .slice(0, 5)
      .map((t) => ({
        theme: t.theme,
        change: `+${t.trend}%`,
        description: `${t.currentPeriodCount} mentions in the last 7 days vs ${t.previousPeriodCount} in the prior week — up ${t.trend}% week-over-week.`,
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

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    // Fetch all feedback records for the workspace
    const feedbacks = await prisma.feedback.findMany({
      where: { workspaceId },
      select: {
        createdAt: true,
        sentiment: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap: Record<string, { volume: number; positive: number; negative: number; neutral: number }> = {};

    let totalPositive = 0;
    let totalNegative = 0;
    let totalNeutral = 0;

    feedbacks.forEach((item) => {
      const date = new Date(item.createdAt);
      const monthKey = monthNames[date.getMonth()];

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { volume: 0, positive: 0, negative: 0, neutral: 0 };
      }

      monthlyMap[monthKey].volume += 1;

      if (item.sentiment === "POSITIVE") {
        monthlyMap[monthKey].positive += 1;
        totalPositive += 1;
      } else if (item.sentiment === "NEGATIVE") {
        monthlyMap[monthKey].negative += 1;
        totalNegative += 1;
      } else {
        monthlyMap[monthKey].neutral += 1;
        totalNeutral += 1;
      }
    });

    const chartData = Object.keys(monthlyMap).map((month) => ({
      month,
      volume: monthlyMap[month].volume,
      positive: monthlyMap[month].positive,
      negative: monthlyMap[month].negative,
      neutral: monthlyMap[month].neutral,
    }));

    // Default last 6 months structure if database has fewer months
    const fallbackMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const finalChartData = chartData.length > 0 ? chartData : fallbackMonths.map((m) => ({
      month: m,
      volume: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
    }));

    const totalCount = feedbacks.length || 1;
    const sentimentData = [
      { name: "Positive", value: Math.round((totalPositive / totalCount) * 100), color: "var(--chart-2)" },
      { name: "Neutral", value: Math.round((totalNeutral / totalCount) * 100), color: "var(--chart-4)" },
      { name: "Negative", value: Math.round((totalNegative / totalCount) * 100), color: "var(--chart-3)" },
    ];

    return NextResponse.json({
      chartData: finalChartData,
      sentimentData,
    });
  } catch (error) {
    console.error("Error fetching dashboard charts data:", error);
    return NextResponse.json(
      { message: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}

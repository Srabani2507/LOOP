/**
 * GET /api/reports     — List all saved reports
 * POST /api/reports    — Generate a new AI-powered VoC report
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@/lib/generated/prisma/client";
import { generateVoCReport } from "@/lib/ai";

export async function GET() {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const reports = await prisma.report.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        generatedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ data: reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { message: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth([UserRole.ADMIN, UserRole.ANALYST]);
    if ("response" in authResult) return authResult.response;
    const { workspaceId, userId } = authResult.auth;

    const body = await request.json().catch(() => ({}));
    const title = body.title || "Voice of Customer Intelligence Digest";

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    const periodStart = body.periodStart ? new Date(body.periodStart) : thirtyDaysAgo;
    const periodEnd = body.periodEnd ? new Date(body.periodEnd) : now;

    // ── Pre-compute real statistics (model cannot hallucinate these) ──────────
    const [
      totalCount,
      positiveCount,
      negativeCount,
      neutralCount,
      prevNegCount,
      prevTotalCount,
      topThemes,
      representativeFeedback,
    ] = await Promise.all([
      // Current period
      prisma.feedback.count({ where: { workspaceId, createdAt: { gte: periodStart, lte: periodEnd } } }),
      prisma.feedback.count({ where: { workspaceId, sentiment: "POSITIVE", createdAt: { gte: periodStart, lte: periodEnd } } }),
      prisma.feedback.count({ where: { workspaceId, sentiment: "NEGATIVE", createdAt: { gte: periodStart, lte: periodEnd } } }),
      prisma.feedback.count({ where: { workspaceId, sentiment: "NEUTRAL", createdAt: { gte: periodStart, lte: periodEnd } } }),
      // Previous period (for sentiment delta)
      prisma.feedback.count({ where: { workspaceId, sentiment: "NEGATIVE", createdAt: { gte: sixtyDaysAgo, lte: thirtyDaysAgo } } }),
      prisma.feedback.count({ where: { workspaceId, createdAt: { gte: sixtyDaysAgo, lte: thirtyDaysAgo } } }),
      // Top themes
      prisma.theme.findMany({
        where: { workspaceId },
        select: {
          name: true,
          _count: { select: { feedbacks: true } },
        },
        orderBy: { feedbacks: { _count: "desc" } },
        take: 5,
      }),
      // Representative verbatim quotes (diverse sentiments)
      prisma.feedback.findMany({
        where: { workspaceId, createdAt: { gte: periodStart, lte: periodEnd } },
        select: { content: true, sentiment: true, channel: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    // Sentiment delta (% change in negativity rate)
    const prevNegRate = prevTotalCount > 0 ? (prevNegCount / prevTotalCount) * 100 : 0;
    const currNegRate = totalCount > 0 ? (negativeCount / totalCount) * 100 : 0;
    const sentimentDelta = Math.round(currNegRate - prevNegRate);

    const periodLabel = `${periodStart.toLocaleDateString()} – ${periodEnd.toLocaleDateString()}`;

    // ── Call AI to generate the narrative ────────────────────────────────────
    const narrative = await generateVoCReport({
      periodLabel,
      totalFeedback: totalCount,
      positiveCount,
      negativeCount,
      neutralCount,
      topThemes: topThemes.map((t) => ({ name: t.name, count: t._count.feedbacks })),
      sentimentDelta,
      representativeQuotes: representativeFeedback.map((f) => ({
        content: f.content,
        sentiment: f.sentiment?.toString() ?? "UNKNOWN",
        channel: f.channel?.toString() ?? "UNKNOWN",
      })),
    });

    const reportContent = {
      narrative,
      summary: narrative.slice(0, 280) + (narrative.length > 280 ? "…" : ""),
      metrics: {
        totalFeedback: totalCount,
        positiveCount,
        negativeCount,
        neutralCount,
        sentimentDelta,
      },
      topThemes: topThemes.map((t) => ({ name: t.name, count: t._count.feedbacks })),
      periodLabel,
      generatedWith: "Groq · GPT OSS 120B (openai/gpt-oss-120b)",
    };

    const report = await prisma.report.create({
      data: {
        title,
        periodStart,
        periodEnd,
        contentJson: reportContent,
        workspaceId,
        generatedById: userId,
      },
      include: {
        generatedBy: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { message: "Failed to generate report" },
      { status: 500 }
    );
  }
}

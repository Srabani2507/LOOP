import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@/lib/generated/prisma/client";

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
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const periodStart = body.periodStart ? new Date(body.periodStart) : thirtyDaysAgo;
    const periodEnd = body.periodEnd ? new Date(body.periodEnd) : now;

    // Aggregates for VoC report content
    const totalCount = await prisma.feedback.count({ where: { workspaceId } });
    const positiveCount = await prisma.feedback.count({ where: { workspaceId, sentiment: "POSITIVE" } });
    const negativeCount = await prisma.feedback.count({ where: { workspaceId, sentiment: "NEGATIVE" } });

    const reportContent = {
      summary: `Automated analysis across ${totalCount} feedback entries. Positive sentiment is at ${Math.round((positiveCount / (totalCount || 1)) * 100)}% and negative sentiment is at ${Math.round((negativeCount / (totalCount || 1)) * 100)}%.`,
      metrics: {
        totalFeedback: totalCount,
        positiveCount,
        negativeCount,
      },
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

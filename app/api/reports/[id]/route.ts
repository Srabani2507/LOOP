/**
 * GET /api/reports/[id]  — Fetch a single saved VoC report
 * Scoped to the authenticated user's workspace (tenant isolation).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const { id } = await params;

    const report = await prisma.report.findFirst({
      where: { id, workspaceId },
      include: {
        generatedBy: {
          select: { name: true, email: true },
        },
        workspace: {
          select: { name: true },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("[reports/[id]] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/[id]  — Delete a report (Admin only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { UserRole } = await import("@/lib/generated/prisma/client");
    const authResult = await requireAuth([UserRole.ADMIN]);
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const { id } = await params;

    const report = await prisma.report.findFirst({
      where: { id, workspaceId },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ message: "Report deleted" });
  } catch (error) {
    console.error("[reports/[id]] DELETE Error:", error);
    return NextResponse.json(
      { message: "Failed to delete report" },
      { status: 500 }
    );
  }
}

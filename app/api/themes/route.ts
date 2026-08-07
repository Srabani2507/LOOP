import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";

// ---------------------------------------------------------------------------
// GET /api/themes
// Returns all themes for the authenticated user's workspace
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        _count: {
          select: { feedbacks: true },
        },
      },
    });

    return NextResponse.json({
      data: themes.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        color: t.color,
        feedbackCount: t._count.feedbacks,
      })),
    });
  } catch (error) {
    console.error("[themes GET] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch themes" },
      { status: 500 }
    );
  }
}

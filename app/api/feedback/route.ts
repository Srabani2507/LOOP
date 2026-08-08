import { NextRequest, NextResponse } from "next/server";
import {
  FeedbackChannel,
  FeedbackStatus,
  Sentiment,
  UserRole,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";
import { CreateFeedbackSchema } from "@/lib/validators/feedback";
import { requireAuth } from "@/lib/rbac";
import { classifyFeedback } from "@/lib/ai";

// ─── Helper: deterministic color per theme name ───────────────────────────────
function generateThemeColor(name: string): string {
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
    "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── Background AI classification (fire-and-forget) ──────────────────────────
async function triggerClassification(feedbackId: string, content: string, workspaceId: string) {
  try {
    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
    });
    const themeNames = existingThemes.map((t) => t.name);

    const classification = await classifyFeedback(content, themeNames);
    if (!classification) return;

    await prisma.$transaction(async (tx) => {
      await tx.feedbackTheme.deleteMany({ where: { feedbackId } });

      await tx.feedback.update({
        where: { id: feedbackId },
        data: {
          sentiment: classification.sentiment as Sentiment,
          sentimentScore: classification.sentimentScore,
        },
      });

      for (const themeName of classification.themes) {
        if (!themeName?.trim()) continue;
        const theme = await tx.theme.upsert({
          where: { workspaceId_name: { workspaceId, name: themeName.trim() } },
          create: {
            name: themeName.trim(),
            description: `Auto-created by LOOP AI`,
            color: generateThemeColor(themeName),
            workspaceId,
          },
          update: {},
          select: { id: true },
        });
        await tx.feedbackTheme.create({
          data: {
            feedbackId,
            themeId: theme.id,
            confidence: Math.max(0, Math.min(1, (classification.sentimentScore + 1) / 2)),
          },
        });
      }
    });
  } catch (err) {
    console.error("[feedback POST] Background classification error:", err);
  }
}

// =========================
// GET /api/feedback
// =========================
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as FeedbackStatus | null;
    const sentiment = searchParams.get("sentiment") as Sentiment | null;
    const channel = searchParams.get("channel") as FeedbackChannel | null;
    const themeId = searchParams.get("themeId") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    const where: any = {
      workspaceId,
    };

    if (status) {
      where.status = status;
    }
    if (sentiment) {
      where.sentiment = sentiment;
    }
    if (channel) {
      where.channel = channel;
    }
    if (themeId) {
      where.themes = {
        some: { themeId },
      };
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }
    if (search) {
      where.OR = [
        {
          content: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customerLabel: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const total = await prisma.feedback.count({ where });

    const feedback = await prisma.feedback.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        content: true,
        channel: true,
        customerLabel: true,
        externalReference: true,
        sentiment: true,
        sentimentScore: true,
        status: true,
        createdAt: true,
        themes: {
          select: {
            confidence: true,
            theme: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: feedback,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { message: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// =========================
// POST /api/feedback
// =========================
export async function POST(request: NextRequest) {
  try {
    // Only ADMIN and ANALYST can create feedback
    const authResult = await requireAuth([UserRole.ADMIN, UserRole.ANALYST]);
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const body = await request.json();
    const result = CreateFeedbackSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      content,
      channel,
      customerLabel,
      externalReference,
      sentiment,
      sentimentScore,
      status,
    } = result.data;

    const feedback = await prisma.feedback.create({
      data: {
        content,
        channel,
        customerLabel,
        externalReference,
        workspaceId,
        sentiment,
        sentimentScore,
        status,
      },
      select: {
        id: true,
        content: true,
        channel: true,
        customerLabel: true,
        externalReference: true,
        sentiment: true,
        sentimentScore: true,
        status: true,
        createdAt: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Fire-and-forget: classify in the background, don't block the response
    triggerClassification(feedback.id, feedback.content, workspaceId).catch(() => {});

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { message: "Failed to create feedback" },
      { status: 500 }
    );
  }
}
/**
 * POST /api/feedback/[id]/classify
 * Manual re-classify a feedback item using Groq AI.
 * Accessible by ADMIN and ANALYST only.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";
import { classifyFeedback } from "@/lib/ai";
import { UserRole, Sentiment } from "@/lib/generated/prisma/client";

export async function POST(request: NextRequest, context: any) {
  try {
    const authResult = await requireAuth([UserRole.ADMIN, UserRole.ANALYST]);
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const params = await context.params;
    const id = params.id as string;

    // Verify feedback belongs to this workspace
    const feedback = await prisma.feedback.findFirst({
      where: { id, workspaceId },
      select: { id: true, content: true },
    });

    if (!feedback) {
      return NextResponse.json(
        { message: "Feedback not found in your workspace" },
        { status: 404 }
      );
    }

    // Fetch existing workspace themes to anchor the model
    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
    });
    const themeNames = existingThemes.map((t) => t.name);

    // Call Groq AI
    const classification = await classifyFeedback(feedback.content, themeNames);

    if (!classification) {
      return NextResponse.json(
        { message: "AI classification failed. Please try again." },
        { status: 502 }
      );
    }

    // Upsert themes and link to feedback inside a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Remove old theme links
      await tx.feedbackTheme.deleteMany({ where: { feedbackId: id } });

      // Update sentiment on the feedback record
      const updatedFeedback = await tx.feedback.update({
        where: { id },
        data: {
          sentiment: classification.sentiment as Sentiment,
          sentimentScore: classification.sentimentScore,
        },
        select: {
          id: true,
          content: true,
          channel: true,
          sentiment: true,
          sentimentScore: true,
          status: true,
          themes: {
            select: {
              confidence: true,
              theme: { select: { id: true, name: true, color: true } },
            },
          },
        },
      });

      // Upsert each classified theme and create FeedbackTheme links
      for (const themeName of classification.themes) {
        if (!themeName?.trim()) continue;

        const theme = await tx.theme.upsert({
          where: { workspaceId_name: { workspaceId, name: themeName.trim() } },
          create: {
            name: themeName.trim(),
            description: `Auto-created by LOOP AI for: ${themeName}`,
            color: generateThemeColor(themeName),
            workspaceId,
          },
          update: {},
          select: { id: true },
        });

        await tx.feedbackTheme.create({
          data: {
            feedbackId: id,
            themeId: theme.id,
            confidence: Math.max(0, Math.min(1, (classification.sentimentScore + 1) / 2)),
          },
        });
      }

      return updatedFeedback;
    });

    return NextResponse.json({
      ...updated,
      classification: {
        featureArea: classification.featureArea,
        rationale: classification.rationale,
        themes: classification.themes,
      },
    });
  } catch (err) {
    console.error("[classify] Error:", err);
    return NextResponse.json({ message: "Failed to classify feedback" }, { status: 500 });
  }
}

// ─── Deterministic color per theme name ──────────────────────────────────────
function generateThemeColor(name: string): string {
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
    "#eab308", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/**
 * POST /api/insights
 * Ask LOOP — grounded Q&A using Groq AI.
 * Retrieves relevant feedback, then answers using only that context.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { retrieveRelevantFeedback } from "@/lib/search";
import { answerQuestion } from "@/lib/ai";
import { z } from "zod";

const InsightsRequestSchema = z.object({
  question: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const body = await request.json();
    const parsed = InsightsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { question } = parsed.data;

    // Step 1: Retrieve relevant feedback (keyword-based RAG)
    const relevantFeedback = await retrieveRelevantFeedback(workspaceId, question, 12);

    // Step 2: Ask Groq to answer grounded in the retrieved context
    const aiAnswer = await answerQuestion(question, relevantFeedback);

    if (!aiAnswer) {
      return NextResponse.json(
        { message: "AI failed to generate an answer. Please try again." },
        { status: 502 }
      );
    }

    // Step 3: Resolve cited feedback items to include their content for the UI
    const citedItems = relevantFeedback.filter((f) =>
      aiAnswer.citedFeedbackIds.includes(f.id)
    );

    // Also include top retrieved items that weren't explicitly cited (for reference)
    const uncitedItems = relevantFeedback
      .filter((f) => !aiAnswer.citedFeedbackIds.includes(f.id))
      .slice(0, 4);

    return NextResponse.json({
      answer: aiAnswer.answer,
      sources: citedItems.map((f) => ({
        id: f.id,
        content: f.content,
        channel: f.channel,
        sentiment: f.sentiment,
        sentimentScore: f.sentimentScore,
        createdAt: f.createdAt,
        cited: true,
      })),
      related: uncitedItems.map((f) => ({
        id: f.id,
        content: f.content,
        channel: f.channel,
        sentiment: f.sentiment,
        cited: false,
      })),
      retrievedCount: relevantFeedback.length,
    });
  } catch (err) {
    console.error("[insights POST] Error:", err);
    return NextResponse.json({ message: "Failed to generate insight" }, { status: 500 });
  }
}

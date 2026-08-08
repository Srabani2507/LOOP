/**
 * lib/search.ts — Keyword-based semantic retrieval for Ask LOOP
 *
 * Since Groq does not provide a native embeddings endpoint, we use a
 * lightweight TF-IDF-style keyword scoring to rank feedback by relevance
 * to the user's question. This is fast, deterministic, and requires no
 * additional API keys or vector database extensions.
 *
 * Algorithm:
 *  1. Tokenise the question and all feedback content
 *  2. Score each feedback item by term-frequency overlap with the question tokens
 *  3. Return the top-K items, ordered by score (descending)
 */

import { prisma } from "@/lib/db";

// ─── Tokeniser ────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "up", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "can", "this", "that", "these", "those",
  "i", "me", "my", "we", "our", "you", "your", "it", "its", "what", "how",
  "why", "when", "where", "who", "which", "about", "as", "into",
]);

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

// ─── Scorer ───────────────────────────────────────────────────────────────────

function scoreFeedback(
  feedbackTokens: string[],
  questionTokens: string[],
  questionTokenSet: Set<string>
): number {
  let score = 0;
  const feedbackTokenSet = new Set(feedbackTokens);

  for (const qt of questionTokenSet) {
    if (feedbackTokenSet.has(qt)) score += 2; // exact match
  }

  // Partial-match bonus (substring)
  for (const ft of feedbackTokens) {
    for (const qt of questionTokenSet) {
      if (ft !== qt && (ft.includes(qt) || qt.includes(ft))) score += 1;
    }
  }

  return score;
}

// ─── Main retrieval function ──────────────────────────────────────────────────

export interface RetrievedFeedback {
  id: string;
  content: string;
  channel: string;
  sentiment: string | null;
  sentimentScore: number | null;
  createdAt: Date;
  score: number;
}

/**
 * Retrieve the top-K most relevant feedback items for a given question.
 * Queries the full workspace feedback list and ranks by keyword overlap.
 *
 * @param workspaceId  Scoped to this workspace (tenant isolation)
 * @param question     The user's plain-English question
 * @param topK         Number of results to return (default: 12)
 */
export async function retrieveRelevantFeedback(
  workspaceId: string,
  question: string,
  topK = 12
): Promise<RetrievedFeedback[]> {
  const questionTokens = tokenise(question);
  const questionTokenSet = new Set(questionTokens);

  if (questionTokens.length === 0) {
    // Return latest feedback if question is too generic
    const latest = await prisma.feedback.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: topK,
      select: {
        id: true,
        content: true,
        channel: true,
        sentiment: true,
        sentimentScore: true,
        createdAt: true,
      },
    });
    return latest.map((f) => ({
      ...f,
      sentiment: f.sentiment?.toString() ?? null,
      score: 0,
    }));
  }

  // Fetch recent feedback (cap at 500 to keep scoring fast)
  const allFeedback = await prisma.feedback.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      content: true,
      channel: true,
      sentiment: true,
      sentimentScore: true,
      createdAt: true,
    },
  });

  // Score each item
  const scored = allFeedback.map((f) => ({
    ...f,
    sentiment: f.sentiment?.toString() ?? null,
    score: scoreFeedback(tokenise(f.content), questionTokens, questionTokenSet),
  }));

  // Sort by score descending, then by recency for ties
  scored.sort((a, b) => b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime());

  // Return top-K (include any with score > 0, fall back to recency if all zero)
  const topScored = scored.filter((f) => f.score > 0).slice(0, topK);
  if (topScored.length < 3) {
    // Not enough matches — supplement with recent items
    const recent = scored.filter((f) => f.score === 0).slice(0, topK - topScored.length);
    return [...topScored, ...recent];
  }

  return topScored;
}

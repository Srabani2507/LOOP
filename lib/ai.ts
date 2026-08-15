/**
 * lib/ai.ts — LOOP AI Service Layer
 * Uses Groq's kimi-k2-instruct (120B OSS) for all AI features.
 * All calls are server-side only. Never import this in client components.
 */

import Groq from "groq-sdk";
import { z } from "zod";

// ─── Groq client ─────────────────────────────────────────────────────────────
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "missing_api_key",
});

// Use Groq's GPT OSS 120B
const MODEL = "openai/gpt-oss-120b";

// ─── Zod schemas for structured output validation ────────────────────────────

export const ClassificationSchema = z.object({
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).max(4),
  featureArea: z.string().max(60),
  rationale: z.string().max(200),
});

export type Classification = z.infer<typeof ClassificationSchema>;

export const InsightAnswerSchema = z.object({
  answer: z.string(),
  citedFeedbackIds: z.array(z.string()),
});

export type InsightAnswer = z.infer<typeof InsightAnswerSchema>;

// ─── Helper: strip markdown fences and parse JSON safely ─────────────────────
function parseJson<T>(raw: string, schema: z.ZodType<T>): T | null {
  // Strip ```json ... ``` fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    const result = schema.safeParse(parsed);
    if (result.success) return result.data;
    console.error("[ai.ts] Zod validation failed:", result.error.flatten());
    return null;
  } catch (e) {
    console.error("[ai.ts] JSON parse failed:", e, "\nRaw:", raw.slice(0, 300));
    return null;
  }
}

// ─── AI1: Auto-classification ────────────────────────────────────────────────
/**
 * Classify a piece of feedback. Returns structured classification or null on failure.
 * @param content  The raw feedback text
 * @param existingThemes  List of theme names already in the workspace (prevents hallucinating new ones)
 */
export async function classifyFeedback(
  content: string,
  existingThemes: string[]
): Promise<Classification | null> {
  const themesContext =
    existingThemes.length > 0
      ? `Use these existing theme names where applicable (do not invent new ones unless none fit): ${existingThemes.join(", ")}.`
      : "You may create new theme names if needed.";

  const prompt = `You are a customer feedback analyst. Classify the following feedback and return ONLY a JSON object (no markdown, no explanation).

${themesContext}

JSON schema to return:
{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "sentimentScore": number between -1.0 (most negative) and 1.0 (most positive),
  "themes": array of up to 4 relevant theme name strings,
  "featureArea": short label for the product area this feedback is about (e.g. "Onboarding", "Billing", "Performance"),
  "rationale": one sentence explaining the classification
}

Feedback to classify:
"${content.replace(/"/g, '\\"')}"

Return ONLY the JSON object:`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 400,
    });

    const raw = response.choices[0]?.message?.content ?? "";

    // First attempt
    const result = parseJson(raw, ClassificationSchema);
    if (result) return result;

    // Retry once with a stricter prompt
    const retryResponse = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: raw },
        {
          role: "user",
          content:
            "Your response was not valid JSON. Return ONLY the raw JSON object without any markdown or explanation.",
        },
      ],
      temperature: 0,
      max_tokens: 400,
    });

    const retryRaw = retryResponse.choices[0]?.message?.content ?? "";
    return parseJson(retryRaw, ClassificationSchema);
  } catch (err) {
    console.error("[ai.ts] classifyFeedback error:", err);
    return null;
  }
}

// ─── AI3: Grounded Q&A ───────────────────────────────────────────────────────
/**
 * Answer a plain-English question about customer feedback, grounded only in
 * the provided feedback context. Returns null if the model cannot answer.
 *
 * @param question  The user's plain-English question
 * @param feedbackContext  Array of relevant feedback items retrieved via search
 */
export async function answerQuestion(
  question: string,
  feedbackContext: Array<{
    id: string;
    content: string;
    channel: string;
    sentiment: string | null;
    createdAt: Date | string;
  }>
): Promise<InsightAnswer | null> {
  if (feedbackContext.length === 0) {
    return {
      answer:
        "I could not find any relevant feedback in your workspace to answer this question. Try ingesting more feedback first.",
      citedFeedbackIds: [],
    };
  }

  const contextBlock = feedbackContext
    .map(
      (f, i) =>
        `[${i + 1}] ID:${f.id} | Channel:${f.channel} | Sentiment:${f.sentiment ?? "UNKNOWN"} | Date:${new Date(f.createdAt).toLocaleDateString()}\n"${f.content}"`
    )
    .join("\n\n");

  const prompt = `You are LOOP, an AI assistant for a customer feedback intelligence platform. Answer the user's question using ONLY the feedback items provided below. 

IMPORTANT RULES:
1. Answer only from the provided feedback. Do not use outside knowledge or invent data.
2. If the provided feedback does not contain enough information to answer the question, say so clearly.
3. Cite the specific feedback items you used (by their ID).
4. Return a JSON object ONLY — no markdown, no explanation outside the JSON.

JSON schema to return:
{
  "answer": "Your answer grounded in the provided feedback (2-5 sentences, cite specific examples)",
  "citedFeedbackIds": ["id1", "id2", ...]
}

User question: "${question.replace(/"/g, '\\"')}"

Feedback context:
${contextBlock}

Return ONLY the JSON object:`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 600,
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const result = parseJson(raw, InsightAnswerSchema);
    if (result) return result;

    // Fallback: return the raw text as an answer without citations
    return {
      answer: raw.slice(0, 500) || "Unable to parse AI response.",
      citedFeedbackIds: [],
    };
  } catch (err) {
    console.error("[ai.ts] answerQuestion error:", err);
    return null;
  }
}

// ─── AI4: Voice-of-Customer report generation ────────────────────────────────
/**
 * Generate a narrative VoC report from pre-computed stats.
 * Pre-computing in code keeps figures accurate (model cannot hallucinate numbers).
 */
export async function generateVoCReport(stats: {
  periodLabel: string;
  totalFeedback: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  topThemes: Array<{ name: string; count: number }>;
  sentimentDelta: number; // % change in negative sentiment vs previous period
  representativeQuotes: Array<{ content: string; sentiment: string; channel: string }>;
}): Promise<string> {
  const {
    periodLabel,
    totalFeedback,
    positiveCount,
    negativeCount,
    neutralCount,
    topThemes,
    sentimentDelta,
    representativeQuotes,
  } = stats;

  const positivePct = Math.round((positiveCount / (totalFeedback || 1)) * 100);
  const negativePct = Math.round((negativeCount / (totalFeedback || 1)) * 100);

  const themesText = topThemes.map((t) => `- ${t.name}: ${t.count} mentions`).join("\n");
  const quotesText = representativeQuotes
    .slice(0, 4)
    .map((q) => `  • [${q.sentiment}/${q.channel}] "${q.content.slice(0, 150)}"`)
    .join("\n");

  const prompt = `You are a senior product analyst writing a Voice of Customer (VoC) report for leadership. Write a professional, concise report narrative (4-6 paragraphs) based ONLY on the statistics provided below. Do NOT invent additional data.

Period: ${periodLabel}
Total feedback received: ${totalFeedback}
Positive: ${positiveCount} (${positivePct}%)
Negative: ${negativeCount} (${negativePct}%)
Neutral: ${neutralCount}
Change in negative sentiment vs prior period: ${sentimentDelta > 0 ? `+${sentimentDelta}%` : `${sentimentDelta}%`}

Top themes:
${themesText}

Representative customer quotes:
${quotesText}

Write the report narrative now (no markdown headers, just flowing paragraphs). End with 2-3 concrete recommended actions for the product team:`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content ?? "Report generation failed.";
  } catch (err) {
    console.error("[ai.ts] generateVoCReport error:", err);
    return "AI report generation encountered an error. The statistics above summarise the period's feedback.";
  }
}

import { z } from "zod";
import {
  FeedbackChannel,
  FeedbackStatus,
  Sentiment,
} from "@/lib/generated/prisma/client";

export const CreateFeedbackSchema = z.object({
  content: z
    .string()
    .trim()
    .min(5, "Feedback must be at least 5 characters")
    .max(5000),

  channel: z.nativeEnum(FeedbackChannel),

  customerLabel: z.string().optional(),

  externalReference: z.string().optional(),

  sentiment: z.nativeEnum(Sentiment).optional(),

  sentimentScore: z.number().min(-1).max(1).optional(),

  status: z.nativeEnum(FeedbackStatus).optional(),
});

export type CreateFeedbackInput = z.infer<typeof CreateFeedbackSchema>;

export const UpdateFeedbackSchema = CreateFeedbackSchema.partial();

export type UpdateFeedbackInput = z.infer<typeof UpdateFeedbackSchema>;

// Used for server-side CSV row validation
export const CsvRowSchema = z.object({
  content: z
    .string()
    .trim()
    .min(5, "content must be at least 5 characters")
    .max(5000),
  channel: z.nativeEnum(FeedbackChannel),
  customer_label: z.string().optional(),
  created_at: z.string().optional(),
});

export type CsvRowInput = z.infer<typeof CsvRowSchema>;
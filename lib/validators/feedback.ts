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

  workspaceId: z.string().cuid(),

  sentiment: z.nativeEnum(Sentiment).optional(),

  sentimentScore: z.number().min(-1).max(1).optional(),

  status: z.nativeEnum(FeedbackStatus).optional(),
});

export type CreateFeedbackInput = z.infer<
  typeof CreateFeedbackSchema
>;

export const UpdateFeedbackSchema = CreateFeedbackSchema.partial().omit({
  workspaceId: true,
});

export type UpdateFeedbackInput = z.infer<
  typeof UpdateFeedbackSchema
>;
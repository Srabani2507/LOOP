import { z } from "zod";
import { UserRole } from "@/lib/generated/prisma/client";

export const CreateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100),

  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  password: z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100),

  workspaceId: z.string().cuid(),

  role: z.nativeEnum(UserRole).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
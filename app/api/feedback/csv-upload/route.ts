import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { z } from "zod";
import { FeedbackChannel, UserRole } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";

// ---------------------------------------------------------------------------
// Zod schema for a single CSV row
// ---------------------------------------------------------------------------
const CsvRowSchema = z.object({
  content: z
    .string()
    .trim()
    .min(5, "content must be at least 5 characters")
    .max(5000),
  channel: z.nativeEnum(FeedbackChannel),
  customer_label: z.string().optional(),
  created_at: z.string().optional(),
});

type ParsedRow = z.infer<typeof CsvRowSchema>;

// ---------------------------------------------------------------------------
// POST /api/feedback/csv-upload
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    // Only ADMIN or ANALYST can import
    const authResult = await requireAuth([UserRole.ADMIN, UserRole.ANALYST]);
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    // Parse multipart form
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "No file provided. Send a CSV file as `file` in form-data." },
        { status: 400 }
      );
    }

    const text = await (file as Blob).text();

    // Parse CSV with PapaParse
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
    });

    if (!parsed.data.length) {
      return NextResponse.json(
        { message: "CSV file is empty or has no data rows." },
        { status: 400 }
      );
    }

    // Validate rows
    const validRows: ParsedRow[] = [];
    const errors: Array<{ row: number; issues: string[] }> = [];

    parsed.data.forEach((raw, idx) => {
      const result = CsvRowSchema.safeParse(raw);
      if (result.success) {
        validRows.push(result.data);
      } else {
        errors.push({
          row: idx + 2, // 1-indexed + header row
          issues: result.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`),
        });
      }
    });

    // Batch insert valid rows
    let imported = 0;
    if (validRows.length > 0) {
      const result = await prisma.feedback.createMany({
        data: validRows.map((row) => ({
          content: row.content,
          channel: row.channel,
          customerLabel: row.customer_label || null,
          workspaceId,
          createdAt: row.created_at ? new Date(row.created_at) : undefined,
        })),
        skipDuplicates: true,
      });
      imported = result.count;
    }

    return NextResponse.json({
      imported,
      failed: errors.length,
      total: parsed.data.length,
      errors,
    });
  } catch (error) {
    console.error("[csv-upload] Error:", error);
    return NextResponse.json(
      { message: "Failed to process CSV file" },
      { status: 500 }
    );
  }
}

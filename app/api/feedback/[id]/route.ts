import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateFeedbackSchema } from "@/lib/validators/feedback";

// =========================
// PATCH /api/feedback/[id]
// =========================
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const id = params.id;

    const body = await request.json();
    const result = UpdateFeedbackSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Verify feedback exists before updating
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { message: "Feedback not found" },
        { status: 404 }
      );
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: result.data,
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

    return NextResponse.json(updatedFeedback, { status: 200 });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { message: "Failed to update feedback" },
      { status: 500 }
    );
  }
}

// =========================
// DELETE /api/feedback/[id]
// =========================
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const id = params.id;

    // Verify feedback exists before deleting
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { message: "Feedback not found" },
        { status: 404 }
      );
    }

    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Feedback deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { message: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}

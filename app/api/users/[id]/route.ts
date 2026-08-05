import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/rbac";
import { UserRole } from "@/lib/generated/prisma/client";
import { z } from "zod";

const UpdateRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

// PATCH /api/users/[id] - Update member role (ADMIN only)
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const authResult = await requireAuth([UserRole.ADMIN]);
    if ("response" in authResult) return authResult.response;
    const { workspaceId, userId: currentUserId } = authResult.auth;

    const params = await context.params;
    const targetUserId = params.id;

    const body = await request.json();
    const result = UpdateRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Verify user belongs to same workspace
    const targetUser = await prisma.user.findFirst({
      where: { id: targetUserId, workspaceId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: "Member not found in your workspace" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: result.data.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { message: "Failed to update member role" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Remove member from workspace (ADMIN only)
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const authResult = await requireAuth([UserRole.ADMIN]);
    if ("response" in authResult) return authResult.response;
    const { workspaceId, userId: currentUserId } = authResult.auth;

    const params = await context.params;
    const targetUserId = params.id;

    if (targetUserId === currentUserId) {
      return NextResponse.json(
        { message: "You cannot remove yourself from the workspace" },
        { status: 400 }
      );
    }

    // Verify user belongs to same workspace
    const targetUser = await prisma.user.findFirst({
      where: { id: targetUserId, workspaceId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: "Member not found in your workspace" },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json(
      { message: "Member removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Failed to remove member" },
      { status: 500 }
    );
  }
}

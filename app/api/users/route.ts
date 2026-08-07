import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/client";
import { CreateUserSchema } from "@/lib/validators/user";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/rbac";

// GET /api/users - Fetch members of current workspace
export async function GET() {
  try {
    const authResult = await requireAuth();
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const users = await prisma.user.findMany({
      where: {
        workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Add member to workspace (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth([UserRole.ADMIN]);
    if ("response" in authResult) return authResult.response;
    const { workspaceId } = authResult.auth;

    const body = await request.json();
    const result = CreateUserSchema.safeParse({
      ...body,
      workspaceId: body.workspaceId || workspaceId,
    });

    if (!result.success) {
      const formattedErrors = result.error.issues.map((e) => `${e.path.map(String).join(".")}: ${e.message}`).join(", ");
      return NextResponse.json(
        {
          message: `Validation failed (${formattedErrors})`,
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, email, password, role } = result.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email already exists anywhere
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: role ?? UserRole.VIEWER,
        workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}
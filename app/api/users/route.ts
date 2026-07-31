import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/client";
import { CreateUserSchema } from "@/lib/validators/user";
import bcrypt from "bcryptjs";

// GET /api/users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        workspace: true,
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

// POST /api/users
export async function POST(request: NextRequest) {
  try {
        const body = await request.json();

        const result = CreateUserSchema.safeParse(body);

        if (!result.success) {
        return NextResponse.json(
            {
            message: "Validation failed",
        errors: result.error.flatten(),
        },
        { status: 400 }
    );
    }

    const { name, email, password, workspaceId, role } = result.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
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
  include: {
    workspace: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspace: user.workspace,
        createdAt: user.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}
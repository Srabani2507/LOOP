import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const workspaces = await prisma.workspace.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(workspaces);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const workspace = await prisma.workspace.create({
    data: {
      name: body.name,
    },
  });

  return NextResponse.json(workspace, { status: 201 });
}
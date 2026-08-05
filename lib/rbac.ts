import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/generated/prisma/client";

export interface AuthContext {
  userId: string;
  workspaceId: string;
  role: UserRole;
  email: string;
  name: string;
}

export async function getAuthSession(): Promise<AuthContext | null> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return null;
  }

  const user = session.user as any;
  if (!user.id || !user.workspaceId || !user.role) {
    return null;
  }

  return {
    userId: user.id,
    workspaceId: user.workspaceId,
    role: user.role as UserRole,
    email: user.email ?? "",
    name: user.name ?? "",
  };
}

export async function requireAuth(
  allowedRoles?: UserRole[]
): Promise<{ auth: AuthContext } | { response: NextResponse }> {
  const auth = await getAuthSession();

  if (!auth) {
    return {
      response: NextResponse.json(
        { message: "Unauthorized: Access token missing or invalid" },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(auth.role)) {
      return {
        response: NextResponse.json(
          { message: "Forbidden: You do not have sufficient permissions" },
          { status: 403 }
        ),
      };
    }
  }

  return { auth };
}

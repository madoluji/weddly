import { NextRequest, NextResponse } from "next/server";

type AdminRole = "useradmin" | "superadmin";

export type AuthenticatedUser = {
  id?: string;
  _id?: string;
  email?: string;
  role?: string;
};

type AdminAuthorizationResult = {
  user: AuthenticatedUser | null;
  response: NextResponse | null;
};

export const authorizeAdminRequest = (
  req: NextRequest,
  allowedRoles: AdminRole[] = ["useradmin", "superadmin"]
): AdminAuthorizationResult => {
  const userHeader = req.headers.get("user");

  if (!userHeader) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Unauthorized: User header is missing" },
        { status: 401 }
      ),
    };
  }

  try {
    const user = JSON.parse(userHeader) as AuthenticatedUser;
    const role = typeof user.role === "string" ? user.role.toLowerCase() : "";

    if (!allowedRoles.includes(role as AdminRole)) {
      return {
        user,
        response: NextResponse.json(
          { error: "Unauthorized: Admin role required" },
          { status: 403 }
        ),
      };
    }

    return { user, response: null };
  } catch {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Unauthorized: Invalid user header" },
        { status: 401 }
      ),
    };
  }
};
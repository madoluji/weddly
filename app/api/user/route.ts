import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import User from "@/models/user";
import { connectMongoDB } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_SAFE_FIELDS = [
    "_id",
    "name",
    "lastName",
    "email",
    "roles",
    "profilePicture",
    "country",
    "city",
    "phone",
    "emailVerified",
    "kycVerified",
    "zipPostalCode",
    "createdAt",
    "dob",
] as const;

export async function GET(req: NextRequest) {
    try {
        await connectMongoDB();

        // ✅ Get the session
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const isAdmin = session.user.role === "admin";

        // ✅ Parse query parameters
        const url = new URL(req.url);
        const queryFields = url.searchParams.get("fields"); // e.g., "email,profilePicture"
        const userIdParam = url.searchParams.get("userId"); // e.g., "12345"

        // ✅ Define restricted fields that should NEVER be exposed
        const restrictedFields = ["password", "__v", "internalNotes"];

        // ✅ Build allowlist for response fields
        const allowedFields = queryFields
            ? queryFields
                  .split(",")
                  .map((field) => field.trim())
                  .filter((field) => field.length > 0 && !restrictedFields.includes(field))
            : [...DEFAULT_SAFE_FIELDS];

        if (allowedFields.length === 0) {
            return NextResponse.json({ message: "No valid fields selected" }, { status: 400 });
        }

        // ✅ If userId is provided in the query parameter, allow only admins to override
        const userId = isAdmin && userIdParam ? userIdParam : session.user.id;

        const user = await User.findOne({ _id: userId })
            .select("-password -internalNotes")
            .lean<Record<string, unknown>>();

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Return only explicitly allowed fields, while always preserving _id for compatibility.
        const responsePayload: Record<string, unknown> = {};
        if (user._id !== undefined) {
            responsePayload._id = user._id;
        }
        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(user, field)) {
                responsePayload[field] = user[field];
            }
        }

        return NextResponse.json(responsePayload, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ message: "Error fetching user", error }, { status: 500 });
    }
}

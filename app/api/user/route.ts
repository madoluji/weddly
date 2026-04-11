import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import User from "@/models/user";
import ClientInfo from "@/models/clientinfo";
import FreelancerInfo from "@/models/freelancerInfo";
import Jobs from "@/models/jobs";
import { connectMongoDB } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

type UserPatchBody = {
    name?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    streetAddress?: string;
    zipPostalCode?: string;
    dob?: string;
    profilePicture?: string;
    profileVisible?: boolean;
};

const DEFAULT_SAFE_FIELDS = [
    "_id",
    "name",
    "lastName",
    "email",
    "roles",
    "profilePicture",
    "streetAddress",
    "state",
    "profileVisible",
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
        const projection = Array.from(new Set(["_id", ...allowedFields])).join(" ");

        const user = await User.findOne({ _id: userId })
            .select(projection)
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

export async function PATCH(req: NextRequest) {
    try {
        await connectMongoDB();

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body: UserPatchBody = await req.json();
        const updateData: Record<string, unknown> = {};

        if (typeof body.name === "string") {
            const trimmed = body.name.trim();
            if (!trimmed) {
                return NextResponse.json({ message: "Name cannot be empty" }, { status: 400 });
            }
            updateData.name = trimmed;
        }

        if (typeof body.lastName === "string") {
            updateData.lastName = body.lastName.trim();
        }

        if (typeof body.email === "string") {
            const normalizedEmail = body.email.trim().toLowerCase();
            if (!normalizedEmail) {
                return NextResponse.json({ message: "Email cannot be empty" }, { status: 400 });
            }

            const existing = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: session.user.id },
            })
                .select("_id")
                .lean();

            if (existing) {
                return NextResponse.json({ message: "Email is already in use" }, { status: 409 });
            }

            updateData.email = normalizedEmail;
        }

        if (typeof body.phone === "string") updateData.phone = body.phone.trim();
        if (typeof body.country === "string") updateData.country = body.country.trim();
        if (typeof body.state === "string") updateData.state = body.state.trim();
        if (typeof body.city === "string") updateData.city = body.city.trim();
        if (typeof body.streetAddress === "string") updateData.streetAddress = body.streetAddress.trim();
        if (typeof body.zipPostalCode === "string") updateData.zipPostalCode = body.zipPostalCode.trim();
        if (typeof body.dob === "string") updateData.dob = body.dob.trim();
        if (typeof body.profilePicture === "string") updateData.profilePicture = body.profilePicture.trim();
        if (typeof body.profileVisible === "boolean") updateData.profileVisible = body.profileVisible;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "No valid fields provided" }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .select("-password -internalNotes")
            .lean<Record<string, unknown>>();

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const shouldSyncPublicProfileFields =
            typeof body.name === "string" ||
            typeof body.lastName === "string" ||
            typeof body.email === "string";

        if (shouldSyncPublicProfileFields) {
            const firstName = typeof updatedUser.name === "string" ? updatedUser.name : "";
            const lastName = typeof updatedUser.lastName === "string" ? updatedUser.lastName : "";
            const fullName = `${firstName} ${lastName}`.trim();
            const syncedEmail = typeof updatedUser.email === "string" ? updatedUser.email : undefined;

            const profileSyncUpdate: Record<string, unknown> = {};
            if (fullName) profileSyncUpdate.fullName = fullName;
            if (syncedEmail) profileSyncUpdate.email = syncedEmail;

            if (Object.keys(profileSyncUpdate).length > 0) {
                await Promise.all([
                    FreelancerInfo.updateOne({ userId: session.user.id }, { $set: profileSyncUpdate }),
                    ClientInfo.updateOne({ userId: session.user.id }, { $set: { fullName } }),
                    Jobs.updateMany({ userId: session.user.id }, { $set: { fullName } }),
                ]);
            }
        }

        return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return NextResponse.json({ message: "Error updating profile", error }, { status: 500 });
    }
}

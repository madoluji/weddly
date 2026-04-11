import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import Admin from "@/models/admin";

export async function POST(req: NextRequest) {
    const userData = req.headers.get("user");
    const user = userData ? JSON.parse(userData) : null;
    const role = typeof user?.role === "string" ? user.role.toLowerCase() : "";

    if (!user || !(user.id || user._id)) {
        return NextResponse.json({ message: "Unauthorized: Missing user context" }, { status: 401 });
    }

    try {
        const { profilePicture } = await req.json();
        if (!profilePicture || typeof profilePicture !== "string") {
            return NextResponse.json({ message: "Invalid profilePicture payload" }, { status: 400 });
        }

        await connectMongoDB();
        const targetId = user.id || user._id;

        if (role === "user") {
            const updateResult = await User.updateOne({ _id: targetId }, { $set: { profilePicture } });
            if (updateResult.modifiedCount === 0) {
                return NextResponse.json({ message: "No document updated" }, { status: 400 });
            }

        };
        if (role === "useradmin" || role === "superadmin") {
            const updateResult = await Admin.updateOne({ _id: targetId }, { $set: { profilePicture } });
            if (updateResult.modifiedCount === 0) {
                return NextResponse.json({ message: "No document updated" }, { status: 400 });
            }
        };

        if (role !== "user" && role !== "useradmin" && role !== "superadmin") {
            return NextResponse.json({ message: "Forbidden: Unsupported role" }, { status: 403 });
        }

        return NextResponse.json({ message: "successful" }, { status: 200 });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        return NextResponse.json({ message: "failed" }, { status: 500 });
    }
}

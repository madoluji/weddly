import { NextApiRequest, NextApiResponse } from "next";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Admin from "@/models/admin";

export async function POST(req: NextRequest, res: NextResponse) {
    const session = await getServerSession();
    const userData = req.headers.get("user");
    const user = userData ? JSON.parse(userData) : null;
    const role = session?.user.role;

    console.log("Session Data:", session);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { profilePicture } = await req.json();

        connectMongoDB();

        if (role === "user") {
            const updateResult = await User.updateOne({ _id: user.id }, { $set: { profilePicture: profilePicture } });
            if (updateResult.modifiedCount === 0) {
                return NextResponse.json({ message: "No document updated" }, { status: 400 });
            }

        };
        if (role === "admin") {
            const updateResult = await Admin.updateOne({ _id: user.id }, { $set: { profilePicture: profilePicture } });
            if (updateResult.modifiedCount === 0) {
                return NextResponse.json({ message: "No document updated" }, { status: 400 });
            }
        };

        return NextResponse.json({ message: "successful" }, { status: 200 });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        return NextResponse.json({ message: "failed" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/lib/auth";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { message: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.oauth) {
      if (!currentPassword || typeof currentPassword !== "string") {
        return NextResponse.json(
          { message: "Current password is required." },
          { status: 400 }
        );
      }

      const matches = await bcrypt.compare(currentPassword, user.password || "");
      if (!matches) {
        return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.oauth = false;
    await user.save();

    return NextResponse.json({ message: "Password changed successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

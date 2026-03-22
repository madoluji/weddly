import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user";

export async function POST(req: NextRequest) {
  try {
    const { userId, name, bio, profilePicture } = await req.json();

    await connectMongoDB();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name, bio, profilePicture } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    return NextResponse.json({ message: "Error updating profile", error }, { status: 500 });
  }
}

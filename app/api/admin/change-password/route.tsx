import { connectMongoDB } from "@/app/lib/mongodb";
import Admin from "@/models/admin";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  await connectMongoDB();

  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { currentPassword, newPassword } = body;
  const userString = req.headers.get("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user || !user.id) {
    return NextResponse.json(
      { message: "Unauthorized: No user data" },
      { status: 401 }
    );
  }

  try {
    const admin = await Admin.findOne({ userName: user?.email });
    if (!admin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Admin.updateOne(
      { _id: admin._id },
      {
        $set: { password: hashedPassword },
        $unset: { isFirstLogin: "" },
      }
    );

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { message: "Error changing password" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import User from "@/models/user";

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim() || "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { exists: false, message: "Invalid email address" },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();
    const existingUser = await User.findOne({ email }).select("_id oauth");
    return NextResponse.json({
      exists: Boolean(existingUser),
      isOAuth: existingUser?.oauth === true,
    });
  } catch (error) {
    console.error("Error checking email existence:", error);
    return NextResponse.json(
      { exists: false, message: "Unable to verify email at this time." },
      { status: 500 }
    );
  }
}

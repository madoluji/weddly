import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import Contract from "@/models/contract";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId"); // Get userId from query parameters

  // Check if user is authenticated
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Validate userId
  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB(); // Connect to MongoDB

    // Count active and completed contracts separately
    const activeCount = await Contract.countDocuments({
      $or: [{ clientId: userId }, { freelancerId: userId }],
      status: "active",
    });

    const completeCount = await Contract.countDocuments({
      $or: [{ clientId: userId }, { freelancerId: userId }],
      status: "completed",
    });

    return NextResponse.json({ activeCount, completeCount });
  } catch (error) {
    console.error("Error fetching contract data:", error);
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

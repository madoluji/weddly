import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { getCacheValue, setCacheValue } from "@/app/lib/serverCache";

const VERIFICATION_STATUS_TTL_MS = 60 * 1000;

export async function GET() {
  const session = await getServerSession(authOptions);
  const id = session?.user.id;
  try {
    await connectMongoDB();

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `verification-status:${id}`;
    const cached = getCacheValue<{ emailVerified: boolean; kycVerified: boolean }>(
      cacheKey
    );

    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
          "X-Cache": "HIT",
        },
      });
    }

    const user = await User.findById(id)
      .select("emailVerified kycVerified")
      .lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const payload = {
      emailVerified: user.emailVerified,
      kycVerified: user.kycVerified,
    };

    setCacheValue(cacheKey, payload, VERIFICATION_STATUS_TTL_MS);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error fetching verification status:", error);
    return NextResponse.json(
      { message: "Error fetching verification status" },
      { status: 500 }
    );
  }
}

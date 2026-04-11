import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { getCacheValue, setCacheValue } from "@/app/lib/serverCache";

const VERIFICATION_STATUS_TTL_MS = 60 * 1000;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const id = session?.user.id;
  const searchParams = new URL(req.url).searchParams;
  const bypassCache = searchParams.has("t"); // If 't' parameter exists, bypass cache
  
  try {
    await connectMongoDB();

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const cacheKey = `verification-status:${id}`;
    
    // Only use cache if not bypassing
    if (!bypassCache) {
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
    } else {
      console.log("📝 Bypassing cache for verification status due to cache buster");
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

    // Update cache
    setCacheValue(cacheKey, payload, VERIFICATION_STATUS_TTL_MS);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        "X-Cache": bypassCache ? "MISS (cache busted)" : "MISS",
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

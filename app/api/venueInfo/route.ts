import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import { NextRequest } from "next/server";
import VenueInfo from "@/models/venueInfo";
import User from "@/models/user";

interface VenueRequestBody {
  userId: string;
  venueName: string;
  location: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, venueName, location }: VenueRequestBody = await req.json();

    await connectMongoDB();

    // Save or update the venue data (upsert handles re-submissions)
    await VenueInfo.findOneAndUpdate(
      { userId },
      { venueName, location },
      { upsert: true, new: true, runValidators: true }
    );

    // Update the user role to venue
    await User.updateOne({ _id: userId }, { $set: { "roles.venue": true } });

    return NextResponse.json(
      {
        message: "Venue Registered Successfully",
        data: { userId, venueName, location },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("VenueInfo API Error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const venue = await VenueInfo.findOne({ userId });

    if (!venue) {
      return NextResponse.json(
        { message: "Venue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ venue }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

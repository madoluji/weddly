import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/lib/auth";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user";
import ClientInfo from "@/models/clientinfo";
import FreelancerInfo from "@/models/freelancerInfo";
import VenueInfo from "@/models/venueInfo";
import VerificationToken from "@/models/token";

export async function DELETE(req: NextRequest) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { confirmationText, currentPassword } = await req.json();

    if (confirmationText !== "DELETE") {
      return NextResponse.json(
        { message: "Type DELETE to confirm account deletion." },
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

    await Promise.all([
      ClientInfo.deleteOne({ userId: session.user.id }),
      FreelancerInfo.deleteOne({ userId: session.user.id }),
      VenueInfo.deleteOne({ userId: session.user.id }),
      VerificationToken.deleteMany({ email: session.user.email }),
      User.deleteOne({ _id: session.user.id }),
    ]);

    return NextResponse.json({ message: "Account deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

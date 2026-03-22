import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { adminAuth } from "@/app/lib/firebaseAdmin";

// Named export for the GET method
export async function GET(req: NextRequest) {
    try {
        // Get the session using NextAuth's getServerSession
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { user } = session;

        if (!user || !user.email) {
            return NextResponse.json({ message: "User email is missing in the session" }, { status: 400 });
        }

        // Create a Firebase custom token using the user's email or unique ID
        const customToken = await adminAuth.createCustomToken(user.id);

        return NextResponse.json({ token: customToken }, { status: 200 });
    } catch (error) {
        console.error("Error creating custom token:", error);
        return NextResponse.json({ message: "Error creating custom token" }, { status: 500 });
    }
}

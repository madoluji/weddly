import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import User from "@/models/user";
import { connectMongoDB } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectMongoDB();

        // ✅ Get the session
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // ✅ Parse query parameters
        const url = new URL(req.url);
        const queryFields = url.searchParams.get("fields"); // e.g., "email,profilePicture"
        const userIdParam = url.searchParams.get("userId"); // e.g., "12345"

        // ✅ Define restricted fields that should NEVER be exposed
        const restrictedFields = ["password", "__v"];

        // ✅ Convert query into MongoDB select object
        let selectedFields = {};
        if (queryFields) {
            const fieldsArray = queryFields.split(",").map(field => field.trim());

            // ✅ Remove any restricted fields from selection
            const safeFields = fieldsArray.filter(field => !restrictedFields.includes(field));

            if (safeFields.length === 0) {
                return NextResponse.json({ message: "No valid fields selected" }, { status: 400 });
            }

            selectedFields = safeFields.reduce((acc, field) => {
                acc[field] = 1;
                return acc;
            }, {} as Record<string, number>);
        } else {
            // ✅ If no fields are specified, return safe default fields
            selectedFields = {
                _id: 1,
                name: 1,
                lastName: 1,
                email: 1,
                roles: 1,
                profilePicture: 1,
                country: 1,
                city: 1,
                phone: 1,
                emailVerified: 1,
                kycVerified: 1,
                zipPostalCode: 1,
                createdAt: 1,
                dob: 1,
            };
        }

        // ✅ If userId is provided in the query parameter, fetch user based on userId
        const userId = userIdParam || session.user.id;  // Default to session email if userId not provided

        const user = await User.findOne({ _id: userId }).select(selectedFields);

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ message: "Error fetching user", error }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb"; // Import MongoDB connection utility
import Admin from "@/models/admin"; // Import Admin model


export async function PATCH(req: NextRequest) {
    try {


        // Extract adminId from request body
        const { adminId } = await req.json();
        if (!adminId) {
            return NextResponse.json(
                { error: "Admin ID is required" },
                { status: 400 }
            );
        }

        // Connect to MongoDB
        await connectMongoDB();

        // Check if the target admin exists
        const adminToPromote = await Admin.findOne({ _id: adminId });
        if (!adminToPromote) {
            return NextResponse.json({ error: "Admin not found" }, { status: 404 });
        }

        // Check if already a superadmin
        if (adminToPromote.role === "superadmin") {
            return NextResponse.json(
                { error: "Admin is already a superadmin" },
                { status: 400 }
            );
        }

        // Update the role to superadmin
        await Admin.updateOne({ _id: adminId }, { $set: { role: "superadmin" } });

        return NextResponse.json(
            { message: "Admin successfully promoted to superadmin" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error promoting admin:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb"; // Import your DB connection utility
import Admin from "@/models/admin";


export async function DELETE(req: NextRequest) {
    try {
        // Authenticate the user
        const userHeader = req.headers.get("user");
        if (!userHeader) {
            return NextResponse.json(
                { error: "Unauthorized: User header is missing" },
                { status: 401 }
            );
        }
        const user = JSON.parse(userHeader);
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized: Authentication required" },
                { status: 401 }
            );
        }
        // Connect to MongoDB
        await connectMongoDB();

        // Extract adminId from query parameters

        const { searchParams } = new URL(req.url);
        if (searchParams) {
            const adminId = searchParams.get("adminId");
            if (!adminId) {
                return NextResponse.json(
                    { error: "Admin ID is required" },
                    { status: 400 }
                );
            }
            const count = await Admin.deleteOne({ _id: adminId });
            if (count.deletedCount === 0) {
                return NextResponse.json({ error: "Admin not found" }, { status: 404 });
            }
            return NextResponse.json({ message: "Admin account deleted successfully" }, { status: 200 });

        } else {
            const count = await Admin.deleteOne({ _id: user.id });
            if (count.deletedCount === 0) {
                return NextResponse.json({ error: "Admin not found" }, { status: 404 });
            }

            return NextResponse.json({ message: "Admin account deleted successfully" }, { status: 200 });
        }
    }
    catch (error) {
        console.error("Error deleting admin account:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

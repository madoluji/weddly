import { NextRequest, NextResponse } from "next/server";
import KYC from "@/models/kyc";
import { connectMongoDB } from "@/app/lib/mongodb";

export async function GET(req: NextRequest) {
    await connectMongoDB();

    try {
        // Extract query parameters
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status"); // e.g., "approved", "rejected", "pending"
        const search = searchParams.get("search"); // New search parameter

        // Define filter condition
        const filter: any = {};

        // Add status filter if provided and valid
        if (status && ["approved", "rejected", "pending"].includes(status)) {
            filter.status = status;
        }

        // Add search filter if provided
        if (search) {
            filter.fullName = { $regex: new RegExp(search, "i") }; // Case-insensitive search on fullName
        }

        // Fetch KYC data based on filter
        const kycs = await KYC.find(filter);


        return NextResponse.json(kycs, { status: 200 });

    } catch (error) {
        console.error("Error fetching KYC data:", error);
        return NextResponse.json({ message: "Error fetching KYC data" }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from "next/server";
import KYC from "@/models/kyc";
import { connectMongoDB } from "@/app/lib/mongodb";

export async function POST(req: NextRequest) {

    const data = await req.json();
    await connectMongoDB();

    try {
        await KYC.create(data);
        return NextResponse.json({ message: "KYC Submitted!" }, { status: 200 });
    } catch (error) {
        console.error("Error submitting KYC:", error);
        return NextResponse.json({ message: "Error submitting KYC" }, { status: 500 });
    }
}
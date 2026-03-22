import { connectMongoDB } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import User from "../../../../models/user";
import KYC from "@/models/kyc";





export async function GET() {
  try {
    await connectMongoDB();

    const totalUsers = await User.countDocuments();
    const freelancers = await User.countDocuments({ "roles.freelancer": true });
    const clients = await User.countDocuments({ "roles.client": true });
    const totalKyc = await KYC.countDocuments();
    const approvedKyc = await KYC.countDocuments({ status: 'approved' });
    const pendingKyc = await KYC.countDocuments({ status: 'pending' });
    const rejectedKyc = await KYC.countDocuments({ status: 'rejected' });



    return NextResponse.json({ totalUsers, freelancers, clients, totalKyc, approvedKyc, pendingKyc, rejectedKyc });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

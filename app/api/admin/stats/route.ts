import { connectMongoDB } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import User from "../../../../models/user";
import KYC from "@/models/kyc";





export async function GET() {
  try {
    await connectMongoDB();

    const [
      totalUsers,
      freelancers,
      clients,
      venues,
      totalKyc,
      approvedKyc,
      pendingKyc,
      rejectedKyc,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ "roles.freelancer": true }),
      User.countDocuments({ "roles.client": true }),
      User.countDocuments({ "roles.venue": true }),
      KYC.countDocuments(),
      KYC.countDocuments({ status: 'approved' }),
      KYC.countDocuments({ status: 'pending' }),
      KYC.countDocuments({ status: 'rejected' }),
    ]);

    return NextResponse.json({ totalUsers, freelancers, clients, venues, totalKyc, approvedKyc, pendingKyc, rejectedKyc });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

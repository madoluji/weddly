import Jobs from "@/models/jobs";
import { connectMongoDB } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongoDB();
  const jobs = await Jobs.find({});
  return NextResponse.json({
    count: jobs.length,
    jobs: jobs.map(j => ({
      _id: j._id,
      title: j.title,
      status: j.status,
      userId: j.userId,
    }))
  });
}

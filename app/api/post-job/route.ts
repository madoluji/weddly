import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import { NextRequest } from "next/server";
import Jobs from "@/models/jobs";

interface RequestBody {
  userId: string;
  fullName: string;
  title: string;
  type: string;
  experience: string;
  budget: string;
  description: string;
  tags: string[];
  location: string;
  fileUrls: string[];

}

export async function POST(req: NextRequest) {
  const status = "active";
  try {

    const userData = req.headers.get("user");
    const user = userData ? JSON.parse(userData) : null;
    // if (!user.emailVerified) {


    //   return NextResponse.json({ message: `Unauthorized email not verified` }, { status: 400 });
    // }
    const fullName = user.name + " " + user.lastName;
    const userId = user.id;
    const {
      title,
      type,
      experience,
      budget,
      description,
      tags,
      location,
      fileUrls,
    }: RequestBody = await req.json();

    await connectMongoDB();
    // Save the data in the database
    await Jobs.create({
      userId,
      fullName,
      title,
      type,
      experience,
      budget,
      description,
      tags,
      location,
      fileUrls,
      status,


    });
    const responseData = {
      userId,
      fullName,
      title,
      type,
      experience,
      budget,
      description,
      tags,
      location,
      fileUrls,
    };

    return NextResponse.json(
      { message: "Data Received Successfully", data: responseData },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

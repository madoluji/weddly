import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import { NextRequest } from "next/server";
import FreelancerInfo from "@/models/freelancerInfo";
import User from "@/models/user";
import { institution, project, work } from "@/app/ui/login-signup-component/freelancer/freelancerForms";

interface UserRequestBody {
  userId: string;
  fullName: string;
  email: string;
  location: string;
  skills: string[];
  workExperience?: work[];
  projectPortfolio?: project[];
  education?: institution[];
  bio: string;
  languages: string[];
  rate: number;
}

export async function POST(req: NextRequest) {
  try {
    // Extract user from custom header
    const userData = req.headers.get("user");
    const user = userData ? JSON.parse(userData) : null;



    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized: No user data" }, { status: 401 });
    }
    const userId = user.id;
    const fullName = user.name + " " + user.lastName;
    const email = user.email;


    const {
      location,
      skills,
      workExperience,
      projectPortfolio,
      education,
      bio,
      languages,
      rate,
    }: UserRequestBody = await req.json();

    await connectMongoDB();
    // Save/update the data in the database
    await FreelancerInfo.findOneAndUpdate({ userId }, {
      userId,
      fullName,
      email,
      location,
      skills,
      workExperience,
      projectPortfolio,
      education,
      bio,
      languages,
      rate,
    }, { upsert: true, new: true, runValidators: true });
    await User.updateOne({ _id: userId }, { $set: { "roles.freelancer": true } });
    const responseData = {
      userId,
      fullName,
      email,
      location,
      skills,
      workExperience,
      projectPortfolio,
      education,
      bio,
      languages,
      rate,
    };

    return NextResponse.json(
      { message: "Data Received Successfully", data: responseData },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    await connectMongoDB();
    const freelancer = await FreelancerInfo.findOne({ userId });

    if (!freelancer) {
      return NextResponse.json({ message: "Freelancer not found" }, { status: 404 });
    }

    return NextResponse.json({ freelancer }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userData = req.headers.get("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !user.id) {
      return NextResponse.json({ message: "Unauthorized: No user data" }, { status: 401 });
    }

    const {
      location,
      skills,
      workExperience,
      projectPortfolio,
      education,
      bio,
      languages,
      rate,
    }: UserRequestBody = await req.json();

    await connectMongoDB();

    const fullName = `${user.name || ""} ${user.lastName || ""}`.trim();
    const email = user.email;

    const updatedFreelancer = await FreelancerInfo.findOneAndUpdate(
      { userId: user.id },
      {
        $set: {
          userId: user.id,
          fullName,
          email,
          location,
          skills,
          workExperience,
          projectPortfolio,
          education,
          bio,
          languages,
          rate,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: "Freelancer profile updated", freelancer: updatedFreelancer },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

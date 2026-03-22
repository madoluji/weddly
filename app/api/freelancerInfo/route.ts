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
  industries?: string[];
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
      industries,
      workExperience,
      projectPortfolio,
      education,
      bio,
      languages,
      rate,
    }: UserRequestBody = await req.json();

    await connectMongoDB();
    // Save the data in the database
    await FreelancerInfo.create({
      userId,
      fullName,
      email,
      location,
      skills,
      industries,
      workExperience,
      projectPortfolio,
      education,
      bio,
      languages,
      rate,
    });
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

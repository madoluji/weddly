import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user";
import Portfolio from "@/models/portfolios";
import { NextResponse, type NextRequest } from "next/server";

interface PortfolioRequestBody {
  userId: string;
  projectTitle: string;
  projectDescription: string;
  portfolioFiles: string[];
  technologies: string[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectMongoDB();

    // Parse JSON from the request body
    const {
      userId,
      projectTitle,
      projectDescription,
      portfolioFiles,
      technologies,
    }: PortfolioRequestBody = await req.json();

    // Fetch user data using the userId
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create new portfolio entry
    const newPortfolio = new Portfolio({
      userId,
      email: user.email,
      projectTitle,
      projectDescription,
      fileUrls: portfolioFiles,
      technologies,
    });

    // Save portfolio entry to the database
    await newPortfolio.save();

    return NextResponse.json(
      { message: "Portfolio created successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while creating the portfolio" },
      { status: 500 }
    );
  }
}

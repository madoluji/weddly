// pages/api/portfolio.js
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user"; // Import User model
import Portfolio from "@/models/portfolios"; // Import Portfolio model
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongoDB(); // Connect to MongoDB

    // Parse JSON from the request body
    const {
      userId,
      projectTitle,
      projectDescription,
      portfolioFiles,
      technologies,
    } = await req.json();

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

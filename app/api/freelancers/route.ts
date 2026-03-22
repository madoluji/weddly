import { authOptions } from "@/app/lib/auth";
import { connectMongoDB } from "../../lib/mongodb";
import FreelancerInfo from "@/models/freelancerInfo";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import SavedFreelancers from "@/models/savedFreelancers";
import User from "@/models/user";
import clientinfo from "@/models/clientinfo";
import { industrySkillsMapping } from "@/app/lib/data";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const bestMatches = searchParams.get("bestMatches");
  const savedFreelancers = searchParams.get("savedFreelancers");
  const params = searchParams.get("talentName");
  const individualUserId = searchParams.get("userId"); // New parameter for individual freelancer
  const isSaved = searchParams.get('s')

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id; // Get the logged-in user's ID
  let freelancers: any[] = [];

  try {
    await connectMongoDB();

    if (individualUserId) {
      // Fetch individual freelancer data by userId
      const freelancer = await FreelancerInfo.findOne({ userId: individualUserId });
      if (freelancer) {
        // Check if the freelancer profile is saved by the current user
        const Saved = await SavedFreelancers.exists({ userId: userId, freelancerId: freelancer._id });

        const user = await User.findOne({ _id: freelancer.userId });

        if (isSaved) {
          const freelancerWithDetails = {
            freelancerId: freelancer._id, // Include freelancer ID
            ...freelancer.toObject(),    // Include freelancer details
            saved: Saved ? true : false, // Set saved flag based on whether it's saved
            profilePicture: user?.profilePicture || "/images/image.png", // Include profile picture
          };
          return NextResponse.json({ freelancer: freelancerWithDetails });

        }
        const freelancerWithDetails = {
          freelancerId: freelancer._id, // Include freelancer ID
          ...freelancer.toObject(),    // Include freelancer details
          saved: false,                // Default to false for individual fetch
          profilePicture: user?.profilePicture || "/images/image.png", // Include profile picture
        };

        return NextResponse.json({ freelancer: freelancerWithDetails });
      } else {
        return NextResponse.json({ message: "Freelancer not found" }, { status: 404 });
      }
    }


    if (!params) {
      if (bestMatches) {
        // Fetch best match freelancers excluding current user
        const clientPrefferedIndustriesSkills = await clientinfo.findOne
          ({ userId: userId }).select("industry prefferedSkills");

        // Step 2: Construct a query to find matching freelancers
        const recommendedFreelancers = await FreelancerInfo.find({
          userId: { $ne: userId }, // Exclude the client
          industries: { $in: clientPrefferedIndustriesSkills?.industry || [] }, // Match industries
          skills: {
            $in: [
              ...(clientPrefferedIndustriesSkills?.industry || []), // Match preferred skills
              ...(clientPrefferedIndustriesSkills?.industry?.flatMap(industry =>
                industrySkillsMapping[industry as keyof typeof industrySkillsMapping] || []) || []),
              // Match related industry skills
            ]
          },
        });

        // Fetch other freelancers excluding recommended ones and current user
        const recommendedFreelancerIds = recommendedFreelancers.map(freelancer => freelancer.userId);
        const otherFreelancers = await FreelancerInfo.find({
          userId: { $ne: userId, $nin: recommendedFreelancerIds },
        });

        // Combine recommended and other freelancers
        freelancers = [...recommendedFreelancers, ...otherFreelancers];






      } else if (savedFreelancers) {
        // Fetch saved freelancer IDs from SavedFreelancers collection
        const savedFreelancersData = await SavedFreelancers.find({ userId });

        // Extract freelancer IDs and fetch their details from FreelancerInfo
        const savedFreelancerIds = savedFreelancersData.map((record) => record.freelancerId);
        freelancers = await FreelancerInfo.find({ userId: { $in: savedFreelancerIds } });
      }
    } else {
      // Fetch freelancers matching the search parameter
      freelancers = await FreelancerInfo.find({
        userId: { $ne: userId },
        fullName: { $regex: params, $options: "i" }, // Case-insensitive search
      });
    }

    // Fetch saved freelancer IDs for the current user
    const savedFreelancerRecords = await SavedFreelancers.find({ userId });
    const savedFreelancerIds = savedFreelancerRecords.map((record) => record.freelancerId.toString());

    // Add 'saved' field and 'profilePicture' to each freelancer and include freelancerId
    const freelancersWithSavedFlag = await Promise.all(
      freelancers.map(async (freelancer) => {
        const user = await User.findOne({ _id: freelancer.userId });
        return {
          freelancerId: freelancer._id, // Include freelancer ID
          ...freelancer._doc,          // Include freelancer details
          saved: savedFreelancerIds.includes(freelancer.userId.toString()), // Check if saved
          profilePicture: user?.profilePicture || "/images/image.png", // Include profile picture
        };
      })
    );



    return NextResponse.json({ freelancers: freelancersWithSavedFlag });
  } catch (error) {
    console.error("Error fetching Freelancers:", error);
    return NextResponse.json(
      { message: "Error fetching freelancers" },
      { status: 500 }
    );
  }
}
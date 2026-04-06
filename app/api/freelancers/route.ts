import { authOptions } from "@/app/lib/auth";
import { connectMongoDB } from "../../lib/mongodb";
import FreelancerInfo from "@/models/freelancerInfo";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import SavedFreelancers from "@/models/savedFreelancers";
import User from "@/models/user";
import clientinfo from "@/models/clientinfo";

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
        // Check if the freelancer profile is saved by the current user and fetch the user profile in parallel.
        const [Saved, user] = await Promise.all([
          SavedFreelancers.exists({ userId: userId, freelancerId: freelancer._id }),
          User.findOne({ _id: freelancer.userId }),
        ]);

        if (isSaved) {
          const freelancerWithDetails = {
            freelancerId: freelancer._id, // Include freelancer ID
            ...freelancer.toObject(),    // Include freelancer details
            saved: Boolean(Saved), // Set saved flag based on whether it's saved
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
        const clientPreferences = await clientinfo.findOne
          ({ userId: userId }).select("weddingStyle");

        const weddingStyle = clientPreferences?.weddingStyle || "";
        const relatedSkills: string[] = [];

        // Step 2: Construct a query to find matching freelancers
        const recommendedFreelancers = await FreelancerInfo.find({
          userId: { $ne: userId }, // Exclude the client
          skills: { $in: relatedSkills },
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

    const freelancerUserIds = Array.from(
      new Set(freelancers.map((freelancer) => freelancer.userId.toString()))
    );

    const [savedFreelancerRecords, users] = await Promise.all([
      SavedFreelancers.find({ userId }).select("freelancerId").lean(),
      User.find({ _id: { $in: freelancerUserIds } })
        .select("_id profilePicture")
        .lean(),
    ]);

    const savedFreelancerIds = new Set(
      savedFreelancerRecords.map((record) => record.freelancerId.toString())
    );

    const profilePictureByUserId = new Map<string, string | null>();
    for (const user of users) {
      profilePictureByUserId.set(user._id.toString(), user.profilePicture || null);
    }

    const freelancersWithSavedFlag = freelancers.map((freelancer) => ({
      freelancerId: freelancer._id, // Include freelancer ID
      ...freelancer._doc,          // Include freelancer details
      saved: savedFreelancerIds.has(freelancer.userId.toString()), // Check if saved
      profilePicture:
        profilePictureByUserId.get(freelancer.userId.toString()) || "/images/image.png", // Include profile picture
    }));



    return NextResponse.json({ freelancers: freelancersWithSavedFlag });
  } catch (error) {
    console.error("Error fetching Freelancers:", error);
    return NextResponse.json(
      { message: "Error fetching freelancers" },
      { status: 500 }
    );
  }
}
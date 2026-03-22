import Jobs from "@/models/jobs";
import SavedJobs from "@/models/savedJobs"; // Import SavedJobs model
import { connectMongoDB } from "../../lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import proposal from "@/models/proposal";
import FreelancerInfo from "@/models/freelancerInfo";
import { industrySkillsMapping } from "@/app/lib/data";
import { log } from "console";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const bestMatches = searchParams.get('bestMatches');
  const mostRecent = searchParams.get('mostRecent');
  const savedJobs = searchParams.get('savedJobs');
  const title = searchParams.get('title');
  const experience = searchParams.get('Experience');
  const jobId = searchParams.get('jobId');
  const clientId = searchParams.get('userId'); // Get userId from query parameters
  const isSaved = searchParams.get('s');

  const userId = session?.user.id;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let jobs: any[] = [];

  try {
    await connectMongoDB();

    if (jobId) {
      // Fetch individual job with proposal count
      const job = await Jobs.findById(jobId);
      if (!job) {
        return NextResponse.json({ message: "Job not found" }, { status: 404 });
      }
      const proposalCount = await proposal.countDocuments({ jobId });

      if (isSaved) {
        const Saved = await SavedJobs.exists({ userId, jobId: jobId }); // Check if the job is saved by the user
        if (Saved) {
          return NextResponse.json({ ...job.toObject(), proposalCount, isSaved: true }); // Add the isSaved flag
        } else {
          return NextResponse.json({ ...job.toObject(), proposalCount, isSaved: false }); // Add the isSaved flag
        }
      }

      return NextResponse.json({ ...job.toObject(), proposalCount });
    }

    if (clientId) {
      // Fetch all jobs posted by the client
      const jobs = await Jobs.find({ userId: session?.user.id });

      // Enrich jobs with proposal count
      const jobsWithProposalCounts = await Promise.all(
        jobs.map(async (job) => {
          const proposalCount = await proposal.countDocuments({ jobId: job._id });
          return { ...job.toObject(), proposalCount };
        })
      );

      // Return a single object instead of an array
      return NextResponse.json({ jobs: jobsWithProposalCounts });
    }

    // Fetch jobs based on query parameters
    if (!title) {
      if (bestMatches) {
        // Step 1: Retrieve freelancer's industries and skills
        const freelancerInfo = await FreelancerInfo.
          findOne({ userId: userId }).select("industries skills");

        if (!freelancerInfo) {
          console.log("Freelancer not found");
          return;
        }

        // Step 2: Extract relevant industry-related skills from mapping
        const relatedSkills = freelancerInfo.industries.flatMap(industry =>
          industrySkillsMapping[industry as keyof typeof industrySkillsMapping] || []);

        // Step 3: Query jobs where requiredSkills match freelancer's skills or industry-related skills
        const matchingJobs = await Jobs.find({
          tags: { $in: [...freelancerInfo.skills, ...relatedSkills] },

          userId: { $ne: userId },
          status: 'active'
        });

        // Step 4: Fetch other jobs excluding the matching jobs
        const otherJobs = await Jobs.find({
          _id: { $nin: matchingJobs.map(job => job._id) },
          userId: { $ne: userId },
          status: 'active'
        });

        // Combine matching jobs and other jobs
        jobs = [...matchingJobs, ...otherJobs];


      } else if (mostRecent) {
        jobs = await Jobs.find({
          userId: { $ne: userId },
          status: 'active'
        }).sort({ createdAt: -1 }); // Sort by most recent
      } else if (savedJobs) {
        // Fetch jobs saved by the user from SavedJobs collection
        const savedJobsData = await SavedJobs.find({ userId }).populate('jobId');
        jobs = savedJobsData ? savedJobsData.map((savedJob) => savedJob.jobId) : [];
      }
    } else if (!experience) {
      // Fetch jobs where 'title' matches the search parameter
      jobs = await Jobs.find({
        userId: { $ne: userId },
        title: { $regex: title, $options: "i" },
      });
    } else {
      // Fetch jobs where 'title' and 'experience' match the search parameters
      jobs = await Jobs.find({
        userId: { $ne: userId },
        title: { $regex: title, $options: "i" },
      })
        .where('experience').in(experience.split(','));
    }

    // Fetch saved job ids for the current user
    const savedJobRecords = await SavedJobs.find({ userId });
    const savedJobIds = savedJobRecords.map((record) => record.jobId.toString());

    // Add 'saved' field and include jobId for each job
    const jobsWithSavedFlag = await Promise.all(jobs.map(async (job) => {
      const proposalCount = await proposal.countDocuments({ jobId: job._id });

      return {
        jobId: job._id,  // Include the job ID in the response
        ...job._doc,     // Spread other job details
        saved: savedJobIds.includes(job._id.toString()), // Check if the job is saved
        proposalCount,   // Include the proposal count
      };
    }));

    return NextResponse.json({ jobs: jobsWithSavedFlag });
  } catch (error) {
    console.error("Error fetching Jobs:", error);
    return NextResponse.json(
      { message: "Error fetching jobs" },
      { status: 500 }
    );
  }
}
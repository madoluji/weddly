import Jobs from "@/models/jobs";
import SavedJobs from "@/models/savedJobs"; // Import SavedJobs model
import User from "@/models/user";
import { connectMongoDB } from "../../lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import proposal from "@/models/proposal";
import FreelancerInfo from "@/models/freelancerInfo";
import { applyServerFilters, paginateItems } from "@/app/lib/jobFilters";

const parseJobLocation = (location: unknown) => {
  if (!location || typeof location !== "object") {
    return null;
  }

  const value = location as Record<string, unknown>;
  const lat = value.lat;
  const lng = value.lng;

  if (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lng === "number" &&
    Number.isFinite(lng)
  ) {
    return {
      lat,
      lng,
      address: typeof value.address === "string" ? value.address : undefined,
      type: "Point" as const,
      coordinates: [lng, lat] as [number, number],
    };
  }

  return null;
};

const getLocationDisplay = (location: unknown) => {
  if (typeof location === "string" && location.trim().length > 0) {
    return location;
  }

  const parsed = parseJobLocation(location);
  if (!parsed) {
    return "Remote";
  }

  if (parsed.address && parsed.address.trim().length > 0) {
    return parsed.address;
  }

  return `${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)}`;
};

const withLocationFields = (jobObject: Record<string, any>) => ({
  ...jobObject,
  location: getLocationDisplay(jobObject.location),
  locationMeta: parseJobLocation(jobObject.location),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const bestMatches = searchParams.get('bestMatches');
  const mostRecent = searchParams.get('mostRecent');
  const savedJobs = searchParams.get('savedJobs');
  const search = searchParams.get('search');
  const title = searchParams.get('title');
  const experience = searchParams.get('experience') || searchParams.get('Experience');
  const location = searchParams.get('location');
  const category = searchParams.get('category');
  const minBudget = searchParams.get('minBudget');
  const maxBudget = searchParams.get('maxBudget');
  const eventDate = searchParams.get('eventDate');
  const sortBy = searchParams.get('sortBy');
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const jobId = searchParams.get('jobId');
  const clientId = searchParams.get('userId'); // Get userId from query parameters
  const isSaved = searchParams.get('s');

  const shouldPaginate = pageParam !== null || limitParam !== null;
  const pageValue = Number.parseInt(pageParam || "1", 10);
  const limitValue = Number.parseInt(limitParam || "10", 10);

  const minBudgetValue =
    minBudget !== null && minBudget !== "" && Number.isFinite(Number(minBudget))
      ? Number(minBudget)
      : null;
  const maxBudgetValue =
    maxBudget !== null && maxBudget !== "" && Number.isFinite(Number(maxBudget))
      ? Number(maxBudget)
      : null;
  const experienceFilters = experience
    ? experience
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    : [];

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
          return NextResponse.json({
            ...withLocationFields(job.toObject()),
            proposalCount,
            isSaved: true,
          }); // Add the isSaved flag
        } else {
          return NextResponse.json({
            ...withLocationFields(job.toObject()),
            proposalCount,
            isSaved: false,
          }); // Add the isSaved flag
        }
      }

      return NextResponse.json({
        ...withLocationFields(job.toObject()),
        proposalCount,
      });
    }

    if (clientId) {
      // Fetch all jobs posted by the client
      const jobs = await Jobs.find({ userId: session?.user.id });

      // Enrich jobs with proposal count
      const jobsWithProposalCounts = await Promise.all(
        jobs.map(async (job) => {
          const proposalCount = await proposal.countDocuments({ jobId: job._id });
          return {
            ...withLocationFields(job.toObject()),
            proposalCount,
          };
        })
      );

      // Return a single object instead of an array
      return NextResponse.json({ jobs: jobsWithProposalCounts });
    }

    // Fetch jobs based on query parameters
    if (!title) {
      if (bestMatches) {
        // Step 1: Retrieve freelancer's skills
        const freelancerInfo = await FreelancerInfo.
          findOne({ userId: userId }).select("skills");

        if (!freelancerInfo) {
          return NextResponse.json({ jobs: [] });
        }

        // Step 2: Query jobs where requiredSkills match freelancer's skills
        const matchingJobs = await Jobs.find({
          tags: { $in: freelancerInfo.skills },

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

    const normalizedJobs = jobs.map((job) =>
      typeof job?.toObject === "function" ? job.toObject() : job
    );

    const jobObjectIds = normalizedJobs.map((job) => job._id);

    // Fetch saved job ids for the current user
    const savedJobRecords = await SavedJobs.find({ userId }).select("jobId").lean();
    const savedJobIds = new Set(savedJobRecords.map((record) => record.jobId.toString()));

    const [proposalCountRows, userProposalRows] = await Promise.all([
      proposal.aggregate([
        { $match: { jobId: { $in: jobObjectIds } } },
        { $group: { _id: "$jobId", count: { $sum: 1 } } },
      ]),
      proposal
        .find({ userId, jobId: { $in: jobObjectIds } })
        .sort({ createdAt: -1 })
        .select("jobId status")
        .lean(),
    ]);

    const proposalCountsByJobId = new Map<string, number>();
    for (const row of proposalCountRows) {
      proposalCountsByJobId.set(row._id.toString(), Number(row.count) || 0);
    }

    const userProposalStatusByJobId = new Map<string, string>();
    for (const row of userProposalRows) {
      const normalizedJobId = row.jobId.toString();
      if (!userProposalStatusByJobId.has(normalizedJobId)) {
        userProposalStatusByJobId.set(normalizedJobId, row.status);
      }
    }

    const clientUserIds = Array.from(
      new Set(normalizedJobs.map((job) => job.userId.toString()))
    );
    const clientUsers = await User.find({ _id: { $in: clientUserIds } })
      .select("_id profilePicture")
      .lean();
    const profilePictureByUserId = new Map<string, string | null>();
    for (const user of clientUsers) {
      profilePictureByUserId.set(user._id.toString(), user.profilePicture || null);
    }

    const jobsWithSavedFlag = normalizedJobs.map((job) => {
      const normalizedJobId = job._id.toString();
      const proposalStatus = userProposalStatusByJobId.get(normalizedJobId) || null;

      return {
        jobId: normalizedJobId,
        ...withLocationFields(job),
        saved: savedJobIds.has(normalizedJobId),
        proposalCount: proposalCountsByJobId.get(normalizedJobId) || 0,
        profilePicture: profilePictureByUserId.get(job.userId.toString()) || null,
        hasApplied: proposalStatus !== null,
        myProposalStatus: proposalStatus,
      };
    });

    const filteredJobs = applyServerFilters(jobsWithSavedFlag, {
      search: search || title,
      location,
      category,
      experiences: experienceFilters,
      minBudget: minBudgetValue,
      maxBudget: maxBudgetValue,
      eventDate,
      sortBy,
    });

    if (shouldPaginate) {
      const paginated = paginateItems(filteredJobs, pageValue, limitValue);
      return NextResponse.json({
        jobs: paginated.items,
        pagination: paginated.pagination,
      });
    }

    return NextResponse.json({ jobs: filteredJobs });
  } catch (error) {
    console.error("Error fetching Jobs:", error);
    return NextResponse.json(
      { message: "Error fetching jobs" },
      { status: 500 }
    );
  }
}
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
import { getCacheValue, setCacheValue } from "@/app/lib/serverCache";

const BEST_MATCHES_TTL_MS = 60 * 1000;

const buildJobsResponse = (
  body: Record<string, unknown>,
  cacheState?: "HIT" | "MISS"
) =>
  NextResponse.json(body, {
    headers: {
      "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      ...(cacheState ? { "X-Cache": cacheState } : {}),
    },
  });

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
  const normalizedTitleSearch = title
    ? title
        .trim()
        .replace(/["\\]/g, " ")
        .replace(/\s+/g, " ")
    : "";

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
      const job = await Jobs.findById(jobId).lean();
      if (!job) {
        return NextResponse.json({ message: "Job not found" }, { status: 404 });
      }

      const isOwner = job.userId?.toString() === userId;
      const isPublic = job.status === "active";
      if (!isOwner && !isPublic) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      const [proposalCount, saved] = await Promise.all([
        proposal.countDocuments({ jobId }),
        isSaved ? SavedJobs.exists({ userId, jobId: jobId }) : Promise.resolve(false),
      ]);

      if (isSaved) {
        return NextResponse.json({
          ...withLocationFields(job),
          proposalCount,
          isSaved: Boolean(saved),
        });
      }

      return NextResponse.json({
        ...withLocationFields(job),
        proposalCount,
      });
    }

    if (clientId) {
      // Fetch all jobs posted by the client
      const jobs = await Jobs.find({ userId: session?.user.id }).lean();

      // Enrich jobs with proposal count
      const jobsWithProposalCounts = await Promise.all(
        jobs.map(async (job) => {
          const proposalCount = await proposal.countDocuments({ jobId: job._id });
          return {
            ...withLocationFields(job),
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
        const bestMatchesCacheKey = `fetchJobs:bestMatches:${userId}:${searchParams.toString()}`;
        const cached = getCacheValue<{ jobs: any[] }>(bestMatchesCacheKey);

        if (cached) {
          return buildJobsResponse(cached, "HIT");
        }

        // Step 1: Retrieve freelancer's skills
        const freelancerInfo = await FreelancerInfo.findOne({ userId: userId })
          .select("skills")
          .lean();

        if (!freelancerInfo) {
          const emptyPayload = { jobs: [] };
          setCacheValue(bestMatchesCacheKey, emptyPayload, BEST_MATCHES_TTL_MS);
          return buildJobsResponse(emptyPayload, "MISS");
        }

        // Step 2: Query jobs where requiredSkills match freelancer's skills
        const matchingJobs = await Jobs.find({
          tags: { $in: freelancerInfo.skills },
          userId: { $ne: userId },
          status: "active",
        }).lean();

        // Step 4: Fetch other jobs excluding the matching jobs
        const otherJobs = await Jobs.find({
          _id: { $nin: matchingJobs.map((job) => job._id) },
          userId: { $ne: userId },
          status: "active",
        }).lean();

        // Combine matching jobs and other jobs
        jobs = [...matchingJobs, ...otherJobs];
      } else if (mostRecent) {
        jobs = await Jobs.find({
          userId: { $ne: userId },
          status: "active",
        })
          .sort({ createdAt: -1 })
          .lean(); // Sort by most recent
      } else if (savedJobs) {
        // Fetch jobs saved by the user from SavedJobs collection
        const savedJobsData = await SavedJobs.find({ userId })
          .populate({
            path: "jobId",
            options: { lean: true },
          })
          .lean();
        jobs = savedJobsData
          ? savedJobsData
              .map((savedJob) => savedJob.jobId)
              .filter((savedJob): savedJob is NonNullable<typeof savedJob> => !!savedJob)
          : [];
      }
    } else if (!experience) {
      // Use text index search instead of regex to avoid regex-based DoS risk.
      if (!normalizedTitleSearch) {
        jobs = [];
      } else {
        jobs = await Jobs.find(
          {
            userId: { $ne: userId },
            $text: { $search: `"${normalizedTitleSearch}"` },
          },
          { score: { $meta: "textScore" } }
        )
          .sort({ score: { $meta: "textScore" }, createdAt: -1 })
          .lean();
      }
    } else {
      // Combine text-index search with experience filter.
      if (!normalizedTitleSearch) {
        jobs = [];
      } else {
        jobs = await Jobs.find(
          {
            userId: { $ne: userId },
            experience: { $in: experience.split(",") },
            $text: { $search: `"${normalizedTitleSearch}"` },
          },
          { score: { $meta: "textScore" } }
        )
          .sort({ score: { $meta: "textScore" }, createdAt: -1 })
          .lean();
      }
    }

    const normalizedJobs = jobs.map((job) =>
      typeof job?.toObject === "function" ? job.toObject() : job
    );

    const jobObjectIds = normalizedJobs.map((job) => job._id);
    const clientUserIds = Array.from(
      new Set(normalizedJobs.map((job) => job.userId.toString()))
    );

    const [savedJobRecords, proposalCountRows, userProposalRows, clientUsers] =
      await Promise.all([
        SavedJobs.find({ userId }).select("jobId").lean(),
        proposal.aggregate([
          { $match: { jobId: { $in: jobObjectIds } } },
          { $group: { _id: "$jobId", count: { $sum: 1 } } },
        ]),
        proposal
          .find({ userId, jobId: { $in: jobObjectIds } })
          .sort({ createdAt: -1 })
          .select("jobId status")
          .lean(),
        User.find({ _id: { $in: clientUserIds } })
          .select("_id name lastName profilePicture")
          .lean(),
      ]);

    const savedJobIds = new Set(savedJobRecords.map((record) => record.jobId.toString()));

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

    const userMetaByUserId = new Map<
      string,
      { profilePicture: string | null; fullName: string | null }
    >();
    for (const user of clientUsers) {
      const fullName = `${user.name || ""} ${user.lastName || ""}`.trim();
      userMetaByUserId.set(user._id.toString(), {
        profilePicture: user.profilePicture || null,
        fullName: fullName || null,
      });
    }

    const jobsWithSavedFlag = normalizedJobs.map((job) => {
      const normalizedJobId = job._id.toString();
      const proposalStatus = userProposalStatusByJobId.get(normalizedJobId) || null;

      return {
        jobId: normalizedJobId,
        ...withLocationFields(job),
        fullName:
          userMetaByUserId.get(job.userId.toString())?.fullName ||
          job.fullName ||
          "Client",
        type: typeof job.type === "string" && job.type.trim() ? job.type : "General",
        saved: savedJobIds.has(normalizedJobId),
        proposalCount: proposalCountsByJobId.get(normalizedJobId) || 0,
        profilePicture:
          userMetaByUserId.get(job.userId.toString())?.profilePicture || null,
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
      const payload = {
        jobs: paginated.items,
        pagination: paginated.pagination,
      };

      if (bestMatches) {
        const bestMatchesCacheKey = `fetchJobs:bestMatches:${userId}:${searchParams.toString()}`;
        setCacheValue(bestMatchesCacheKey, payload, BEST_MATCHES_TTL_MS);
        return buildJobsResponse(payload, "MISS");
      }

      return NextResponse.json(payload);
    }

    const payload = { jobs: filteredJobs };

    if (bestMatches) {
      const bestMatchesCacheKey = `fetchJobs:bestMatches:${userId}:${searchParams.toString()}`;
      setCacheValue(bestMatchesCacheKey, payload, BEST_MATCHES_TTL_MS);
      return buildJobsResponse(payload, "MISS");
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching Jobs:", error);
    return NextResponse.json(
      { message: "Error fetching jobs" },
      { status: 500 }
    );
  }
}

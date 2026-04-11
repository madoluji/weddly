import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { connectMongoDB } from "@/app/lib/mongodb";
import Jobs from "@/models/jobs";
import Proposal from "@/models/proposal";
import FreelancerInfo from "@/models/freelancerInfo";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  const statusFilter = searchParams.get("status"); // "all" | "pending" | "shortlisted" | "accepted" | "rejected" | "withdrawn"
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const skip = (page - 1) * limit;

  try {
    await connectMongoDB();

    const clientId = session.user.id;

    // 1. Fetch all jobs posted by this client
    const clientJobs = await Jobs.find({ userId: clientId })
      .select("_id title createdAt status")
      .lean();

    if (!clientJobs.length) {
      return NextResponse.json({
        jobs: [],
        proposals: [],
        stats: { total: 0, pending: 0, shortlisted: 0, rejected: 0 },
        pagination: { page, limit, total: 0, pages: 0 },
      });
    }

    // 2. Get the job IDs to filter proposals
    const jobIds = clientJobs.map((j: any) => j._id);

    // 3. Build proposal filter
    const filter: Record<string, any> = { jobId: jobId ? jobId : { $in: jobIds } };
    if (statusFilter && statusFilter !== "all") {
      // Map UI tab names to DB status values
      const statusMap: Record<string, string | string[]> = {
        unread: "pending",
        shortlisted: "shortlisted",
        interviewing: "accepted",
        hired: ["accepted"],
        rejected: "rejected",
      };
      const mappedStatus = statusMap[statusFilter.toLowerCase()];
      if (mappedStatus) {
        filter.status = Array.isArray(mappedStatus)
          ? { $in: mappedStatus }
          : mappedStatus;
      }
    }

    // 4. Aggregate stats for the selected job (or all jobs)
    const statsFilter: Record<string, any> = {
      jobId: jobId ? jobId : { $in: jobIds },
    };
    const [totalCount, pendingCount, shortlistedCount, rejectedCount, newThisWeek] =
      await Promise.all([
        Proposal.countDocuments(statsFilter),
        Proposal.countDocuments({ ...statsFilter, status: "pending" }),
        Proposal.countDocuments({ ...statsFilter, status: "shortlisted" }),
        Proposal.countDocuments({ ...statsFilter, status: "rejected" }),
        Proposal.countDocuments({
          ...statsFilter,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
      ]);

    // 5. Fetch proposals with pagination
    const proposals = await Proposal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const filteredTotal = await Proposal.countDocuments(filter);

    // 6. Enrich proposals with freelancer info
    const enriched = await Promise.all(
      proposals.map(async (proposal: any) => {
        const [freelancerInfo, user] = await Promise.all([
          FreelancerInfo.findOne({ userId: proposal.userId })
            .select("fullName skills workExperience rating bio")
            .lean(),
          User.findById(proposal.userId)
            .select("profilePicture name lastName email")
            .lean(),
        ]);

        // Compute years of experience from workExperience array
        const yearsExp = freelancerInfo?.workExperience?.length
          ? Math.max(
              ...freelancerInfo.workExperience.map((we: any) => {
                const start = we.startDate ? new Date(we.startDate).getFullYear() : new Date().getFullYear();
                const end = we.endDate ? new Date(we.endDate).getFullYear() : new Date().getFullYear();
                return end - start;
              })
            )
          : null;

        return {
          _id: proposal._id,
          jobId: proposal.jobId,
          status: proposal.status,
          bidAmount: proposal.bidAmount,
          duration: proposal.duration,
          coverLetter: proposal.coverLetter,
          createdAt: proposal.createdAt,
          freelancer: {
            userId: proposal.userId,
            name: freelancerInfo?.fullName
              ?? (user ? `${(user as any).name} ${(user as any).lastName}` : "Unknown"),
            email: (user as any)?.email ?? freelancerInfo?.email ?? "",
            profilePicture: (user as any)?.profilePicture ?? null,
            title: freelancerInfo?.skills?.slice(0, 2).join(" & ") ?? "Wedding Specialist",
            rating: freelancerInfo?.rating ?? 0,
            yearsExperience: yearsExp,
          },
        };
      })
    );

    // Apply search filter post-enrichment
    const searched = search
      ? enriched.filter(
          (p) =>
            p.freelancer.name.toLowerCase().includes(search.toLowerCase()) ||
            p.freelancer.title.toLowerCase().includes(search.toLowerCase())
        )
      : enriched;

    return NextResponse.json({
      jobs: clientJobs,
      proposals: searched,
      stats: {
        total: totalCount,
        pending: pendingCount,
        shortlisted: shortlistedCount,
        rejected: rejectedCount,
        newThisWeek,
      },
      pagination: {
        page,
        limit,
        total: filteredTotal,
        pages: Math.ceil(filteredTotal / limit),
      },
    });
  } catch (error) {
    console.error("Applications Manager fetch error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

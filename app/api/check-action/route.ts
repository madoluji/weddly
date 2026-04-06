import { NextApiRequest, NextApiResponse } from "next";
import { connectMongoDB } from "@/app/lib/mongodb";
import Proposal from "@/models/proposal";
import Contract from "@/models/contract";
import FreelancerInfo from "@/models/freelancerInfo";
import Jobs from "@/models/jobs";
import { NextRequest, NextResponse } from "next/server";
import { stat } from "fs";
// import Interview from "@/models/Interview"; // Model for interview invitations
// import Hire from "@/models/Hire"; // Model for job hiring

export async function GET(req: NextRequest) {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);


    const jobId = searchParams.get("jobId");
    const freelancerId = searchParams.get("freelancerId");
    const clientId = searchParams.get("clientId");


    if (!jobId || (!freelancerId && !clientId)) {
        return NextResponse.json({ success: false, message: "Missing parameters" });
    }

    try {
        const actions = [];
        let isEligible = true;
        let mismatchReason = "";

        let freelancer = null;
        let job = null;

        if (jobId && freelancerId) {
            [freelancer, job] = await Promise.all([
                FreelancerInfo.findOne({ userId: freelancerId }),
                Jobs.findById(jobId),
            ]);

            if (freelancer && job) {
                const freelancerSkills = freelancer.skills || [];
                const jobTags = job.tags || [];

                const hasMatchingSkill =
                    jobTags.length === 0 ||
                    jobTags.some((tag: string) => freelancerSkills.includes(tag));

                if (!hasMatchingSkill) {
                    isEligible = false;
                    mismatchReason = "Skill Mismatch: You do not have any of the preferred skills for this gig.";
                }
            }
        }

        // Check if the freelancer has sent a proposal
        if (freelancerId) {
            const [proposalExists, contractAccepted] = await Promise.all([
                Proposal.findOne({ jobId, userId: freelancerId }),
                Contract.findOne({ jobId, freelancerId, status: "accepted" }),
            ]);

            if (proposalExists) actions.push("proposal_submitted");
            if (contractAccepted) actions.push("contract_accepted");
        }

        // Check if the client has sent a contract offer
        if (clientId) {
            const contractExists = await Contract.findOne({ jobId, clientId });
            if (contractExists) actions.push("contract_sent");

            // // Check if the client has invited a freelancer for an interview
            // const interviewExists = await Interview.findOne({ jobId, clientId, freelancerId });
            // if (interviewExists) actions.push("interview_invited");

            // // Check if the client has hired the freelancer
            // const hireExists = await Hire.findOne({ jobId, clientId, freelancerId });
            // if (hireExists) actions.push("hired");
        }

        return NextResponse.json({ success: true, actions: actions || [], isEligible, mismatchReason }, { status: 200 });
    } catch (error) {
        console.error("Error checking actions:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

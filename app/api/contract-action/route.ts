import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Contract from "@/models/contract";
import Jobs from "@/models/jobs";
import ProjectDetails from "@/models/projectDetails";

type ContractStatus = "pending" | "active" | "declined" | "completed" | "canceled";
type JobStatus = "active" | "in-progress" | "completed" | "canceled";
type ProjectStatus = "ongoing" | "completed" | "canceled";

export async function PATCH(req: NextRequest) {
    try {
        await connectMongoDB();

        // Parse request data
        const { contractId, newStatus, userId, reason } = await req.json();
        if (!contractId || !newStatus || !userId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Find the contract and populate job details
        const contract = await Contract.findById(contractId)
            .populate({ path: "jobId", select: "title description status" });

        if (!contract) {
            return NextResponse.json({ message: "Contract not found" }, { status: 404 });
        }

        // Authorization check
        if (contract.clientId.toString() !== userId && contract.freelancerId.toString() !== userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        // Prevent clients from changing status to 'active' or 'declined'
        if (contract.clientId.toString() === userId && (newStatus === "active" || newStatus === "declined")) {
            return NextResponse.json({ message: "Clients cannot change the status to 'active' or 'declined'" }, { status: 403 });
        }

        // Prevent changes after completed or canceled contracts
        if (contract.status === "completed" && (newStatus === "pending" || newStatus === "active" || newStatus === "declined")) {
            return NextResponse.json({ message: "A completed contract cannot be reverted to an earlier status" }, { status: 400 });
        }

        if (contract.status === "canceled" && newStatus !== "completed") {
            return NextResponse.json({ message: "A canceled contract cannot be changed" }, { status: 400 });
        }

        // Allowed status transitions
        const allowedTransitions: Record<ContractStatus, string[]> = {
            pending: ["active", "declined", "canceled"],
            active: ["completed", "canceled"],
            declined: [],
            completed: [],
            canceled: []
        };

        // Ensure valid status transition
        if (!allowedTransitions[contract.status as ContractStatus].includes(newStatus)) {
            return NextResponse.json({ message: `Invalid status transition from ${contract.status} to ${newStatus}` }, { status: 400 });
        }

        // Ensure a reason is provided when changing to certain statuses
        if ((newStatus === "declined" || newStatus === "canceled") && !reason) {
            return NextResponse.json({ message: "A reason must be provided for declining or canceling the contract" }, { status: 400 });
        }

        // Determine job & project status updates
        let updatedJobStatus: JobStatus | undefined;
        let updatedProjectStatus: ProjectStatus | undefined;

        if (newStatus === "active") {
            updatedJobStatus = "in-progress";
            updatedProjectStatus = "ongoing";
        }
        if (newStatus === "completed") {
            updatedJobStatus = "completed";
            updatedProjectStatus = "completed";
        }
        if (newStatus === "canceled") {
            updatedJobStatus = "canceled";
            updatedProjectStatus = "canceled";
        }

        // If the contract moves to "active", remove expiration
        if (contract.status === "pending" && newStatus === "active") {
            contract.expiration = undefined;
            contract.set("expiration", undefined, { strict: false });
        }

        // Update contract status
        contract.status = newStatus;
        contract.statusHistory.push({ status: newStatus, changedAt: new Date() });

        // Save contract
        await contract.save();

        // Update job status if needed
        if (updatedJobStatus && contract.jobId) {
            const job = await Jobs.findById(contract.jobId._id);

            if (job) {
                job.status = updatedJobStatus,
                    // Add the new job status change to statusHistory
                    job.statusHistory.push({
                        status: updatedJobStatus,
                        changedAt: new Date()
                    });

                // Update the job's status and statusHistory
                await job.save();
            }
        }

        // Handle Project Details
        if (updatedProjectStatus) {
            let project = await ProjectDetails.findOne({ contractId: contractId });

            if (!project && newStatus === "active") {
                // Create a new project if contract is activated
                project = new ProjectDetails({
                    jobId: contract.jobId._id,
                    contractId: contractId,
                    freelancerId: contract.freelancerId,
                    clientId: contract.clientId,
                    status: "ongoing",
                    project_todo: [{
                        task: 'Project Initiated',
                        deadline: new Date(),
                        status: 'Completed',
                        memo: 'Project is initiated.'
                    }],
                    project_files: [],
                    deliveries: [],
                    requirements: "Everything mentioned in the job posting.",
                    meetings: [],
                    created_at: new Date(),
                    updated_at: new Date()
                });
            } else if (project) {
                // Update project status
                project.status = updatedProjectStatus;
                project.updated_at = new Date();
            }

            if (project) {
                await project.save();
            }
        }

        return NextResponse.json({
            message: "Contract, job, and project details updated successfully",
            contract
        }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

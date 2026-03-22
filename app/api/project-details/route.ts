import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import ProjectDetails from "@/models/projectDetails";
import Jobs from "@/models/jobs"; // Assuming this model exists
import Contract from "@/models/contract"; // Assuming this model exists
import { startSession } from "mongoose";

export async function GET(req: NextRequest) {
    try {
        await connectMongoDB();

        const { searchParams } = new URL(req.url);
        const contractId = searchParams.get("contractId");

        if (!contractId) {
            return NextResponse.json({ message: "Missing contractId" }, { status: 400 });
        }

        const project = await ProjectDetails.findOne({ contractId }).populate([
            { path: "jobId", select: "title description" },
            { path: "contractId", select: "status paymentType price deadline" }
        ]);
        if (!project) {
            return NextResponse.json({ message: "Project not found for this contract" }, { status: 404 });
        }

        return NextResponse.json({ message: "Project retrieved successfully", project }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectMongoDB();
        const userData = req.headers.get("user");
        const user = userData ? JSON.parse(userData) : null;
        const userId = user?.id;
        const { contractId, updates } = await req.json();

        if (!contractId || !userId || !updates) {
            return NextResponse.json({ message: "Missing contractId, userId, or updates" }, { status: 400 });
        }

        // Find the project by contractId
        const project = await ProjectDetails.findOne({ contractId });
        if (!project) {
            return NextResponse.json({ message: "Project not found for this contract" }, { status: 404 });
        }

        // Determine user role
        const isClient = project.clientId.toString() === userId;
        const isFreelancer = project.freelancerId.toString() === userId;

        if (!isClient && !isFreelancer) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        // Handle existing updates (requirements, project_todo, etc.)
        if (isClient && "requirements" in updates) {
            if (Array.isArray(updates.requirements)) {
                project.requirements = updates.requirements;
            } else {
                return NextResponse.json(
                    { message: "Requirements should be an array of strings." },
                    { status: 400 }
                );
            }
        }

        if (isFreelancer) {
            if ("project_todo" in updates) {
                if (Array.isArray(updates.project_todo)) {
                    project.project_todo = updates.project_todo;
                } else {
                    return NextResponse.json(
                        { message: "project_todo should be an array of objects." },
                        { status: 400 }
                    );
                }
            }

            if ("project_files" in updates) {
                if (Array.isArray(updates.project_files)) {
                    project.project_files = updates.project_files;
                } else {
                    return NextResponse.json(
                        { message: "project_files should be an array of objects." },
                        { status: 400 }
                    );
                }
            }

            if ("deliveries" in updates) {
                if (Array.isArray(updates.deliveries)) {
                    project.deliveries = updates.deliveries;
                } else {
                    return NextResponse.json(
                        { message: "deliveries should be an array of strings." },
                        { status: 400 }
                    );
                }
            }
        }

        if (isClient || isFreelancer) {
            if ("meetings" in updates) {
                if (Array.isArray(updates.meetings)) {
                    project.meetings = updates.meetings;
                } else {
                    return NextResponse.json(
                        { message: "meetings should be an array of objects." },
                        { status: 400 }
                    );
                }
            }
        }

        // Handle status updates
        if ("status" in updates) {
            const newStatus = updates.status;
            const validStatuses = ["ongoing", "completed", "revisions", "canceled"];
            if (!validStatuses.includes(newStatus)) {
                return NextResponse.json(
                    { message: "Invalid status value" },
                    { status: 400 }
                );
            }

            // Prevent updates if already in a final state
            if (project.status === "completed" || project.status === "canceled") {
                return NextResponse.json(
                    { message: "Cannot update status of a completed or canceled project" },
                    { status: 403 }
                );
            }

            // Role-based status validation
            if (isFreelancer) {
                if (newStatus === "revisions" && project.status === "ongoing") {
                    project.status = "revisions";
                } else if (newStatus === "ongoing" && project.status === "revisions") {
                    project.status = "ongoing"; // Withdraw action
                } else if (newStatus === "canceled") {
                    project.status = "canceled";
                } else {
                    return NextResponse.json(
                        { message: "Freelancer can only set status to 'revisions', 'ongoing' (from revisions), or 'canceled'" },
                        { status: 403 }
                    );
                }
            } else if (isClient) {
                if (newStatus === "completed") {
                    project.status = "completed";
                } else if (newStatus === "canceled") {
                    project.status = "canceled";
                } else {
                    return NextResponse.json(
                        { message: "Client can only set status to 'completed' or 'canceled'" },
                        { status: 403 }
                    );
                }
            }

            // Update ProjectDetails
            project.updated_at = new Date();

            // Only update Jobs and Contract for "completed" or "canceled"
            if (newStatus === "completed" || newStatus === "canceled") {
                const session = await startSession();
                try {
                    await session.withTransaction(async () => {
                        // Update Job
                        const job = await Jobs.findById(project.jobId).session(session);
                        if (!job) {
                            throw new Error("Associated job not found");
                        }
                        job.status = newStatus;
                        job.statusHistory = job.statusHistory || [];
                        job.statusHistory.push({
                            status: newStatus,
                            changedAt: new Date(),
                        });

                        // Update Contract only if newStatus is "canceled"
                        if (newStatus === "canceled") {
                            const contract = await Contract.findOne({ _id: contractId }).session(session);
                            if (!contract) {
                                throw new Error("Contract not found");
                            }
                            contract.status = newStatus;
                            contract.updated_at = new Date();
                            contract.statusHistory = contract.statusHistory || [];
                            contract.statusHistory.push({
                                status: newStatus,
                                updatedBy: userId,
                                updatedAt: new Date(),
                            });

                            // Save contract changes
                            await contract.save({ session });
                        }

                        // Save all changes within the transaction
                        await Promise.all([
                            project.save({ session }),
                            job.save({ session }),
                        ]);
                    });
                } catch (error) {
                    await session.endSession();
                    throw error;
                }
                await session.endSession();
            } else {
                // For "revisions" or "ongoing", only save ProjectDetails
                await project.save();
            }
        } else {
            // If no status update, save only project changes
            project.updated_at = new Date();
            await project.save();
        }

        return NextResponse.json({ message: "Project updated successfully", project }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.message === "Contract not found" || error.message === "Associated job not found" ? 404 : 500 }
        );
    }
}
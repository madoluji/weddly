import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import { authenticateToken } from "@/app/lib/authorizationMiddleware";
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

        const project = await ProjectDetails.findOne({ contractId })
            .select(
                "jobId contractId freelancerId clientId status project_todo project_files deliveries requirements meetings created_at updated_at"
            )
            .populate([
                { path: "jobId", select: "title description" },
                { path: "contractId", select: "status paymentType price deadline" },
            ])
            .lean();

        if (project) {
            return NextResponse.json({ message: "Project retrieved successfully", project }, { status: 200 });
        }

        const contract = (await Contract.findById(contractId)
            .select("jobId freelancerId clientId status paymentType price deadline")
            .populate({ path: "jobId", select: "title description" })
            .lean()) as any;

        if (!contract) {
            return NextResponse.json({ message: "Contract not found" }, { status: 404 });
        }

        const createdProject = await ProjectDetails.create({
            jobId: contract.jobId,
            contractId: contract._id,
            freelancerId: contract.freelancerId,
            clientId: contract.clientId,
            status: "ongoing",
            project_todo: [
                {
                    task: "Project Initiated",
                    deadline: contract.deadline || new Date(),
                    status: "Completed",
                    memo: "Project workspace created automatically.",
                },
            ],
            project_files: [],
            deliveries: [],
            requirements: ["Everything mentioned in the job posting."],
            meetings: [],
            created_at: new Date(),
            updated_at: new Date(),
        });

        const projectObject = createdProject.toObject();
        projectObject.jobId = contract.jobId;
        projectObject.contractId = {
            _id: contract._id,
            status: contract.status,
            paymentType: contract.paymentType,
            price: contract.price,
            deadline: contract.deadline,
        };

        return NextResponse.json({ message: "Project retrieved successfully", project: projectObject }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectMongoDB();

        const { error, user } = await authenticateToken(req);
        if (error || !user) {
            return NextResponse.json({ message: error || "Unauthorized" }, { status: 401 });
        }

        const userId = typeof user.id === "string" ? user.id : String(user.id);
        const userRole = typeof user.role === "string" ? user.role.toLowerCase() : String(user.role).toLowerCase();
        const { contractId, updates } = await req.json();

        if (!contractId || !updates) {
            return NextResponse.json({ message: "Missing contractId or updates" }, { status: 400 });
        }

        // Find the project by contractId and validate the user role.
        const project = (await ProjectDetails.findOne({ contractId })
            .select("clientId freelancerId status jobId contractId")
            .lean()) as any;

        if (!project) {
            return NextResponse.json({ message: "Project not found for this contract" }, { status: 404 });
        }

        const isClientOwner = project.clientId.toString() === userId;
        const isFreelancerOwner = project.freelancerId.toString() === userId;

        if (!isClientOwner && !isFreelancerOwner) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        if (userRole === "client" && !isClientOwner) {
            return NextResponse.json({ message: "Forbidden: client role mismatch" }, { status: 403 });
        }

        if (userRole === "freelancer" && !isFreelancerOwner) {
            return NextResponse.json({ message: "Forbidden: freelancer role mismatch" }, { status: 403 });
        }

        if (userRole !== "client" && userRole !== "freelancer") {
            return NextResponse.json({ message: "Unauthorized role" }, { status: 403 });
        }

        const projectUpdates: any = {
            updated_at: new Date(),
        };

        if (userRole === "client") {
            if ("requirements" in updates) {
                if (!Array.isArray(updates.requirements)) {
                    return NextResponse.json(
                        { message: "Requirements should be an array of strings." },
                        { status: 400 }
                    );
                }
                projectUpdates.requirements = updates.requirements;
            }

            if ("project_todo" in updates || "project_files" in updates || "deliveries" in updates) {
                return NextResponse.json(
                    { message: "Clients cannot update freelancer-only fields." },
                    { status: 403 }
                );
            }
        }

        if (userRole === "freelancer") {
            if ("requirements" in updates) {
                return NextResponse.json(
                    { message: "Freelancers cannot update client-only fields like requirements." },
                    { status: 403 }
                );
            }

            if ("project_todo" in updates) {
                if (!Array.isArray(updates.project_todo)) {
                    return NextResponse.json(
                        { message: "project_todo should be an array of objects." },
                        { status: 400 }
                    );
                }
                projectUpdates.project_todo = updates.project_todo;
            }

            if ("project_files" in updates) {
                if (!Array.isArray(updates.project_files)) {
                    return NextResponse.json(
                        { message: "project_files should be an array of objects." },
                        { status: 400 }
                    );
                }
                projectUpdates.project_files = updates.project_files;
            }

            if ("deliveries" in updates) {
                if (!Array.isArray(updates.deliveries)) {
                    return NextResponse.json(
                        { message: "deliveries should be an array of strings." },
                        { status: 400 }
                    );
                }
                projectUpdates.deliveries = updates.deliveries;
            }
        }

        if ("meetings" in updates) {
            if (!Array.isArray(updates.meetings)) {
                return NextResponse.json(
                    { message: "meetings should be an array of objects." },
                    { status: 400 }
                );
            }
            projectUpdates.meetings = updates.meetings;
        }

        let updatedProject: any = null;

        if ("status" in updates) {
            const newStatus = updates.status;
            const validStatuses = ["ongoing", "completed", "revisions", "canceled"];
            if (!validStatuses.includes(newStatus)) {
                return NextResponse.json(
                    { message: "Invalid status value" },
                    { status: 400 }
                );
            }

            if (project.status === "completed" || project.status === "canceled") {
                return NextResponse.json(
                    { message: "Cannot update status of a completed or canceled project" },
                    { status: 403 }
                );
            }

            if (userRole === "freelancer") {
                if (newStatus === "revisions" && project.status === "ongoing") {
                    projectUpdates.status = "revisions";
                } else if (newStatus === "ongoing" && project.status === "revisions") {
                    projectUpdates.status = "ongoing";
                } else if (newStatus === "canceled") {
                    projectUpdates.status = "canceled";
                } else {
                    return NextResponse.json(
                        { message: "Freelancer can only set status to 'revisions', 'ongoing' (from revisions), or 'canceled'" },
                        { status: 403 }
                    );
                }
            } else if (userRole === "client") {
                if (newStatus === "completed") {
                    projectUpdates.status = "completed";
                } else if (newStatus === "canceled") {
                    projectUpdates.status = "canceled";
                } else {
                    return NextResponse.json(
                        { message: "Client can only set status to 'completed' or 'canceled'" },
                        { status: 403 }
                    );
                }
            }

            if (newStatus === "completed" || newStatus === "canceled") {
                const session = await startSession();
                try {
                    await session.withTransaction(async () => {
                        const jobUpdate = Jobs.findByIdAndUpdate(
                            project.jobId,
                            {
                                $set: { status: projectUpdates.status },
                                $push: {
                                    statusHistory: {
                                        status: projectUpdates.status,
                                        changedAt: new Date(),
                                    },
                                },
                            },
                            { new: true, session }
                        );

                        const contractUpdate = newStatus === "canceled"
                            ? Contract.findByIdAndUpdate(
                                contractId,
                                {
                                    $set: {
                                        status: newStatus,
                                        updated_at: new Date(),
                                    },
                                    $push: {
                                        statusHistory: {
                                            status: newStatus,
                                            updatedBy: userId,
                                            updatedAt: new Date(),
                                        },
                                    },
                                },
                                { new: true, session }
                            )
                            : Promise.resolve(null);

                        const projectUpdate = ProjectDetails.findOneAndUpdate(
                            { contractId },
                            { $set: projectUpdates },
                            { new: true, lean: true, session }
                        );

                        const [job, contractResult, projectResult] = await Promise.all([
                            jobUpdate,
                            contractUpdate,
                            projectUpdate,
                        ]);

                        if (!job) {
                            throw new Error("Associated job not found");
                        }
                        if (newStatus === "canceled" && !contractResult) {
                            throw new Error("Contract not found");
                        }

                        updatedProject = projectResult;
                    });
                } finally {
                    await session.endSession();
                }
            } else {
                updatedProject = await ProjectDetails.findOneAndUpdate(
                    { contractId },
                    { $set: projectUpdates },
                    { new: true, lean: true }
                );
            }
        } else {
            updatedProject = await ProjectDetails.findOneAndUpdate(
                { contractId },
                { $set: projectUpdates },
                { new: true, lean: true }
            );
        }

        return NextResponse.json({ message: "Project updated successfully", project: updatedProject }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: error.message === "Contract not found" || error.message === "Associated job not found" ? 404 : 500 }
        );
    }
}

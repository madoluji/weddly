import mongoose, { Schema, Document } from "mongoose";

interface StatusHistory {
    status: string;
    changedAt: Date;
}

export interface IProposal extends Document {
    jobId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    clientId: mongoose.Types.ObjectId;
    coverLetter: string;
    attachments: string[];
    bidAmount: number;
    duration: string;
    status: "pending" | "shortlisted" | "accepted" | "rejected" | "withdrawn" | "canceled";
    statusHistory: StatusHistory[];
    createdAt: Date;
    updatedAt: Date;
}

const ProposalSchema: Schema = new Schema(
    {
        jobId: { type: Schema.Types.ObjectId, ref: "Jobs", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        coverLetter: { type: String, required: true },
        attachments: [{ type: String }],
        bidAmount: { type: Number, required: true },
        duration: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "shortlisted", "accepted", "rejected", "withdrawn", "canceled"],
            default: "pending"
        },
        statusHistory: {
            type: [
                {
                    status: { type: String, required: true },
                    changedAt: { type: Date, default: Date.now }
                }
            ],
            default: [{ status: "pending", changedAt: new Date() }] // ✅ Default value for the array itself
        }
    },
    { timestamps: true }
);

ProposalSchema.index({ jobId: 1, createdAt: -1 });
ProposalSchema.index({ userId: 1, jobId: 1, createdAt: -1 });
ProposalSchema.index({ clientId: 1, status: 1, createdAt: -1 });

const ProposalModelName = "Proposal";

// In dev/hot-reload, ensure schema updates are applied instead of reusing stale cached model.
if (mongoose.models[ProposalModelName]) {
    delete mongoose.models[ProposalModelName];
}

export default mongoose.model<IProposal>(ProposalModelName, ProposalSchema);

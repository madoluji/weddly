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
    duration: 'less than 1 month' | "1 to 3 months" | "3 to 6 months" | "more than 6 months";
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
            enum: ["less than 1 month", "1 to 3 months", "3 to 6 months", "more than 6 months"]
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

export default mongoose.models.Proposal || mongoose.model<IProposal>("Proposal", ProposalSchema);

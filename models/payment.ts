import { Transaction } from "firebase/firestore";
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
    jobId: mongoose.Types.ObjectId;
    contractId: mongoose.Types.ObjectId;
    clientId: mongoose.Types.ObjectId;
    freelancerId: mongoose.Types.ObjectId;
    totalAmount: number; // Total amount paid by client
    freelancerAmount: number; // Amount paid to freelancer
    platformFee: number; // Your fee (e.g., 10%)
    transactionId: string; // From payment processor (e.g., Stripe)
    transactionCode: string; // Unique code for the transaction
    method: string;
    status: "completed" | "failed";
    createdAt: Date;
}

const PaymentSchema: Schema = new Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs", required: true },
        contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        totalAmount: { type: Number, required: true },
        freelancerAmount: { type: Number, required: true },
        platformFee: { type: Number, required: true },
        transactionId: { type: String, required: true },
        method: { type: String, required: true },
        transactionCode: { type: String },
        status: {
            type: String,
            enum: ["completed", "failed"],
            required: true,
        },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

// Create indexes to optimize queries
PaymentSchema.index({ jobId: 1, contractId: 1 });
PaymentSchema.index({ clientId: 1 });
PaymentSchema.index({ freelancerId: 1 });
PaymentSchema.index({ transactionId: 1 }, { unique: true });
PaymentSchema.index({ createdAt: 1 })

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
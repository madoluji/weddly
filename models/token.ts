import mongoose, { Document, Schema } from "mongoose";

// Interface for Verification Token
export interface IVerificationToken extends Document {
    email: string;
    token: string;
    createdAt: Date;
}

// Define Schema
const verificationTokenSchema = new Schema<IVerificationToken>(
    {
        email: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 86400, // 24 hours (MongoDB TTL Index)
        },
    },
    { timestamps: true }
);

// Create & Export Model
const VerificationToken =
    mongoose.models.VerificationToken ||
    mongoose.model<IVerificationToken>("VerificationToken", verificationTokenSchema);

export default VerificationToken;
import mongoose, { Document, Schema } from "mongoose";

// Interface for Verification Token
export interface IVerificationToken extends Document {
    email: string;
    token: string;
    createdAt: Date;
    expiresAt: Date;
}

// Define Schema
const verificationTokenSchema = new Schema<IVerificationToken>(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        token: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
    },
    { timestamps: false }
);

// Create TTL index on expiresAt field
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create index on token field for faster queries
verificationTokenSchema.index({ token: 1 }, { unique: true });

// Create index on email field for faster queries
verificationTokenSchema.index({ email: 1 });

// Create & Export Model
const VerificationToken =
    mongoose.models.VerificationToken ||
    mongoose.model<IVerificationToken>("VerificationToken", verificationTokenSchema);

export default VerificationToken;
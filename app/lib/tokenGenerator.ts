import crypto from "crypto";
import VerificationToken from "@/models/token";
import { connectMongoDB } from "./mongodb";

export const createVerificationToken = async (email: string) => {
    try {
        // Ensure MongoDB is connected before saving token
        await connectMongoDB();

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Reuse an existing unexpired token so older emails remain valid.
        const existingToken = await VerificationToken.findOne({
            email: normalizedEmail,
            expiresAt: { $gt: new Date() },
        })
            .select("token expiresAt")
            .lean<{ token: string; expiresAt: Date }>();

        if (existingToken?.token) {
            console.log("♻️ Reusing existing verification token...");
            console.log("   Email:", normalizedEmail);
            console.log("   Token:", existingToken.token.substring(0, 20) + "...");
            console.log("   Expires At:", existingToken.expiresAt);
            return existingToken.token;
        }

        // Generate a 32-byte hex token
        const token = crypto.randomBytes(32).toString("hex");

        // Calculate expiration time (24 hours from now)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        console.log("📝 Creating verification token...");
        console.log("   Email:", normalizedEmail);
        console.log("   Token:", token.substring(0, 20) + "...");
        console.log("   Expires At:", expiresAt);

        // Clean expired tokens for this email before inserting a fresh one.
        await VerificationToken.deleteMany({
            email: normalizedEmail,
            expiresAt: { $lte: new Date() },
        });
        console.log("   Cleaned expired tokens for this email");

        // Store the token in the database
        const verificationToken = new VerificationToken({ 
            email: normalizedEmail, 
            token,
            createdAt: new Date(),
            expiresAt,
        });
        
        const savedToken = await verificationToken.save();
        console.log("✅ Verification Token saved successfully!");
        console.log("   DB ID:", savedToken._id);
        
        return token;
    } catch (error) {
        console.error("❌ Error creating token:", error);
        throw error;
    }
};

import { connectMongoDB } from "./mongodb";
import User from "@/models/user";

export async function getUserVerificationStatus(userId: string) {
    try {
        // Ensure MongoDB connection is established before fetching data
        await connectMongoDB();

        // Fetch only kycVerified and emailVerified fields
        const user = await User.findById(userId).select("kycVerified emailVerified").lean();

        if (!user) {
            return { error: "User not found", kycVerified: false, emailVerified: false };
        }

        return {
            kycVerified: user.kycVerified || false,
            emailVerified: user.emailVerified || false,
        };
    } catch (error) {
        console.error("Error fetching user verification status:", error);
        return { error: "Database error", kycVerified: false, emailVerified: false };
    }
}

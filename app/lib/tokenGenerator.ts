import crypto from "crypto";
import VerificationToken from "@/models/token";



export const createVerificationToken = async (email: string) => {
    try {
        // Generate a 32-byte hex token
        const token = crypto.randomBytes(32).toString("hex");

        // Store the token in the database
        const verificationToken = new VerificationToken({ email, token });
        await verificationToken.save();

        console.log("✅ Verification Token Created:", token);
        return token;
    } catch (error) {
        console.error("❌ Error creating token:", error);
        return null;
    }
};

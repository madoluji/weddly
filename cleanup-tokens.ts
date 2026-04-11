import { connectMongoDB } from "@/app/lib/mongodb";
import VerificationToken from "@/models/token";

async function cleanupTokens() {
    try {
        await connectMongoDB();
        
        console.log("🗑️ Cleaning up old tokens...");
        
        const result = await VerificationToken.deleteMany({});
        
        console.log(`✅ Deleted ${result.deletedCount} old tokens`);
        console.log("✅ Database cleaned!");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

cleanupTokens();

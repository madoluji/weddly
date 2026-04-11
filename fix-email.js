import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function fixEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    // First, let's see what users exist
    console.log("\n🔍 Checking for users with test100@gmail.com:");
    const existingUser = await db.collection("users").findOne({ email: "test100@gmail.com" });
    
    if (existingUser) {
      console.log("Found user:", existingUser._id, existingUser.email);
    } else {
      console.log("❌ User with test100@gmail.com not found");
      console.log("\n🔍 Showing all users in database:");
      const allUsers = await db.collection("users").find({}).limit(5).toArray();
      allUsers.forEach(u => console.log(`  - ${u._id}: ${u.email} (roles: ${JSON.stringify(u.roles)})`));
      process.exit(1);
    }

    // Update user email
    const result = await db.collection("users").updateOne(
      { email: "test100@gmail.com" },
      { $set: { email: "sayujmaskey7@gmail.com" } }
    );

    if (result.matchedCount === 0) {
      console.log("❌ No user matched");
      process.exit(1);
    }

    console.log("✅ Updated user email");

    // Sync to ClientInfo
    await db.collection("clientinfos").updateMany(
      { email: "test100@gmail.com" },
      { $set: { email: "sayujmaskey7@gmail.com" } }
    );
    console.log("✅ Updated ClientInfo");

    // Sync to FreelancerInfo
    await db.collection("freelancerinfos").updateMany(
      { email: "test100@gmail.com" },
      { $set: { email: "sayujmaskey7@gmail.com" } }
    );
    console.log("✅ Updated FreelancerInfo");

    console.log("\n✅ Done! Your account now uses: sayujmaskey7@gmail.com");
    console.log("⚠️  Restart your dev server and clear browser cache for changes to take effect.");
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixEmail();

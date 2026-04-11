import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectMongoDB } from "../app/lib/mongodb.js";
import Admin from "../models/admin";

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const main = async () => {
  const userName = requireEnv("SUPERADMIN_USERNAME");
  const email = requireEnv("SUPERADMIN_EMAIL");
  const password = requireEnv("SUPERADMIN_PASSWORD");
  const name = process.env.SUPERADMIN_FIRST_NAME?.trim() || "Platform";
  const lastName = process.env.SUPERADMIN_LAST_NAME?.trim() || "Owner";

  await connectMongoDB();

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await Admin.findOneAndUpdate(
    { userName },
    {
      $set: {
        userName,
        email,
        name,
        lastName,
        role: "superadmin",
        password: hashedPassword,
        isFirstLogin: false,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log(`Superadmin ready: ${admin.userName} (${admin.email})`);
};

main()
  .catch((error) => {
    console.error("Failed to seed superadmin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

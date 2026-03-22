import mongoose from "mongoose";

export const connectMongoDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    // Already connected, skip the connection
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
};

import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface representing the Jobs document
interface StatusHistory {
  status: string;
  changedAt: Date;
}

interface IJobs extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  fullName: string;
  title: string;
  type: string;
  experience: string;
  budget: string;
  description: string;
  tags: string[];
  location: string;
  fileUrls: string[];
  status: "active" | "in-progress" | "completed" | "canceled";
  statusHistory: StatusHistory[];
  createdAt: Date;
  modifiedAt: Date;
}

// Define the Jobs schema
const jobsSchema = new Schema<IJobs>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    budget: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    fileUrls: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "active", "completed", "canceled"],
      default: "active",
    },
    statusHistory: {
      type: [
        {
          status: { type: String, required: true },
          changedAt: { type: Date, default: Date.now },
        },
      ],
      default: [{ status: "active", changedAt: new Date() }], // ✅ Default value for the array itself
    },
  },
  { timestamps: true }
);

// ✅ Indexing for optimized queries
jobsSchema.index({ createdAt: 1 });
jobsSchema.index({ "statusHistory.changedAt": 1 });

// Create the model
const Jobs: Model<IJobs> =
  mongoose.models.Jobs || mongoose.model<IJobs>("Jobs", jobsSchema);

export default Jobs;

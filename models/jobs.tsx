import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface representing the Jobs document
interface StatusHistory {
  status: string;
  changedAt: Date;
}

interface JobLocation {
  lat: number;
  lng: number;
  address?: string;
  type: "Point";
  coordinates: [number, number];
}

interface IJobs extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  fullName: string;
  title: string;
  type: string;
  experience: string;
  budget: string;
  eventDate?: Date;
  description: string;
  tags: string[];
  location: JobLocation;
  locationText: string;
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
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
      address: {
        type: String,
      },
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    locationText: {
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
    eventDate: {
      type: Date,
      required: false,
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
jobsSchema.index({ status: 1, createdAt: -1 });
jobsSchema.index({ userId: 1, status: 1, createdAt: -1 });
jobsSchema.index({ status: 1, tags: 1, createdAt: -1 });
jobsSchema.index({ type: 1, experience: 1, status: 1, createdAt: -1 });
jobsSchema.index({ eventDate: 1, status: 1 });
jobsSchema.index({ title: "text", description: "text", tags: "text", locationText: "text" });
jobsSchema.index({ "statusHistory.changedAt": 1 });
jobsSchema.index(
  { location: "2dsphere" },
  { partialFilterExpression: { "location.type": "Point" } }
);

// Create the model
const Jobs: Model<IJobs> =
  mongoose.models.Jobs || mongoose.model<IJobs>("Jobs", jobsSchema);

export default Jobs;

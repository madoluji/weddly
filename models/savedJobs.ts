import mongoose, { Document, Schema, Model } from "mongoose";

// Define  schema
interface ISavedJobs extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    jobId: mongoose.Schema.Types.ObjectId;
}

const savedJobsSchema = new Schema<ISavedJobs>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Jobs",
            required: true,
        },
    },
    { timestamps: true }
);

// Create indexes
savedJobsSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Define  model
const SavedJobs: Model<ISavedJobs> =
    mongoose.models.SavedJobs || mongoose.model<ISavedJobs>("SavedJobs", savedJobsSchema);
export default SavedJobs;


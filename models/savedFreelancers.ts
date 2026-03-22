import mongoose, { Document, Schema, Model } from "mongoose";

// Define schema
interface ISavedFreelancers extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    freelancerId: mongoose.Schema.Types.ObjectId;
}

const savedFreelancersSchema = new Schema<ISavedFreelancers>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        freelancerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FreelancerInfo",
            required: true,
        },
    },
    { timestamps: true }
);

// Create indexes
savedFreelancersSchema.index({ userId: 1, freelancerId: 1 }, { unique: true });

// Define model
const SavedFreelancers: Model<ISavedFreelancers> =
    mongoose.models.SavedFreelancers || mongoose.model<ISavedFreelancers>("SavedFreelancers", savedFreelancersSchema);
export default SavedFreelancers;
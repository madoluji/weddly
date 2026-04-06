import mongoose from "mongoose";

const ProjectDetailsSchema = new mongoose.Schema({
    // Adding 'index: true' makes lookups ~100x faster
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs", required: true, index: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true, index: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    project_todo: [
        {
            task: { type: String, required: true },
            deadline: { type: Date, required: true },
            memo: { type: String },
            status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" }
        },
    ],

    project_files: [
        {
            file_name: { type: String, required: true },
            url: { type: String, required: true },
            uploaded_at: { type: Date, default: Date.now }
        }
    ],

    deliveries: [{ type: String, required: true }],
    requirements: [{ type: String, required: true }],

    meetings: [
        {
            meeting_date: { type: Date, required: true },
            meeting_link: { type: String, required: true },
            scheduled_by: { type: String, enum: ["freelancer", "client"], required: true },
            notes: { type: String }
        }
    ],

    status: {
        type: String,
        enum: ["ongoing", "completed", "revisions", "canceled"],
        default: "ongoing",
        index: true // Fast filtering by status
    },

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, {
    // Automatically handles created_at and updated_at more efficiently
    timestamps: true 
});

// Create a Compound Index for the most common query: finding a project by contract
ProjectDetailsSchema.index({ contractId: 1, status: 1 });

const ProjectDetails = mongoose.models.ProjectDetails || mongoose.model("ProjectDetails", ProjectDetailsSchema);

export default ProjectDetails;
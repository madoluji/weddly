// Portfolios Schema (portfolios.ts)
import mongoose from 'mongoose';

// Portfolio Schema
const PortfoliosSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model
            required: true,
        },
        projectTitle: {
            type: String,
            required: true,
        },
        projectDescription: {
            type: String,
            required: true,
        },
        fileUrls: {
            type: [String], // Array of URLs for files (e.g., image links)
            required: true,
        },
        technologies: {
            type: [String], // Array of technologies used in the project
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Portfolios || mongoose.model('Portfolios', PortfoliosSchema);

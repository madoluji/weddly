import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface representing the FreelancerInfo document
interface IFreelancerInfo extends Document {
  userId: mongoose.Schema.Types.ObjectId; // Reference to User's _id
  fullName: string;
  email: string;
  location: string;
  skills: string[];
  industries: string[];
  workExperience?: {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate?: string;
  }[];
  projectPortfolio?: {
    projectTitle?: string;
    projectDescription?: string;
    technologies?: string[];
    portfolioFiles?: string[];
  }[];
  education?: {
    degree?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
  }[];
  bio: string;
  languages: string[];
  rate: string;
  rating: number;
}

// Define the FreelancerInfo schema
const freelancerInfoSchema = new Schema<IFreelancerInfo>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensure each user has only one FreelancerInfo document
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      required: true,
    },
    workExperience: [
      {
        jobTitle: { type: String, required: true },
        company: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: { type: String, required: false },
      },
    ],
    projectPortfolio: [
      {
        projectTitle: { type: String, required: true },
        projectDescription: { type: String, required: true },
        technologies: { type: [String], required: true },
        portfolioFiles: { type: [String], required: false },
      },
    ],
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: { type: String, required: false },
      },
    ],
    bio: {
      type: String,
      required: true,
    },
    languages: {
      type: [String],
      required: true,
    },
    rate: {
      type: String,
      required: true,
    },
    industries: {
      type: [String],
      required: true,
      default: [],
    },
    rating: {
      type: Number,
      default: 0, // Client rating based on freelancer feedback
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

// Create the model for FreelancerInfo
const FreelancerInfo: Model<IFreelancerInfo> =
  mongoose.models.FreelancerInfo ||
  mongoose.model<IFreelancerInfo>("FreelancerInfo", freelancerInfoSchema);

export default FreelancerInfo;

import mongoose, { Model } from "mongoose";

interface IClientInfo extends mongoose.Document {
    userId: mongoose.Schema.Types.ObjectId;
    fullName: string;
    isCompany: boolean;
    industry: string[];
    companySize?: string;
    averageBudget: number;
    preferredSkills: string[];
    location?: string;
    rating: number;
}

const clientInfoSchema = new mongoose.Schema<IClientInfo>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        isCompany: {
            type: Boolean,
            required: true, // True if the client is a company, False if an individual
        },
        industry: {
            type: [String],
            required: true,
            default: [],
        },

        companySize: {
            type: String,
            enum: ["Startup", "Small", "Medium", "Large"],
            required: function (this: any) {
                return this.isCompany === true; // Ensures only required if isCompany is true
            },
        },
        averageBudget: {
            type: Number,
            default: 0, // Average budget of the client's posted projects
        },
        preferredSkills: {
            type: [String], // Skills the client often looks for in freelancers
            default: [],
        },
        location: {
            type: String, // Optional, useful for localized recommendations
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

const ClientInfo: Model<IClientInfo> =
    mongoose.models.ClientInfo ||
    mongoose.model<IClientInfo>("ClientInfo",
        clientInfoSchema);

export default ClientInfo;

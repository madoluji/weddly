import mongoose, { Model } from "mongoose";

interface IClientInfo extends mongoose.Document {
    userId: mongoose.Schema.Types.ObjectId;
    fullName: string;
    isWeddingPlanner: boolean;
    weddingStyle: string;
    targetWeddingDate: string;
    averageBudget: number;
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
        isWeddingPlanner: {
            type: Boolean,
            required: true,
            default: false,
        },
        weddingStyle: {
            type: String,
            required: true,
            enum: [
                "Traditional",
                "Modern",
                "Rustic",
                "Minimalist",
                "Bohemian",
                "Glamorous",
                "Vintage",
                "Destination",
            ],
        },
        targetWeddingDate: {
            type: String,
            required: true,
        },
        averageBudget: {
            type: Number,
            default: 0,
        },
        location: {
            type: String,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
    },
    { timestamps: true }
);

// Delete cached model on HMR so schema changes take effect
if (mongoose.models.ClientInfo) {
    delete mongoose.models.ClientInfo;
}

const ClientInfo: Model<IClientInfo> =
    mongoose.model<IClientInfo>("ClientInfo", clientInfoSchema);

export default ClientInfo;

import mongoose, { Document, Model, Schema } from "mongoose";

// Define an interface representing a document in MongoDB.
interface IAdmin extends Document {
    userName: string;
    email: string;
    name: string;
    profilePicture?: string;
    lastName: string;
    password: string;
    role: "useradmin" | "superadmin";
    isFirstLogin: boolean;
    createdAt: Date;
}

// Define the schema corresponding to the document interface.
const adminSchema = new Schema<IAdmin>(
    {
        userName: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,

        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["useradmin", "superadmin"], // Enum for role field
        },
        isFirstLogin: {
            type: Boolean,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Create the model type with generics.
const Admin: Model<IAdmin> =
    mongoose.models.Admin || mongoose.model<IAdmin>("Admin", adminSchema);

export default Admin;
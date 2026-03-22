import mongoose, { Schema, Document } from "mongoose";

// Interface defining KYC fields
interface IKYC extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  fullName: string;
  email: string;
  dateOfBirth: Date;
  gender: "Male" | "Female" | "Other";
  nationality: string;
  citizenshipNumber?: string;
  passportNumber?: string;
  panNumber?: string;
  address: {
    province: string;
    district: string;
    municipality: string;
    wardNumber: number;
    streetAddress: string;
  };
  documents: {
    citizenshipFront: string;
    citizenshipBack: string;
    passport?: string;
    panCard?: string;
    profilePicture: string;
  };
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  verifiedAt?: Date;
}

// Define Mongoose Schema
const kycSchema = new Schema<IKYC>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    nationality: { type: String, required: true },
    citizenshipNumber: { type: String, required: true, unique: true },
    passportNumber: { type: String, unique: true, sparse: true },
    panNumber: { type: String, unique: true, sparse: true },
    address: {
      province: { type: String, required: true },
      district: { type: String, required: true },
      municipality: { type: String, required: true },
      wardNumber: { type: Number, required: true },
      streetAddress: { type: String, required: true },
    },
    documents: {
      citizenshipFront: { type: String, required: true }, // URL of the uploaded document
      citizenshipBack: { type: String, required: true },
      passport: { type: String },
      profilePicture: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

// Export Model
const KYC = mongoose.models.KYC || mongoose.model<IKYC>("KYC", kycSchema);

export default KYC;

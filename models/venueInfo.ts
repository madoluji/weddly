import mongoose, { Model } from "mongoose";

interface IVenueInfo extends mongoose.Document {
  userId: mongoose.Schema.Types.ObjectId;
  venueName: string;
  location: string;
  rating: number;
}

const venueInfoSchema = new mongoose.Schema<IVenueInfo>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    venueName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
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
if (mongoose.models.VenueInfo) {
  delete mongoose.models.VenueInfo;
}

const VenueInfo: Model<IVenueInfo> = mongoose.model<IVenueInfo>(
  "VenueInfo",
  venueInfoSchema
);

export default VenueInfo;

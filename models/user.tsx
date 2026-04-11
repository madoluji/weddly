import mongoose, { Document, Model, Schema } from "mongoose";

// Define an interface representing a document in MongoDB.
interface IUser extends Document {
  name: string;
  lastName: string;
  fullName?: string;
  email: string;
  password: string;
  roles: {
    client?: boolean;
    freelancer?: boolean;
    venue?: boolean;
  };
  dob: string;
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  zipPostalCode: string;
  phone: string;
  profilePicture: string;
  emailVerified: boolean;
  kycVerified: boolean;
  oauth: boolean;
  isFirstLogin: boolean;
  profileVisible: boolean;
}

// Define the schema corresponding to the document interface.
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser): boolean {
        return !this.oauth;
      },
    },
    roles: {
      client: { type: Boolean, default: false },
      freelancer: { type: Boolean, default: false },
      venue: { type: Boolean, default: false },
    },
    country: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    streetAddress: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    zipPostalCode: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
      validate: {
        validator: function (value: string): boolean {
          if (!value || value.trim().length === 0) {
            return true;
          }

          // Nepal phone format:
          // local mobile: 9XXXXXXXXX
          // international: +9779XXXXXXXXX
          const normalized = value.replace(/[\s-]/g, "");
          return /^(?:\+977)?9\d{9}$/.test(normalized);
        },
        message:
          "Phone number must be a valid Nepal number (9XXXXXXXXX or +9779XXXXXXXXX).",
      },
    },
    dob: {
      type: String,
      required: false,
    },
    profilePicture: {
      type: String,
      required: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    kycVerified: {
      type: Boolean,
      default: false,
    },
    profileVisible: {
      type: Boolean,
      default: true,
    },
    isFirstLogin: {
      type: Boolean,
    },
    oauth: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("fullName").get(function (this: IUser) {
  const first = this.name?.trim() || "";
  const last = this.lastName?.trim() || "";
  return `${first} ${last}`.trim();
});

// Create the model type with generics.
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;

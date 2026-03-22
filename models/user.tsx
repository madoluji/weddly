import mongoose, { Document, Model, Schema } from "mongoose";

// Define an interface representing a document in MongoDB.
interface IUser extends Document {
  name: string;
  lastName: string;
  email: string;
  password: string;
  roles: {
    client?: boolean;
    freelancer?: boolean;
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
    isFirstLogin: {
      type: Boolean,
    },
    oauth: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

// Create the model type with generics.
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;

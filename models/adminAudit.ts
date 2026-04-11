import mongoose, { Document, Model, Schema } from "mongoose";

interface IAdminAudit extends Document {
  actorAdminId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  status: "success" | "failed";
  errorMessage?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const adminAuditSchema = new Schema<IAdminAudit>(
  {
    actorAdminId: {
      type: String,
      required: false,
    },
    actorEmail: {
      type: String,
      required: false,
    },
    actorRole: {
      type: String,
      required: false,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
      index: true,
    },
    errorMessage: {
      type: String,
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  { timestamps: true }
);

const AdminAudit: Model<IAdminAudit> =
  mongoose.models.AdminAudit ||
  mongoose.model<IAdminAudit>("AdminAudit", adminAuditSchema);

export default AdminAudit;
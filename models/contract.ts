import mongoose, { Schema, Document } from "mongoose";


interface StatusHistory {
    status: string;
    changedAt: Date;
}


export interface IContract extends Document {
    jobId: mongoose.Types.ObjectId;
    clientId: mongoose.Types.ObjectId;
    freelancerId: mongoose.Types.ObjectId;
    paymentType: 'fixed' | 'hourly' | 'milestone';
    price: number;
    deadline: Date;
    status: 'pending' | 'active' | 'completed' | 'canceled' | 'declined';
    statusHistory: StatusHistory[];
    expiration: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ContractSchema: Schema = new Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jobs', required: true },
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        paymentType: { type: String, enum: ['fixed', 'hourly', 'milestone'], default: 'fixed' },
        price: { type: Number, required: true },
        deadline: { type: Date, required: true },
        status: { type: String, enum: ['pending', 'active', 'declined', 'completed', 'canceled'], default: 'pending' },
        statusHistory: {
            type: [
                {
                    status: { type: String, required: true },
                    changedAt: { type: Date, default: Date.now }
                }
            ],
            required: true,
            default: [{ status: "pending", changedAt: new Date() }]
        },
        expiration: { type: Date }
    },
    { timestamps: true }
);

ContractSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

export default mongoose.models.Contract || mongoose.model<IContract>("Contract", ContractSchema);

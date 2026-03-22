import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/app/lib/mongodb';
import Payment from '@/models/payment';
import Jobs from '@/models/jobs';

export async function GET(req: NextRequest) {
    await connectMongoDB();

    try {
        const transactions = await Payment.find()
            .select('method status transactionId jobId contractId totalAmount freelancerAmount createdAt clientId freelancerId')
            .populate({ path: 'jobId', model: Jobs, select: 'title' })
            .populate({ path: 'freelancerId', model: 'User', select: 'name lastName' })
            .populate({ path: 'clientId', model: 'User', select: 'name lastName' });

        return NextResponse.json({ transactions }, { status: 200 });
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json({ message: "Server error", error: "" }, { status: 300 });
    }
}

export async function POST(req: NextRequest) {
    return NextResponse.json({ message: `Method ${req.method} Not Allowed` }, { status: 405 });
}

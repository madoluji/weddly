import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/app/lib/mongodb';
import Payment from '@/models/payment';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    await connectMongoDB();
    const userId = params.id;
    const { searchParams } = new URL(req.url);
    const allTransaction = searchParams.get('alltransaction');

    if (!userId) {
        return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    try {
        if (allTransaction) {
            const transactions = await Payment.find({
            $or: [{ freelancerId: userId }, { clientId: userId }]
            }).select('method status transactionId jobId contractId totalAmount freelancerAmount createdAt clientId freelancerId')
            .populate({
            path: 'jobId',
            select: 'title'
            })
            .populate({
            path: 'freelancerId',
            select: 'name lastName'
            })
            .populate({
            path: 'clientId',
            select: 'name lastName'
            });

            const transactionsWithType = transactions
            .map(transaction => ({
                
                ...transaction.toObject(),
                type: transaction.clientId._id.toString() === userId ?  'expense' : 'income'
            }))
            .filter(transaction => transaction.type !== 'income' || transaction.status === 'completed');
                


            return NextResponse.json({ transactionsWithType }, { status: 200 });
        }

        const income = await Payment.find({ freelancerId: userId, status: 'completed' });
        const expense = await Payment.find({ clientId: userId, status: 'completed' });

        let totalFreelancerAmount = income.reduce((sum, payment) => sum + (payment.freelancerAmount || 0), 0);
        let totalClientAmount = expense.reduce((sum, payment) => sum + (payment.totalAmount || 0), 0);

        if (!income) {
            totalClientAmount = 0;
        }

        if (!expense) {
            totalFreelancerAmount = 0;
        }

        return NextResponse.json({ totalFreelancerAmount, totalClientAmount }, { status: 200 });
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json({ message: "Server error", error: "" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    return NextResponse.json({ message: `Method ${req.method} Not Allowed` }, { status: 405 });
}
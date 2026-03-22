import { connectMongoDB } from '@/app/lib/mongodb';
import Contract from '@/models/contract';
import Jobs from '@/models/jobs';
import FreelancerInfo from '@/models/freelancerInfo';
import ClientInfo from '@/models/clientinfo';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        await connectMongoDB();

        // Extract query parameters from URL
        const { searchParams } = new URL(req.url);
        const contractId = searchParams.get("contractId"); // Fetch specific contract
        const paymentType = searchParams.get("paymentType");
        const status = searchParams.get("status");
        const clientId = searchParams.get("clientId");
        const freelancerId = searchParams.get("freelancerId");

        let query: { [key: string]: any } = {};

        if (contractId) {
            query._id = contractId;
        }
        if (paymentType) {
            query.paymentType = { $in: paymentType.split(',').map(type => type.trim()) };
        }
        if (status) {
            query.status = { $in: status.split(',').map(s => s.trim()) };
        }
        if (clientId) {
            query.clientId = clientId;
        }
        if (freelancerId) {
            query.freelancerId = freelancerId;
        }

        // Fetch contract(s) with job details
        let contracts = await Contract.find(query)
            .populate({ path: 'jobId', model: Jobs, select: "title budget description" }) // Populate job details
            .exec();

        if (!contracts.length) {
            return NextResponse.json({ success: true, data: [] });
        }

        const isClient = !!clientId;
        const isFreelancer = !!freelancerId;

        if (!clientId && !freelancerId) {
            return NextResponse.json({ success: false, message: 'Either clientId or freelancerId must be provided to fetch contracts.' }, { status: 400 });
        }

        if (isClient) {
            contracts = await Promise.all(
                contracts.map(async (contract) => {
                    if (contract.freelancerId) {
                        const freelancerDetails = await FreelancerInfo.findOne({
                            userId: contract.freelancerId,
                        }).select("fullName location rate industries");
                        return { ...contract.toObject(), freelancerDetails };
                    }
                    return contract.toObject();
                })
            );
        }

        if (isFreelancer) {
            contracts = await Promise.all(
                contracts.map(async (contract) => {
                    if (contract.clientId) {
                        const clientDetails = await ClientInfo.findOne({
                            userId: contract.clientId,
                        }).select("fullName location rate industries");
                        return { ...contract.toObject(), clientDetails };
                    }
                    return contract.toObject();
                })
            );
        }

        return NextResponse.json({
            success: true,
            data: contractId ? contracts[0] : contracts, // Return a single object if fetching one
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}
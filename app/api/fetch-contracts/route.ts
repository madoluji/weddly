import { connectMongoDB } from '@/app/lib/mongodb';
import Contract from '@/models/contract';
import Jobs from '@/models/jobs';
import FreelancerInfo from '@/models/freelancerInfo';
import ClientInfo from '@/models/clientinfo';
import { NextRequest, NextResponse } from 'next/server';
import { getCacheValue, setCacheValue } from '@/app/lib/serverCache';

const FETCH_CONTRACTS_TTL_MS = 60 * 1000;

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters from URL
        const { searchParams } = new URL(req.url);
        const contractId = searchParams.get("contractId"); // Fetch specific contract
        const paymentType = searchParams.get("paymentType");
        const status = searchParams.get("status");
        const clientId = searchParams.get("clientId");
        const freelancerId = searchParams.get("freelancerId");

        const query: { [key: string]: any } = {};

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

        const cacheKey = `fetch-contracts:${searchParams.toString()}`;
        const cached = getCacheValue<{ success: true; data: unknown }>(cacheKey);
        if (cached) {
            return NextResponse.json(cached, {
                headers: {
                    "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
                    "X-Cache": "HIT",
                },
            });
        }

        await connectMongoDB();

        // Fetch contract(s) with job details
        const contracts = await Contract.find(query)
            .populate({ path: 'jobId', model: Jobs, select: "title budget description eventDate location experience tags" })
            .lean();

        if (!contracts.length) {
            return NextResponse.json({ success: true, data: [] });
        }

        const isClient = !!clientId;
        const isFreelancer = !!freelancerId;

        if (!clientId && !freelancerId) {
            return NextResponse.json({ success: false, message: 'Either clientId or freelancerId must be provided to fetch contracts.' }, { status: 400 });
        }

        const relatedUserIds = Array.from(
            new Set(
                contracts
                    .map((contract) =>
                        isClient ? contract.freelancerId?.toString() : contract.clientId?.toString()
                    )
                    .filter((value): value is string => Boolean(value))
            )
        );

        const [freelancerProfiles, clientProfiles] = await Promise.all([
            isClient
                ? FreelancerInfo.find({ userId: { $in: relatedUserIds } })
                      .select("userId fullName location rate")
                      .lean()
                : Promise.resolve([]),
            isFreelancer
                ? ClientInfo.find({ userId: { $in: relatedUserIds } })
                      .select("userId fullName location rate targetWeddingDate")
                      .lean()
                : Promise.resolve([]),
        ]);

        const freelancerProfileMap = new Map(
            freelancerProfiles.map((profile) => [profile.userId.toString(), profile])
        );
        const clientProfileMap = new Map(
            clientProfiles.map((profile) => [profile.userId.toString(), profile])
        );

        const enrichedContracts = contracts.map((contract) => {
            if (isClient && contract.freelancerId) {
                return {
                    ...contract,
                    freelancerDetails:
                        freelancerProfileMap.get(contract.freelancerId.toString()) || null,
                };
            }

            if (isFreelancer && contract.clientId) {
                return {
                    ...contract,
                    clientDetails:
                        clientProfileMap.get(contract.clientId.toString()) || null,
                };
            }

            return contract;
        });

        const payload = {
            success: true as const,
            data: contractId ? enrichedContracts[0] : enrichedContracts,
        };

        setCacheValue(cacheKey, payload, FETCH_CONTRACTS_TTL_MS);

        return NextResponse.json(payload, {
            headers: {
                "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
                "X-Cache": "MISS",
            },
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}

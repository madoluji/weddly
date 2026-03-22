import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user";
import FreelancerInfo from "@/models/freelancerInfo";
import ClientInfo from "@/models/clientinfo";
import { NextRequest, NextResponse } from "next/server";

type UserGrowthResponse = {
    date: string;
    totalUsers: number;
    freelancers: number;
    clients: number;
}[];

// Convert month number to name
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export async function GET(
    req: NextRequest,
    res: NextResponse<UserGrowthResponse | { error: string }>
) {
    await connectMongoDB();

    try {
        const { searchParams } = new URL(req.url);

        // Get timeframe from query params (default: "monthly")
        const timeframe = searchParams.get("timeframe") || "monthly";

        let groupBy: any = {};
        let dateFormatter: (d: any) => string;

        if (timeframe === "daily") {
            groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
            dateFormatter = (d: any) => d._id; // Format YYYY-MM-DD
        } else if (timeframe === "yearly") {
            groupBy = { $year: "$createdAt" };
            dateFormatter = (d: any) => `Year ${d._id}`;
        } else {
            groupBy = { $month: "$createdAt" };
            dateFormatter = (d: any) => monthNames[d._id - 1]; // Convert month index
        }

        // Aggregate user growth from Users collection
        const userGrowth = await User.aggregate([
            { $group: { _id: groupBy, totalUsers: { $sum: 1 } } },
            { $sort: { "_id": 1 } }
        ]);

        // Aggregate freelancer growth
        const freelancerGrowth = await FreelancerInfo.aggregate([
            { $group: { _id: groupBy, freelancers: { $sum: 1 } } },
            { $sort: { "_id": 1 } }
        ]);

        // Aggregate client growth
        const clientGrowth = await ClientInfo.aggregate([
            { $group: { _id: groupBy, clients: { $sum: 1 } } },
            { $sort: { "_id": 1 } }
        ]);

        const totalUsers = await User.countDocuments();
        const totalFreelancers = await FreelancerInfo.countDocuments();
        const totalClients = await ClientInfo.countDocuments();

        // Merge user, freelancer, and client growth data
        const mergedData = userGrowth.map(userData => {
            const freelancerData = freelancerGrowth.find(d => d._id === userData._id) || { freelancers: 0 };
            const clientData = clientGrowth.find(d => d._id === userData._id) || { clients: 0 };

            return {
                date: dateFormatter(userData),
                users: userData.totalUsers,
                freelancers: freelancerData.freelancers,
                clients: clientData.clients,
                totalUsers,
                totalFreelancers,
                totalClients
            };
        });

        return NextResponse.json(mergedData, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error fetching user growth data" }, { status: 500 });
    }
}

import { AreaChart } from "./tremorChart-components/area-chart";
import { BarChart } from "./tremorChart-components/bar-chart";

const freelancerData = {
    jobsCompleted: [
        { date: "2023-01", jobs: 5 },
        { date: "2023-02", jobs: 8 },
        { date: "2023-03", jobs: 12 },
        { date: "2023-04", jobs: 15 },
        { date: "2023-05", jobs: 20 },
    ],
    earnings: [
        { month: "Jan", income: 200 },
        { month: "Feb", income: 500 },
        { month: "Mar", income: 800 },
        { month: "Apr", income: 1200 },
        { month: "May", income: 1600 },
    ],
};

const clientData = {
    jobsPosted: [
        { date: "2023-01", jobs: 3 },
        { date: "2023-02", jobs: 6 },
        { date: "2023-03", jobs: 9 },
        { date: "2023-04", jobs: 12 },
        { date: "2023-05", jobs: 15 },
    ],
    expenses: [
        { month: "Jan", cost: 300 },
        { month: "Feb", cost: 700 },
        { month: "Mar", cost: 900 },
        { month: "Apr", cost: 1400 },
        { month: "May", cost: 1800 },
    ],
};

export const FreelancerAnalytics: React.FC = () => {
    return (
        <div className="p-8 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-semibold text-black-800 text-center mb-6">Freelancer Analytics</h1>
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 shadow-lg rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Jobs Completed Over Time</h2>
                    <AreaChart data={freelancerData.jobsCompleted} index="date" categories={["jobs"]} />
                </div>
                <div className="bg-white p-6 shadow-lg rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Earnings Over Time</h2>
                    <BarChart data={freelancerData.earnings} index="month" categories={["income"]} />
                </div>
            </div>
        </div>
    );
};

export const ClientAnalytics: React.FC = () => {
    return (
        <div className="p-8 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-semibold text-black-800 text-center mb-6">Client Analytics</h1>
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 shadow-lg rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Jobs Posted Over Time</h2>
                    <AreaChart data={clientData.jobsPosted} index="date" categories={["jobs"]} />
                </div>
                <div className="bg-white p-6 shadow-lg rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Expenses Over Time</h2>
                    <BarChart data={clientData.expenses} index="month" categories={["cost"]} />
                </div>
            </div>
        </div>
    );
};

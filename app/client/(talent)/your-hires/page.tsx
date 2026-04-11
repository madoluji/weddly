import React from "react";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

const YourHiresPage: React.FC = () => {
    return (
        <PageShell
            title="Your Hires"
            description="Track and manage freelancers you have hired for your jobs"
        >
            <PageCard className="p-10 text-center">
                <h2 className="text-xl font-semibold text-gray-900">Coming soon</h2>
                <p className="mt-2 text-sm text-gray-500">
                    This section is being prepared to show your hired freelancers and engagement status.
                </p>
            </PageCard>
        </PageShell>
    );
};

export default YourHiresPage;
import { Suspense } from "react";
import AllProposalsList from "@/app/ui/client-components/proposallist/proposallist";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

const AllJobsListProps = async ({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) => {
  const { jobId } = await params;
  return (
    <PageShell
      title="Job Proposals"
      description="Review incoming proposals and take action on your job post"
    >
      <PageCard>
        <Suspense
          fallback={
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-36 w-full rounded-lg bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          }
        >
          {jobId ? <AllProposalsList jobId={jobId} /> : <p>Unable to load proposals.</p>}
        </Suspense>
      </PageCard>
    </PageShell>
  );
};

export default AllJobsListProps;

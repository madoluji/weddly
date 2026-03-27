import AllProposalsList from "@/app/ui/client-components/proposallist/proposallist";

const AllJobsListProps = async ({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) => {
  const { jobId } = await params;
  return (
    <>
      <div className="mx-auto text-center">
        {jobId ? <AllProposalsList jobId={jobId} /> : <p>Loading...</p>}
      </div>
    </>
  );
};

export default AllJobsListProps;

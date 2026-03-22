import AllProposalsList from "@/app/ui/client-components/proposallist/proposallist";

const AllJobsListProps = ({ params }: { params: { jobId: string } }) => {
  const { jobId } = params;
  return (
    <>
      <div className="mx-auto text-center">
        {jobId ? <AllProposalsList jobId={jobId} /> : <p>Loading...</p>}
      </div>
    </>
  );
};

export default AllJobsListProps;

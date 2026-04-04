import ProposalDetailsPage from "./proposalDetailsPage";

const Page = async ({
  params,
}: {
  params: Promise<{ proposalId: string }>;
}) => {
  const { proposalId } = await params;

  return <ProposalDetailsPage proposalId={proposalId} />;
};

export default Page;

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ContractDetailsPage from "./comp/workDetails";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

// import JobDetails from "./jobDetails";
// import ContractDetails from "./contractDetails";

export default async function ContractOfferPage({
  params,
}: {
  params: Promise<{ contractId: string; jobId: string }>;
}) {
  const { contractId, jobId } = await params;

  return (
    <PageShell
      header={
        <>
          <Link
            href="/user/your-contracts"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Your Contracts
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-4">Contract Details</h1>
          <p className="text-gray-500 mt-2">
            Review project progress, deliverables, and contract information
          </p>
        </>
      }
    >
      <PageCard>
        <ContractDetailsPage contractId={contractId} jobId={jobId} />
      </PageCard>
    </PageShell>
  );
}

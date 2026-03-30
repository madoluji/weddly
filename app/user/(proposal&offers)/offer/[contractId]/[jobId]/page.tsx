import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import JobDetails from "./jobDetails";
import ContractDetails from "./contractDetails";

export default async function ContractOfferPage({
  params,
}: {
  params: Promise<{ contractId: string; jobId: string }>;
}) {
  const { contractId, jobId } = await params;

  return (
    <div className="container mx-auto py-8 px-4">
      <Link
        href="/user/your-proposals"
        className="flex items-center text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Proposals
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <JobDetails jobId={jobId} />
        <ContractDetails contractId={contractId} />
      </div>
    </div>
  );
}

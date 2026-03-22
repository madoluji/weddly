import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ContractDetailsPage from "@/app/user/(proposal&offers)/your-contracts/[contractId]/[jobId]/comp/workDetails";

// import JobDetails from "./jobDetails";
// import ContractDetails from "./contractDetails";

export default function ContractOfferPage({
  params,
}: {
  params: { contractId: string; jobId: string };
}) {
  const { contractId, jobId } = params;

  return (
    <div className="container mx-auto py-8 px-4">
      <Link
        href="/user/your-contracts"
        className="flex items-center text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Your-Contracts
      </Link>

      <div className="">
        <ContractDetailsPage contractId={contractId} jobId={jobId} />
      </div>
    </div>
  );
}

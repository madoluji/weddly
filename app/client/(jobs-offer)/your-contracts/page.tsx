import { Suspense } from "react";
import ContractsList from "@/app/ui/client-components/all-contracts/contractsList";
import ContractsFilter from "@/app/ui/client-components/all-contracts/contractFilter";

export default function YourContractsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Contracts</h1>
        <p className="text-gray-500 mt-2">
          Manage and track all your freelancer contracts in one place
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-12 w-full max-w-md bg-gray-200 animate-pulse rounded-md"></div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 w-full bg-gray-200 animate-pulse rounded-lg"
                  ></div>
                ))}
              </div>
            </div>
          }
        >
          <ContractsFilter />
          <div className="mt-6">
            <ContractsList />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import ContractsList from "@/app/ui/client-components/all-contracts/contractsList";
import ContractsFilter from "@/app/ui/client-components/all-contracts/contractFilter";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

export default function YourContractsPage() {
  return (
    <PageShell
      header={
        <section className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#eef6f2_100%)] px-6 py-7 shadow-sm sm:px-8">
          <p className="font-label text-xs uppercase tracking-[0.24em] text-primary-700">
            Client Workspace
          </p>
          <h1 className="font-headline mt-3 text-3xl leading-tight text-slate-900 sm:text-4xl">
            Your contracts
          </h1>
          <p className="font-body mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Review active client bookings, monitor contract progress, and keep every agreement detail in one place.
          </p>
        </section>
      }
    >
      <PageCard>
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
      </PageCard>
    </PageShell>
  );
}

import { Suspense } from "react";
import AllJobsList from "@/app/ui/client-components/all-jobs/clientJobList";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

export default async function YourJobsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PageShell
      title="Your Jobs"
      description="Manage and track all the jobs you have posted in one place"
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
          {id ? <AllJobsList userId={id} /> : <p>Unable to load jobs.</p>}
        </Suspense>
      </PageCard>
    </PageShell>
  );
}

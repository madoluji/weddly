import PostingSkeleton from "@/app/ui/dashboard-components/skeletons/postingSkeleton";
import SearchBar from "@/app/ui/dashboard-components/talent-posting/searchBar";
import FreelancerList from "@/app/ui/dashboard-components/talent-posting/talentList";
import ExpertiseFilter from "@/app/ui/filter/experitise-level/expertiseFilter";

import React, { Suspense } from "react";

interface searchParams {
  talentName: string;
  Entry?: string;
  Intermediate?: string;
  Expert?: string;
}

// Defining the interface for component props
interface Props {
  searchParams?: Promise<searchParams> | undefined;
}

const page = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;
  // Convert searchParams to a query string
  const query = new URLSearchParams((resolvedSearchParams ?? {}) as any).toString();
  const talentName = resolvedSearchParams?.talentName?.trim() || "";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section
        className="relative overflow-hidden rounded-3xl border border-slate-200 px-6 py-8 text-white sm:px-8 sm:py-10"
        style={{
          backgroundImage:
            "linear-gradient(110deg, rgba(30,70,52,0.88), rgba(169,109,119,0.75)), url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <p className="uppercase tracking-[0.25em] text-xs md:text-sm text-primary-100">
          Talent Directory
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl font-semibold max-w-3xl leading-tight">
          Discover Wedding Planners & Coordinators
        </h1>
        <p className="mt-3 text-primary-100 max-w-2xl text-sm md:text-base">
          Find verified professionals that match your style, budget, and timeline.
          Open a profile card to review experience, portfolio, and availability.
        </p>
        {talentName && (
          <div className="mt-6 inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]">
            Search: {talentName}
          </div>
        )}
      </section>

      <Suspense>
        <SearchBar />
      </Suspense>

      <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(26,44,35,0.08)] sm:p-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <ExpertiseFilter />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <Suspense fallback={<PostingSkeleton />}>
            <FreelancerList query={query} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default page;

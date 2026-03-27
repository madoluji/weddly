import JobList from "@/app/ui/dashboard-components/job-list/jobList";
import SearchBar from "@/app/ui/dashboard-components/job-list/searchBar";
import PostingSkeleton from "@/app/ui/dashboard-components/skeletons/postingSkeleton";

import ExpertiseFilter from "@/app/ui/filter/experitise-level/expertiseFilter";
import React, { Suspense } from "react";

interface searchParams {
  title: string;
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
  const query = new URLSearchParams((resolvedSearchParams ?? {}) as any).toString();
  return (
    <div className="flex-col flex w-full gap-8 mt-5">
      <section
        className="relative overflow-hidden rounded-[2rem] border border-primary-300/70 p-8 md:p-10 text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(110deg, rgba(30,70,52,0.88), rgba(46,95,74,0.76)), url('https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <p className="uppercase tracking-[0.25em] text-xs md:text-sm text-primary-100">
          Weddly Marketplace
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl font-semibold max-w-3xl leading-tight">
          Find your next Wedding Gig
        </h1>
        <p className="mt-3 text-primary-100 max-w-2xl text-sm md:text-base">
          Discover premium opportunities with top venues, floral studios,
          planning teams, and luxury wedding service providers.
        </p>
      </section>
      <SearchBar />
      <div className="flex rounded-3xl border border-primary-300/60 bg-white/80 backdrop-blur-sm">
        <div className="border-r border-primary-300/60 px-14 w-1/4 relative ">
          <ExpertiseFilter />
        </div>
        <Suspense fallback={<PostingSkeleton />}>
          <JobList query={query} />
        </Suspense>
      </div>
    </div>
  );
};

export default page;

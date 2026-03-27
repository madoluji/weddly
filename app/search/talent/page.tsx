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

  return (
    <div className="flex-col flex w-full gap-8 mt-5">
      <section
        className="relative overflow-hidden rounded-[2rem] border border-primary-300/70 p-8 md:p-10 text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(110deg, rgba(30,70,52,0.88), rgba(169,109,119,0.75)), url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <p className="uppercase tracking-[0.25em] text-xs md:text-sm text-primary-100">
          Weddly Directory
        </p>
        <h1 className="mt-3 text-3xl md:text-5xl font-semibold max-w-3xl leading-tight">
          Explore Venues & Vendors
        </h1>
        <p className="mt-3 text-primary-100 max-w-2xl text-sm md:text-base">
          Connect with trusted wedding planners, coordinators, and premium
          service experts ready for your next celebration.
        </p>
      </section>
      <Suspense>
        <SearchBar />
      </Suspense>
      <div className="flex rounded-3xl border border-primary-300/60 bg-white/80 backdrop-blur-sm">
        <div className="border-r border-primary-300/60 px-14 w-1/4 relative ">
          <ExpertiseFilter />
        </div>
        <Suspense fallback={<PostingSkeleton />}>
          <FreelancerList query={query} />
        </Suspense>
      </div>
    </div>
  );
};

export default page;

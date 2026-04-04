import React from "react";
import ProposalList from "./proposalList";

const page = () => {
  return (
    <div className="mx-auto mt-10 w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#eef6f2_100%)] px-6 py-7 shadow-sm sm:px-8">
        <p className="font-label text-xs uppercase tracking-[0.24em] text-primary-700">
          Freelancer Workspace
        </p>
        <h1 className="font-headline mt-3 text-3xl leading-tight text-slate-900 sm:text-4xl">
          My proposals
        </h1>
        <p className="font-body mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Track submitted proposals, review incoming contract offers, and stay
          on top of the wedding gigs that are moving forward.
        </p>
      </section>

      <div className="mt-8">
        <ProposalList />
      </div>
    </div>
  );
};

export default page;

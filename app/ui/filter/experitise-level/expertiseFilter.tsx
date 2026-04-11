import React, { Suspense } from "react";
import Filter from "../filter";

const ExpertiseFilter = () => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Filter by Expertise
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Narrow down talent by experience level.
        </p>
      </div>
      <ul className="space-y-3">
        <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Suspense>
            <Filter Experience="Entry" />
          </Suspense>
        </li>
        <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Suspense>
            <Filter Experience="Intermediate" />
          </Suspense>
        </li>
        <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Suspense>
            <Filter Experience="Expert" />
          </Suspense>
        </li>
      </ul>
    </div>
  );
};

export default ExpertiseFilter;

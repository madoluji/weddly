"use client";

import React from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

interface DurationProps {
  duration: string;
  setDuration: (value: string) => void;
  isSubmitted: boolean;
}

const Duration = ({ duration, setDuration, isSubmitted }: DurationProps) => {
  const options = [
    {
      value: "less than 1 month",
      title: "Less than 1 month",
      description: "Best for quick event prep or a tightly scoped booking.",
    },
    {
      value: "1 to 3 months",
      title: "1 to 3 months",
      description: "A balanced timeline for planning, revisions, and delivery.",
    },
    {
      value: "3 to 6 month",
      title: "3 to 6 months",
      description: "Useful for larger wedding productions or multi-phase work.",
    },
    {
      value: "more than 6 months",
      title: "More than 6 months",
      description: "For long-term coordination or extended availability needs.",
    },
  ];

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-white shadow-sm">
      <div className="border-b border-[#efe5d6] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-primary-600" />
          <p className="text-2xl font-semibold text-slate-900">Timeline</p>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Give the client a realistic expectation for how long this project will
          take from kickoff to delivery.
        </p>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const active = duration === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuration(option.value)}
                className={`rounded-[1.5rem] border p-4 text-left transition ${
                  active
                    ? "border-primary-300 bg-primary-50 shadow-sm"
                    : "border-[#e6dccd] bg-[#fffdfa] hover:border-primary-200 hover:bg-white"
                }`}
              >
                <p className="text-base font-semibold text-slate-900">
                  {option.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[#efe5d6] bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Or choose from the dropdown
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={`w-full rounded-xl border bg-[#fffdfa] p-3 text-sm outline-none ${
              isSubmitted && !duration
                ? "border-red-400"
                : "border-[#e6dccd] focus:border-primary-300"
            }`}
          >
            <option value="">Select duration</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.title}
              </option>
            ))}
          </select>
        </div>

        {isSubmitted && !duration && (
          <p className="text-sm text-red-500">Duration is required.</p>
        )}
      </div>
    </div>
  );
};

export default Duration;

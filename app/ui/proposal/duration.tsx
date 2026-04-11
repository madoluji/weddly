"use client";

import React from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

interface DurationProps {
  duration: string;
  setDuration: (value: string) => void;
  customDuration: string;
  setCustomDuration: (value: string) => void;
  customDurationUnit: "days" | "months";
  setCustomDurationUnit: (value: "days" | "months") => void;
  isSubmitted: boolean;
}

const Duration = ({
  duration,
  setDuration,
  customDuration,
  setCustomDuration,
  customDurationUnit,
  setCustomDurationUnit,
  isSubmitted,
}: DurationProps) => {
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
    {
      value: "custom",
      title: "Enter your own timeline",
      description: "Use a specific timeline that better matches this project.",
    },
  ];

  const showCustomInput = duration === "custom";

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
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
                    : "border-slate-200 bg-slate-50 hover:border-primary-200 hover:bg-white"
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

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Or choose from the dropdown
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={`w-full rounded-xl border bg-slate-50 p-3 text-sm outline-none ${
              isSubmitted && !duration
                ? "border-primary-300"
                : "border-slate-200 focus:border-primary-300"
            }`}
          >
            <option value="">Select duration</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.title}
              </option>
            ))}
          </select>

          {showCustomInput && (
            <div className="mt-3">
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Enter your timeline
              </label>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Enter number"
                  className={`w-full rounded-xl border bg-slate-50 p-3 text-sm outline-none ${
                    isSubmitted && !customDuration.trim()
                      ? "border-primary-300"
                      : "border-slate-200 focus:border-primary-300"
                  }`}
                />
                <select
                  value={customDurationUnit}
                  onChange={(e) =>
                    setCustomDurationUnit(e.target.value as "days" | "months")
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-primary-300"
                >
                  <option value="days">Days</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {isSubmitted && !duration && (
          <p className="text-sm text-slate-600">Duration is required.</p>
        )}

        {isSubmitted && showCustomInput && !customDuration.trim() && (
          <p className="text-sm text-slate-600">Please enter your custom timeline.</p>
        )}
      </div>
    </div>
  );
};

export default Duration;

"use client";

import React from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

interface DeadlineProps {
  deadline: string;
  setDeadline: (value: string) => void;
  isSubmitted: boolean;
  suggestedEventDate?: string;
}

const Deadline = ({
  deadline,
  setDeadline,
  isSubmitted,
  suggestedEventDate,
}: DeadlineProps) => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const formattedSuggestedDate = suggestedEventDate
    ? new Date(suggestedEventDate).toLocaleDateString(undefined, {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <div className="w-full rounded-xl border-[1px] border-gray-300 bg-white p-3">
      <div className="my-4">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-primary-600" />
          <label className="block text-sm font-medium text-gray-700">
            Confirm Wedding Date / Service Date
          </label>
        </div>
        {formattedSuggestedDate && (
          <div className="mb-4 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-800">
            Suggested from the gig: <span className="font-semibold">{formattedSuggestedDate}</span>
          </div>
        )}
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={today} // Prevents selecting past dates
          className={`border p-3 rounded-md w-1/3 text-sm mt-1 ${
            isSubmitted && !deadline ? "border-red-500" : "border-gray-300"
          }`}
        />
        {isSubmitted && !deadline && (
          <p className="mt-1 text-sm text-red-500">
            Wedding date is required.
          </p>
        )}
        <p className="mt-3 text-sm text-gray-500">
          Use the actual wedding day or the service date the freelancer is being booked for.
        </p>
      </div>
    </div>
  );
};

export default Deadline;

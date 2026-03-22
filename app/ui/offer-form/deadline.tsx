"use client";

import React from "react";

interface DeadlineProps {
  deadline: string;
  setDeadline: (value: string) => void;
  isSubmitted: boolean;
}

const Deadline = ({ deadline, setDeadline, isSubmitted }: DeadlineProps) => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  return (
    <div className="border-[1px] border-gray-300 rounded-xl p-3 w-full bg-white">
      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Project Deadline
        </label>
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
          <p className="text-red-500 text-sm mt-1">Deadline is required.</p>
        )}
      </div>
    </div>
  );
};

export default Deadline;

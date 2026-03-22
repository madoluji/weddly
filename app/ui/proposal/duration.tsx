"use client";

import React from "react";

interface DurationProps {
  duration: string;
  setDuration: (value: string) => void;
  isSubmitted: boolean;
}

const Duration = ({ duration, setDuration, isSubmitted }: DurationProps) => {
  return (
    <div className="border-[1px] border-gray-300 rounded-xl p-3 w-full bg-white">
      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How long will this project take?
        </label>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className={`border p-3 rounded-md w-1/4 text-sm mt-1 ${
            isSubmitted && !duration ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select duration</option>
          <option value="less than 1 month">Less than 1 month</option>
          <option value="1 to 3 months">Less than 3 months</option>
          <option value="3 to 6 month">Less than 6 months</option>
          <option value="more than 6 months">more than 6 months</option>
        </select>
        {isSubmitted && !duration && (
          <p className="text-red-500 text-sm mt-1">Duration is required.</p>
        )}
      </div>
    </div>
  );
};

export default Duration;

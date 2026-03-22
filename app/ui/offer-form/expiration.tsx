"use client";

import React from "react";

interface ExpirationProps {
  expiration: string;
  setExpiration: (value: string) => void;
  isSubmitted: boolean;
}

const Expiration = ({
  expiration,
  setExpiration,
  isSubmitted,
}: ExpirationProps) => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  return (
    <div className="border-[1px] border-gray-300 rounded-xl p-3 w-full bg-white">
      <div className="my-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Set Offer Expiration Date
        </label>
        <input
          type="date"
          value={expiration}
          onChange={(e) => setExpiration(e.target.value)}
          min={today} // Prevents selecting past dates
          className={`border p-3 rounded-md w-1/3 text-sm mt-1 ${
            isSubmitted && !expiration ? "border-red-500" : "border-gray-300"
          }`}
        />
        {isSubmitted && !expiration && (
          <p className="text-red-500 text-sm mt-1">
            Expiration date is required.
          </p>
        )}
      </div>
    </div>
  );
};

export default Expiration;

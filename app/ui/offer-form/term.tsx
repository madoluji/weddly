"use client";

import React, { useState } from "react";

interface TermsProps {
  bidAmount: string;
  setBidAmount: (value: string) => void;
  isSubmitted: boolean;
  pricingType: string;
  setPricingType: (value: string) => void;
}

const Terms = ({
  bidAmount,
  setBidAmount,
  isSubmitted,
  pricingType,
  setPricingType,
}: TermsProps) => {
  const [isTouched, setIsTouched] = useState(false);

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || parseFloat(value) >= 0) {
      setBidAmount(value);
    }
  };

  const isFixedPrice = pricingType === "fixed";
  const minBid = isFixedPrice ? 10 : 5; // $10 min for Fixed, $5 min for Hourly

  const isValidBid = bidAmount && parseFloat(bidAmount) >= minBid;

  // Platform Fee Calculation
  const platformCut = isValidBid
    ? (parseFloat(bidAmount) * 0.1).toFixed(2)
    : "0.00";

  const totalAmount = isValidBid ? parseFloat(bidAmount).toFixed(2) : "0.00";

  const freelancerReceives = isValidBid
    ? (parseFloat(bidAmount) * 0.9).toFixed(2)
    : "0.00";

  return (
    <div className="border-[1px] border-gray-300 rounded-xl p-6 w-full bg-white">
      <p className="font-semibold text-2xl mb-4">Terms</p>

      {/* Pricing Type Selector */}
      <div className="flex items-center gap-4">
        <label className="text-lg font-medium">Choose Pricing Type: </label>
        <select
          value={pricingType}
          onChange={(e) => setPricingType(e.target.value as "fixed" | "hourly")}
          className="border px-7  rounded-md text-lg "
        >
          <option value="hourly">Hourly Rate</option>
          <option value="fixed">Fixed Price</option>
        </select>
      </div>

      {/* Bid Amount Input */}
      <div className="mt-6 flex gap-24 justify-between items-center">
        <div>
          <label className="text-lg font-lg mb-2 mr-10">
            {isFixedPrice
              ? "Enter Your Fixed Bid Amount"
              : "Enter Your Hourly Rate"}
          </label>
          <span className="text-gray-500">{isFixedPrice ? "$" : "$/hr"}</span>
          <input
            type="number"
            min={minBid}
            value={bidAmount}
            onChange={handleBidChange}
            onBlur={() => setIsTouched(true)}
            className={`border p-1 rounded-md text-lg text-center ${
              (isSubmitted || isTouched) &&
              (!bidAmount || parseFloat(bidAmount) < minBid)
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder={`Enter ${isFixedPrice ? "fixed bid amount" : "hourly rate"}`}
          />
        </div>
      </div>

      {/* Validation Message */}
      {(isSubmitted || isTouched) &&
        (!bidAmount || parseFloat(bidAmount) < minBid) && (
          <p className="text-red-500 text-sm mt-1">
            The minimum {isFixedPrice ? "bid amount" : "hourly rate"} is $
            {minBid}.
          </p>
        )}
    </div>
  );
};

export default Terms;

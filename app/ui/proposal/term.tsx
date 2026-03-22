"use client";

import React, { useState } from "react";

interface TermsProps {
  bidAmount: string;
  setBidAmount: (value: string) => void;
  isSubmitted: boolean;
}

const Terms = ({ bidAmount, setBidAmount, isSubmitted }: TermsProps) => {
  const [isTouched, setIsTouched] = useState(false);

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || parseFloat(value) >= 0) {
      setBidAmount(value);
    }
  };

  const isValidBid = bidAmount && parseFloat(bidAmount) >= 10;

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
      <div className="">
        <div className="flex gap-24 justify-between items-center mt-8">
          <div>
            <label className="text-lg font-lg mb-2 mr-10">
              Enter Your Bid Amount
            </label>
            <input
              type="number"
              min="10"
              value={bidAmount}
              onChange={handleBidChange}
              onBlur={() => setIsTouched(true)}
              className={`border p-1 rounded-md text-lg text-center ${
                (isSubmitted || isTouched) &&
                (!bidAmount || parseFloat(bidAmount) < 10)
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter bid amount"
            />
          </div>
          <div className="flex flex-col text-gray-500">
            <div className=" p-2">
              <div className="flex justify-between gap-14 font-medium">
                <span>Total Bid Amount</span>
                <span className="text-black">${totalAmount}</span>
              </div>
            </div>
            <div className=" p-2">
              <div className="flex justify-between gap-14 font-medium">
                <span>Service Fee (10%)</span>
                <span className="text-red-500">-${platformCut}</span>
              </div>
            </div>
            <div className="p-2">
              <div className="flex justify-between gap-14 font-medium">
                <span>You’ll Receive</span>
                <span className="text-green-600">${freelancerReceives}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {(isSubmitted || isTouched) &&
        (!bidAmount || parseFloat(bidAmount) < 10) && (
          <p className="text-red-500 text-sm mt-1">
            The minimum bid amount is $10.
          </p>
        )}
    </div>
  );
};

export default Terms;

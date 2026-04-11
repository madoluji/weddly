"use client";

import React, { useState } from "react";
import {
  BanknotesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

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
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <p className="text-2xl font-semibold text-slate-900">Pricing terms</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Set a clear rate so the client understands the scope and what you will
          take home after platform fees.
        </p>
      </div>

      <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <BanknotesIcon className="h-4 w-4 text-primary-600" />
            Your bid amount
          </label>
          <div
            className={`mt-4 flex items-center rounded-[1.25rem] border bg-white px-4 py-3 shadow-sm transition ${
              (isSubmitted || isTouched) &&
              (!bidAmount || parseFloat(bidAmount) < 10)
                ? "border-primary-300 ring-2 ring-primary-100"
                : "border-slate-200 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100"
            }`}
          >
            <span className="pr-3 text-2xl font-semibold text-slate-400">
              Rs
            </span>
            <input
              type="number"
              min="10"
              value={bidAmount}
              onChange={handleBidChange}
              onBlur={() => setIsTouched(true)}
              className="w-full bg-transparent text-left text-3xl font-semibold text-slate-900 placeholder:text-slate-300"
              placeholder="15000"
            />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Enter the total amount you want to charge for this booking.
          </p>
          {(isSubmitted || isTouched) &&
            (!bidAmount || parseFloat(bidAmount) < 10) && (
              <p className="mt-3 text-sm text-slate-600">
                The minimum bid amount is Rs 10.
              </p>
            )}
        </div>

        <div className="rounded-[1.5rem] border border-primary-100 bg-primary-50/60 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary-700">
            <ShieldCheckIcon className="h-4 w-4" />
            Earnings preview
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-600">
              <span>Total bid amount</span>
              <span className="text-base text-slate-900">Rs {totalAmount}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-600">
              <span>Service fee (10%)</span>
              <span className="text-base text-slate-700">-Rs {platformCut}</span>
            </div>
            <div className="rounded-2xl cta-gradient px-4 py-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">
                  You will receive
                </span>
                <span className="text-xl font-semibold">
                  Rs {freelancerReceives}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-primary-800/80">
            This estimate uses the current 10% platform fee shown on the form.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;

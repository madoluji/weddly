"use client";

import React from "react";
import FinanceSkeletonCard from "./skeletons/financeSkeletonCard"; // Assuming FinanceSkeletonCard is the skeleton component
import { useDashboardCards } from "./DashboardCardsProvider";

const FinanceCard = () => {
  const { data, loading } = useDashboardCards();
  const earnings = data?.finances.totalFreelancerAmount || 0;
  const expenses = data?.finances.totalClientAmount || 0;

  if (loading) {
    return <FinanceSkeletonCard />;
  }

  return (
    <div className="relative flex h-[250px] w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-3xl border border-primary-100/70 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <h1 className="font-headline text-2xl font-medium leading-tight text-slate-900 xl:text-[1.7rem]">
        Earning & Expenses
      </h1>
      <div className="flex w-full flex-col gap-2 divide-y divide-slate-200">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-slate-500">Earning</p>
          <h1 className="text-center text-2xl font-medium text-primary-700">Rs {earnings}</h1>
        </div>
        <div className="flex flex-col gap-1 pt-2">
          <p className="text-sm font-medium text-slate-500">Expenses</p>
          <h1 className="text-center text-2xl font-medium text-slate-700">Rs {expenses}</h1>
        </div>
      </div>
    </div>
  );
};

export default FinanceCard;

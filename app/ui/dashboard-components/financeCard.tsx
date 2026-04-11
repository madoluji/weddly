"use client";

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";
import React, { useEffect, useState } from "react";
import FinanceSkeletonCard from "./skeletons/financeSkeletonCard"; // Assuming FinanceSkeletonCard is the skeleton component

const FinanceCard = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [earnings, setEarnings] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    if (!userId) return;

    const fetchPayments = async () => {
      try {
        setLoading(true); // Start loading
        const response = await fetchWithAuth(`/api/fetchpayment/${userId}`, {
          next: { revalidate: 3600 }, // Supports Next.js revalidation
        });

        const data = await response.json();

        if (data) {
          setEarnings(data.totalFreelancerAmount);
          setExpenses(data.totalClientAmount);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchPayments();
  }, [userId]);

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

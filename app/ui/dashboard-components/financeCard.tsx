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
        console.log(data);

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
    <div className="flex min-w-[250px] w-[16%] flex-col gap-5 justify-center items-center relative rounded-3xl h-[250px] p-5 overflow-hidden shadow-[0_10px_20px_rgba(228,228,228,_0.7)]">
      <h1 className="text-2xl font-medium"> Earning & Expenses</h1>
      <div className="w-full flex gap-1 divide-y-2 flex-col">
        <div className="flex flex-col gap-1">
          <p className="text--400 text-sm">Earning</p>
          <h1 className="text-green-600 text-center text-2xl">Rs {earnings}</h1>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-gray-400 text-sm">Expenses</p>
          <h1 className="text-danger-600 text-center text-2xl">
            Rs {expenses}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default FinanceCard;

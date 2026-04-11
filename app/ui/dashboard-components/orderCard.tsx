"use client"; // Required for Next.js client components

import { useEffect, useState } from "react";
import { CheckBadgeIcon, ClockIcon } from "@heroicons/react/24/solid";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";
import OrderSkeletonCard from "./skeletons/orderSkeletonCard"; // Assuming OrderSkeletonCard is the skeleton component

interface Props {
  mode: string;
}

const OrderCard = ({ mode }: Props) => {
  const [activeCount, setActiveCount] = useState(0);
  const [completeCount, setCompleteCount] = useState(0);
  const [loading, setLoading] = useState(true); // Loading state

  const { session } = useAuth();
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        setLoading(true); // Start loading
        const response = await fetchWithAuth(
          `/api/contractsFetchwithcount?userId=${userId}`
        );
        const data = await response.json();
        setActiveCount(data.activeCount || 0);
        setCompleteCount(data.completeCount || 0);
      } catch (error) {
        console.error("Error fetching contract data:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (userId) {
      fetchContractData();
    }
  }, [userId]);

  if (loading) {
    return <OrderSkeletonCard />;
  }

  return (
    <div
      className="relative flex h-[250px] w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl border border-primary-100/70 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
    >
      <h1 className="font-headline text-2xl font-medium leading-none text-slate-900 xl:text-[1.7rem]">
        {mode === "Client" ? "Your Gigs" : "Bookings"}
      </h1>
      <div className="flex w-full flex-col gap-3">
        {/* Pending Orders */}
        <div className="relative rounded-2xl border border-primary-100 bg-primary-50 px-3 py-2 pl-10 text-primary-800">
          <p className="text-base font-medium leading-none">{activeCount} Pending</p>
          <ClockIcon className="absolute left-3 top-1/2 h-4 w-5 -translate-y-[50%]" />
        </div>

        {/* Completed Orders */}
        <div className="relative rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 pl-10 text-slate-700">
          <p className="text-base font-medium leading-none">{completeCount} Completed</p>
          <CheckBadgeIcon className="absolute left-3 top-1/2 h-4 w-5 -translate-y-[50%]" />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;

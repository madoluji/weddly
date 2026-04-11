"use client";

import React, { useEffect, useState } from "react";
import SliderRating from "./slider"; // Assuming SliderRating is a component that shows a rating slider
import clsx from "clsx";
import { usePathname } from "next/navigation"; // Import usePathname from Next.js
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";
import RatingSkeletonCard from "../skeletons/ratingSkeletonCard"; // Assuming RatingSkeletonCard is the skeleton component

const Rating = () => {
  const pathname = usePathname(); // Get the current pathname
  const initialValue = 0; // Initial rating value
  const [count, setCount] = useState(initialValue); // State to hold the current rating value
  const [rating, setRating] = useState(0); // State to hold the fetched rating
  const [loading, setLoading] = useState(true); // Loading state
  const duration = 100; // Duration of the animation in milliseconds

  const { session } = useAuth();
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;

    const fetchPayments = async () => {
      try {
        const isFreelancerPath = pathname.startsWith("/user");
        setLoading(true); // Start loading
        const response = await fetchWithAuth(
          `/api/reviews?mode=${isFreelancerPath ? "freelancerRating" : "clientRating"}`,
          {
            next: { revalidate: 3600 }, // Supports Next.js revalidation
          }
        );

        const { reviews } = await response.json();
        setRating(reviews?.rating || 0); // Set the rating from the response
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchPayments();
  }, [pathname, userId]);

  // Animation effect for rating
  useEffect(() => {
    const startValue = initialValue;
    const targetValue = rating;
    const steps = Math.abs(targetValue - startValue) * 10; // Number of increments (0.1 steps)
    const interval = steps > 0 ? Math.floor(duration / steps) : duration; // Calculate interval

    const incrementCount = (i: number) => {
      if (i < targetValue) {
        setCount(parseFloat(i.toFixed(1))); // Update the count
        setTimeout(() => incrementCount(i + 0.1), interval); // Increment the count
      } else {
        setCount(targetValue); // Ensure the count stops exactly at the target value
      }
    };

    incrementCount(startValue); // Start the increment process
  }, [rating, initialValue, duration]); // Re-run animation when rating changes

  if (loading) {
    return <RatingSkeletonCard />;
  }

  return (
    <div className="relative flex h-[250px] w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-3xl border border-primary-100/70 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <h1 className="font-headline text-2xl font-medium leading-none text-slate-900 xl:text-[1.7rem]">Rating</h1>
      <h1
        className={clsx("text-6xl font-medium text-primary-700")}
      >
        {count}
      </h1>
      <div className="w-full">
        <SliderRating rating={rating} />
      </div>
    </div>
  );
};

export default Rating;

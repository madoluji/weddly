"use client";

import React, { useEffect, useState } from "react";
import SliderRating from "./slider"; // Assuming SliderRating is a component that shows a rating slider
import clsx from "clsx";
import { usePathname } from "next/navigation"; // Import usePathname from Next.js
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";
import RatingSkeletonCard from "../skeletons/ratingSkeletonCard"; // Assuming RatingSkeletonCard is the skeleton component
import { set } from "mongoose";

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
        console.log(reviews);
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
    <div className="min-w-[250px] w-[15%] flex flex-col gap-1 justify-center items-center relative rounded-3xl h-[250px] p-5 overflow-hidden shadow-[0_10px_20px_rgba(228,228,228,_0.7)]">
      <h1 className="text-3xl font-medium">Rating</h1>
      <h1
        className={clsx("text-8xl font-semibold", {
          "text-red-700": count <= 1,
          "text-red-500": count > 1 && count <= 2,
          "text-amber-500": count > 2 && count <= 3,
          "text-green-400": count > 3 && count <= 4,
          "text-green-600": count > 4,
        })}
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

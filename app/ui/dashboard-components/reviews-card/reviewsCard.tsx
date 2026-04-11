"use client";
import { useEffect, useState } from "react";
import StarRating from "./starRating";
import SafeImage from "@/app/ui/shared/SafeImage";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useDashboardCards } from "../DashboardCardsProvider";

interface Review {
  reviewerId: {
    name: string;
    lastName: string;
    profilePicture?: string;
  };
  comment: string;
  rating: number;
}

const ReviewsCard = () => {
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data, loading, error } = useDashboardCards();

  useEffect(() => {
    setRecentReviews(Array.isArray(data?.recentReviews) ? data.recentReviews : []);
  }, [data?.recentReviews]);

  const handleNext = () => {
    if (recentReviews.length <= 2) return;
    setCurrentIndex((prevIndex) =>
      prevIndex + 2 >= recentReviews.length ? 0 : prevIndex + 2
    );
  };

  const handlePrev = () => {
    if (recentReviews.length <= 2) return;
    setCurrentIndex((prevIndex) =>
      prevIndex - 2 < 0 ? Math.max(0, recentReviews.length - 2) : prevIndex - 2
    );
  };

  // Helper function to handle text truncation
  const truncateString = (str: string, num: number) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + "...";
  };

  const visibleReviews = recentReviews.slice(currentIndex, currentIndex + 2);

  return (
    <div className="relative flex h-[250px] w-full flex-col gap-2 overflow-hidden rounded-3xl border border-primary-100/70 bg-white px-5 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-2xl font-medium leading-none text-slate-900 xl:text-[1.7rem]">Reviews</h1>
        {recentReviews.length > 2 && (
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              className="rounded-full border border-primary-100 p-1 text-primary-700 transition-colors hover:bg-primary-50"
              aria-label="Previous reviews"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="rounded-full border border-primary-100 p-1 text-primary-700 transition-colors hover:bg-primary-50"
              aria-label="Next reviews"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative flex-1">
        {/* Loading State */}
        {loading && <p className="text-sm text-slate-400">Loading reviews...</p>}

        {/* Error State */}
        {error && <p className="text-sm text-slate-500">Unable to load reviews. Please try again later.</p>}

        <AnimatePresence mode="wait">
          {!loading && !error && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3"
            >
              {visibleReviews.length > 0 ? (
                visibleReviews.map((review: Review, index: number) => (
                  <motion.div
                    key={currentIndex + index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="w-full flex gap-3 flex-row rounded-xl border border-transparent px-2 py-1 transition hover:border-primary-100 hover:bg-primary-50/40"
                  >
                    <div className="flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="h-10 w-10 overflow-hidden rounded-full border border-primary-100 bg-primary-50"
                      >
                        <SafeImage
                          width={40}
                          height={40}
                          src={review.reviewerId.profilePicture || "/images/image.png"}
                          alt="profile"
                          className="object-cover h-full w-full"
                        />
                      </motion.div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[0.95rem] font-medium leading-tight text-slate-800">
                        {review.reviewerId.name}{review.reviewerId.lastName ? ` ${review.reviewerId.lastName}` : ""}
                      </p>
                      <div className="flex justify-start items-center text-[.7rem] gap-2">
                        <StarRating rating={review.rating} /> 
                        <span className="border-l border-slate-200 pl-2 text-slate-400">1 week ago</span>
                      </div>
                      <p className="text-[.75rem] leading-normal text-slate-600">
                        {truncateString(review.comment || "No comment provided.", 90)}
                        {review.comment && review.comment.length > 90 && (
                          <button className="ml-1 font-semibold text-primary-700">
                            Read More
                          </button>
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-[.9rem] text-slate-600">No reviews available.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      {recentReviews.length > 0 && (
        <div className="flex justify-center gap-1 mt-auto mb-2">
          {Array.from({ length: Math.ceil(recentReviews.length / 2) }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0.8 }}
              animate={{
                scale: Math.floor(currentIndex / 2) === i ? 1 : 0.8,
                width: Math.floor(currentIndex / 2) === i ? "16px" : "6px",
                backgroundColor: Math.floor(currentIndex / 2) === i ? "#2f5f4a" : "#D1D5DB",
              }}
              transition={{ duration: 0.3 }}
              className="block h-1.5 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsCard;

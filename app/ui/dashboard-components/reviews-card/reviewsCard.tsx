"use client";
import { useEffect, useState } from "react";
import StarRating from "./starRating";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import SafeImage from "@/app/ui/shared/SafeImage";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

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
  // --- Missing State Variables Added Here ---
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Merged the two useEffects into one clean function
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth("/api/reviews?recentReview=true");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Ensure we are accessing the correct property from your API response
        if (data && Array.isArray(data.recentReviews)) {
          setRecentReviews(data.recentReviews);
        } else {
          console.error("Unexpected response format:", data);
          setError("Unexpected data format received.");
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Unable to load reviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

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
    <div className="flex flex-col max-w-[600px] w-[40%] min-w-[250px] gap-2 relative rounded-3xl h-[250px] px-5 py-2 overflow-hidden shadow-[0_10px_20px_rgba(228,228,228,_0.7)] bg-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium">Reviews</h1>
        {recentReviews.length > 2 && (
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Previous reviews"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Next reviews"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative flex-1">
        {/* Loading State */}
        {loading && <p className="text-gray-400 text-sm">Loading reviews...</p>}

        {/* Error State */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

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
                    className="w-full flex gap-3 flex-row"
                  >
                    <div className="flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-yellow-400 rounded-full h-10 w-10 flex items-center justify-center overflow-hidden"
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
                      <p className="text-gray-800 font-medium text-[1rem] leading-tight">
                        {review.reviewerId.name}{review.reviewerId.lastName ? ` ${review.reviewerId.lastName}` : ""}
                      </p>
                      <div className="flex justify-start items-center text-[.7rem] gap-2">
                        <StarRating rating={review.rating} /> 
                        <span className="text-gray-400 border-l pl-2">1 week ago</span>
                      </div>
                      <p className="text-gray-600 text-[.75rem] leading-normal">
                        {truncateString(review.comment || "No comment provided.", 90)}
                        {review.comment && review.comment.length > 90 && (
                          <button className="text-yellow-600 font-semibold ml-1">
                            Read More
                          </button>
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 text-[.9rem]">No reviews available.</p>
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
                backgroundColor: Math.floor(currentIndex / 2) === i ? "#FBBF24" : "#D1D5DB",
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
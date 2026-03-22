"use client";
import { useState, useEffect } from "react";
import type React from "react";

import { fetchWithAuth } from "../lib/fetchWIthAuth";
import SliderRating from "./dashboard-components/rating-card/slider";
import Emoji from "./dashboard-components/rating-card/Emoji";
import CardSkeleton from "./dashboard-components/skeletons/cardSkeleton"; // Assuming CardSkeleton is the skeleton component

interface ReviewFormProps {
  contractId?: string | "";
  reviewerId?: string | "";
  revieweeId?: string | "";
}

const ReviewForm = ({
  contractId,
  reviewerId,
  revieweeId,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );
  const [submitted, setSubmitted] = useState(false);
  const [animateRating, setAnimateRating] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Trigger animation when component mounts
  useEffect(() => {
    setAnimateRating(true);
  }, []);

  // Check if the review has already been submitted
  useEffect(() => {
    const checkReviewStatus = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(
          `/api/reviews?contractId=${contractId}&reviewerId=${reviewerId}&revieweeId=${revieweeId}`
        );
        const data = await res.json();
        if (data.reviewed) {
          setAlreadyReviewed(true);
        }
      } catch (error) {
        console.error("Error checking review status:", error);
      }
      setLoading(false);
    };

    checkReviewStatus();
  }, [contractId, reviewerId, revieweeId]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType(null);

    try {
      const res = await fetchWithAuth("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          reviewerId,
          revieweeId,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMessage("Review submitted successfully!");
        setMessageType("success");
        setComment("");
        setSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
          setSubmitted(false);
          setMessage("");
        }, 3000);
      } else {
        setMessage(`Error: ${data.message || "Failed to submit review"}`);
        setMessageType("error");
      }
    } catch (error) {
      setLoading(false);
      setMessage("An unexpected error occurred. Please try again.");
      setMessageType("error");
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    // Reset animation to trigger it again
    setAnimateRating(false);
    setTimeout(() => setAnimateRating(true), 50);
  };

  if (loading) {
    return <CardSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-md border border-gray-100">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-primary-100 to-primary-300">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-primary-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <h2 className="text-xl font-semibold text-gray-800">
            Submit a Review
          </h2>
        </div>
      </div>

      <div className="p-6">
        {alreadyReviewed ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              You have already submitted a review for this project.
            </h3>
            <p className="text-gray-600 text-center mt-2">
              Thank you for your feedback!
            </p>
          </div>
        ) : submitted ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Thank you for your review!
            </h3>
            <p className="text-gray-600 text-center mt-2">
              Your feedback helps improve our community.
            </p>
          </div>
        ) : (
          <form onSubmit={submitReview} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Your Rating
              </label>

              <div className="flex flex-col items-center space-y-6">
                {/* Rating Card */}
                <div className="w-full flex justify-center"></div>

                {/* Emoji Feedback */}
                <div className="flex justify-center">
                  <Emoji rating={rating} />
                </div>

                {/* Rating Slider */}
                <div className="w-full mt-2">
                  <SliderRating rating={rating} />
                </div>

                {/* Rating Selector */}
                <div className="flex justify-between w-full max-w-xs">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRatingChange(value)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        rating === value
                          ? "bg-primary-500 text-white scale-110 shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Your Review
              </label>
              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[120px] transition duration-200"
                  placeholder="Share your experience working on this project..."
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {comment.length} characters
                </div>
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-md ${
                  messageType === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {messageType === "success" ? (
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{message}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-200 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                "Submit Review"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewForm;

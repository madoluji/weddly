"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { fetchWithAuth } from "../lib/fetchWIthAuth";

// Loading spinner animation
const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <motion.div
      className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  </div>
);

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying...");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setMessage("Invalid or missing token");
        setStatus("error");
        return;
      }

      try {
        const res = await fetchWithAuth(
          `/api/email-verification?token=${token}`
        );

        if (!res.ok) {
          const errorData = await res.json();
          setMessage(errorData.message || "Verification failed");
          setStatus("error");
          return;
        }

        setMessage("Email verified successfully! 🎉");
        setStatus("success");
      } catch (error) {
        console.error("Error verifying email:", error);
        setMessage("An unexpected error occurred. Please try again.");
        setStatus("error");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-700 to-primary-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg text-center w-96"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h1
          className="text-2xl font-bold mb-4 text-primary-500"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Email Verification
        </motion.h1>

        {status === "loading" && <LoadingSpinner />}

        <motion.p
          className={`text-gray-700 mt-4 ${
            status === "success"
              ? "text-green-500"
              : status === "error"
                ? "text-red-500"
                : ""
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {message}
        </motion.p>

        {status === "success" && (
          <motion.div
            className="mt-4 flex justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <CheckCircleIcon className="w-16 h-16 text-green-500" />
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            className="mt-4 flex justify-center"
            initial={{ x: -5 }}
            animate={{ x: [5, -5, 5, -5, 0] }}
            transition={{ duration: 0.3 }}
          >
            <XCircleIcon className="w-16 h-16 text-red-500" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ✅ Wrap in <Suspense> before exporting
const Verify = () => (
  <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
    <VerifyEmail />
  </Suspense>
);

export default Verify;

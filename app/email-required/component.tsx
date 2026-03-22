"use client";

import React, { useState } from "react";
import { fetchWithAuth } from "../lib/fetchWIthAuth";

const EmailVerification = () => {
  const [email, setEmail] = useState("user@example.com"); // Replace with actual email from context/state
  const [isSent, setIsSent] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const sendVerificationLink = async () => {
    try {
      const res = await fetchWithAuth("/api/send-verification-mail", {
        method: "POST",
      });
      if (res.ok) {
        setIsSent(true);
        alert("Verification link sent to " + email);
      } else {
        alert("Failed to send verification link. Please try again.");
      }
    } catch (error) {
      alert("An error occurred while sending the verification link.");
    }
  };

  const updateEmail = () => {
    if (newEmail) {
      setEmail(newEmail);
      setIsUpdating(false);
      setIsSent(false); // Reset verification status
      alert("Email updated. Please verify your new email.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold">Email Verification</h2>
      {!isUpdating ? (
        <>
          <p className="mt-4">
            Please verify your email: <strong>{email}</strong>
          </p>
          {!isSent ? (
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={sendVerificationLink}
            >
              Send Verification Link
            </button>
          ) : (
            <p className="mt-4 text-green-600">
              Verification link sent. Check your inbox.
            </p>
          )}
          <button
            className="mt-2 text-blue-500 underline hover:text-blue-700"
            onClick={() => setIsUpdating(true)}
          >
            Change Email
          </button>
        </>
      ) : (
        <>
          <input
            type="email"
            placeholder="Enter new email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="mt-4 p-2 border rounded"
          />
          <button
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={updateEmail}
          >
            Update Email
          </button>
        </>
      )}
    </div>
  );
};

export default EmailVerification;

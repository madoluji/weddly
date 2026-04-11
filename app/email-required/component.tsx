"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "../lib/fetchWIthAuth";
import { useAuth } from "../providers";

const EmailVerification = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, update: updateSession } = useAuth();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);
  const [redirectTo, setRedirectTo] = useState<string>("/user/best-matches");

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }

    // Get the redirect URL from query params and store it in sessionStorage (more reliable than localStorage)
    const redirect = searchParams.get("redirect");
    if (redirect) {
      const decodedRedirect = decodeURIComponent(redirect);
      setRedirectTo(decodedRedirect);
      // Store in sessionStorage which persists during the verification flow
      if (typeof window !== "undefined") {
        sessionStorage.setItem("emailVerificationRedirect", decodedRedirect);
        console.log("📝 Stored redirect URL:", decodedRedirect);
      }
    } else {
      // No redirect provided, check if it's already in storage from a previous attempt
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("emailVerificationRedirect");
        if (stored) {
          setRedirectTo(stored);
          console.log("📝 Using previously stored redirect URL:", stored);
        }
      }
    }
  }, [session?.user?.email, searchParams]);

  const sendVerificationLink = async () => {
    setIsSending(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/send-verification-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirectUrl: redirectTo }),
      });
      if (res.ok) {
        setIsSent(true);
        setLastSentTime(Date.now());
        console.log("📧 Verification email sent with redirect:", redirectTo);
        alert("✓ Verification link sent to " + email + "\n\nPlease check your inbox and spam/promotions folder.");
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || "Failed to send verification link. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while sending the verification link. Please try again.");
      console.error("Error sending verification link:", err);
    } finally {
      setIsSending(false);
    }
  };

  const updateEmail = async () => {
    if (!newEmail) {
      alert("Please enter a new email address.");
      return;
    }

    try {
      const res = await fetchWithAuth("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });

      if (res.ok) {
        // First update the local state
        setEmail(newEmail);
        setNewEmail("");
        setIsUpdating(false);
        setIsSent(false);
        setError(null);
        
        // Wait a moment to ensure DB is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update the session with new email
        try {
          await updateSession({ email: newEmail });
        } catch (sessionError) {
          console.warn("Session update warning:", sessionError);
        }
        
        alert("✓ Email updated successfully to " + newEmail + ".\n\nPlease verify your new email.");
      } else {
        try {
          const errorData = await res.json();
          setError(errorData.message || "Failed to update email. Please try again.");
        } catch {
          setError("Failed to update email. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error updating email:", error);
      setError("An error occurred while updating the email.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-center mb-2">Email Verification</h2>
        <p className="text-center text-gray-600 mb-6">Verify your email to continue</p>

        {!isUpdating ? (
          <>
            {/* Current Email Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Email Address:</p>
              <p className="text-lg font-semibold text-gray-800">{email}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700">⚠ {error}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-gray-700">
              <p className="font-semibold mb-2">📝 Instructions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Click the button below to send a verification link</li>
                <li>Check your <strong>Inbox</strong> and <strong>Spam/Promotions</strong> folder</li>
                <li>Click the verification link in the email</li>
                <li>You'll be verified and can submit proposals</li>
              </ul>
            </div>

            {/* Send Verification Button */}
            {!isSent ? (
              <button
                onClick={sendVerificationLink}
                disabled={isSending}
                className="w-full mb-3 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isSending ? "Sending..." : "Send Verification Link"}
              </button>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-700 font-semibold">✓ Verification link sent!</p>
                  <p className="text-xs text-green-600 mt-1">Check your email and spam folder</p>
                </div>
                <button
                  onClick={sendVerificationLink}
                  disabled={isSending}
                  className="w-full mb-3 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isSending ? "Resending..." : "Resend Verification Link"}
                </button>
              </>
            )}

            {/* Change Email Button */}
            <button
              onClick={() => {
                setIsUpdating(true);
                setError(null);
              }}
              className="w-full px-4 py-2 text-blue-600 font-semibold hover:text-blue-700 underline transition"
            >
              Change Email Address
            </button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter new email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">⚠ {error}</p>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={updateEmail}
                  className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  Update Email
                </button>
                <button
                  onClick={() => {
                    setIsUpdating(false);
                    setNewEmail("");
                    setError(null);
                  }}
                  className="w-full px-4 py-2 text-gray-600 font-semibold hover:text-gray-700 underline transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;

"use client";
import React, { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { usePathname, useRouter } from "next/navigation"; // ✅ Use this instead of next/router
import { useUserAccess } from "./UserAccessProvider";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

export interface KYCStatusResponse {
  kycVerified: boolean;
  emailVerified: boolean;
}

const KYCStatus: React.FC = () => {
  const { session, status } = useAuth();

  const [isVisible, setIsVisible] = useState(true);
  const [cacheBuster, setCacheBuster] = useState("");
  const router = useRouter(); // ✅ Use useRouter from next/navigation
  const pathname = usePathname();
  const id = session?.user.id;
  
  // Add cache buster to verification-status endpoint to force fresh data
  const verificationEndpoint = `/verification-status${cacheBuster}`;
  const { data: verificationData, error } = useFetch<KYCStatusResponse>(
    verificationEndpoint,
    { enabled: status === "authenticated" }
  );

  const { data: userData, loading } = useUserAccess();

  // Check if we just completed email verification and need to refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      const verificationTime = sessionStorage.getItem("verificationStatusTime") || localStorage.getItem("verificationStatusTime");
      if (verificationTime) {
        console.log("🔄 Cache buster detected, forcing verification status refetch");
        // Force refresh with cache buster
        setCacheBuster(`?t=${verificationTime}`);
        // Clean up after using it
        sessionStorage.removeItem("verificationStatusTime");
        localStorage.removeItem("verificationStatusTime");
      }
    }
  }, []);

  useEffect(() => {
    if (loading || !userData || !verificationData) return;

    let isMounted = true;

    const handleGuards = async () => {
      const { roles, isFirstLogin } = userData;
      const { kycVerified, emailVerified } = verificationData;
      const guardedNavigate = (targetPath: string) => {
        if (pathname === targetPath || pathname.startsWith(`${targetPath}/`)) {
          return;
        }
        router.replace(targetPath);
      };

      // Role-based redirection
      if (!roles || isFirstLogin) {
        guardedNavigate("/signup/profile-upload");
        return;
      }
      if (pathname.startsWith("/user") && !roles.freelancer) {
        guardedNavigate("/signup/freelancer");
        return;
      }
      if (pathname.startsWith("/client") && !roles.client) {
        guardedNavigate("/signup/client");
        return;
      }
      if (pathname.startsWith("/venue") && !roles.venue) {
        guardedNavigate("/signup/venue");
        return;
      }

      // KYC and email verification-based redirection
      if (
        !kycVerified &&
        pathname.startsWith("/client/job-proposal") &&
        pathname.includes("offer")
      ) {
        guardedNavigate("/kyc-required");
        return;
      }
      if (!kycVerified && pathname.startsWith("/user/offer")) {
        guardedNavigate("/kyc-required");
        return;
      }
      if (!kycVerified && pathname.startsWith("/user/proposal")) {
        guardedNavigate("/kyc-required");
        return;
      }
      if (
        !emailVerified &&
        (pathname.startsWith("/client/post-job") ||
          pathname.startsWith("/user/proposal"))
      ) {
        // Re-check against the latest DB-backed verification endpoint to avoid stale redirects.
        try {
          const freshResponse = await fetchWithAuth(
            `/api/verification-status?t=${Date.now()}`,
            { cache: "no-store" }
          );
          if (freshResponse.ok) {
            const freshVerification = (await freshResponse.json()) as {
              emailVerified?: boolean;
              kycVerified?: boolean;
            };
            if (freshVerification.emailVerified) {
              return;
            }
          }
        } catch (recheckError) {
          console.warn("Email verification recheck failed:", recheckError);
        }

        if (!isMounted) {
          return;
        }

        const redirectUrl = encodeURIComponent(pathname);
        guardedNavigate(`/email-required?redirect=${redirectUrl}`);
      }
    };

    void handleGuards();

    return () => {
      isMounted = false;
    };
  }, [userData, loading, verificationData, pathname, id, router]);

  if (status === "authenticated" && error) {
    console.error("Error fetching KYC status:", error);
    return null;
  }

  if (verificationData?.kycVerified || !isVisible) {
    return null; // Do not show the notification bar if KYC is verified or closed
  }

  return (
    <div className="fixed top-[75px] z-[1190] left-0 right-0 bg-yellow-500 text-white p-2 px-10 flex justify-between items-center">
      <span>
        Your KYC is not verified. Please complete your KYC verification.{" "}
        <Link href={`/kyc-form`} className="underline">
          Verify Now
        </Link>
      </span>
      <button
        className="text-white ml-4 text-2xl"
        onClick={() => setIsVisible(false)}
      >
        &times;
      </button>
    </div>
  );
};

export default KYCStatus;

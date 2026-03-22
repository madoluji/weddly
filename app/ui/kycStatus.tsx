"use client";
import React, { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { usePathname, useRouter } from "next/navigation"; // ✅ Use this instead of next/router
import { fetchWithAuth } from "../lib/fetchWIthAuth";

export interface KYCStatusResponse {
  kycVerified: boolean;
  emailVerified: boolean;
}

const KYCStatus: React.FC = () => {
  const { session, status } = useAuth();

  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter(); // ✅ Use useRouter from next/navigation
  const pathname = usePathname();
  const id = session?.user.id;
  const { data: verificationData, error } = useFetch<KYCStatusResponse>(
    "/verification-status"
  );

  interface UserRoles {
    client?: boolean;
    freelancer?: boolean;
  }

  interface UserData {
    roles: UserRoles;
    isFirstLogin?: boolean;
  }

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetchWithAuth("/api/user?fields=roles,isFirstLogin")
      .then((res) => res.json())
      .then((data) => {
        setUserData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setLoading(false);
      });
  }, [status]);

  useEffect(() => {
    if (loading || !userData || !verificationData) return;

    const { roles, isFirstLogin } = userData;
    const { kycVerified, emailVerified } = verificationData;

    // Role-based redirection
    if (!roles || isFirstLogin) {
      router.push(`/signup/profile-upload`);
      return;
    }
    if (pathname.startsWith("/user") && !roles.freelancer) {
      router.push(`/signup/freelancer`);
      return;
    }
    if (pathname.startsWith("/client") && !roles.client) {
      router.push(`/signup/client`);
      return;
    }

    // KYC and email verification-based redirection
    if (
      !kycVerified &&
      pathname.startsWith("/client/job-proposal") &&
      pathname.includes("offer")
    ) {
      router.push("/kyc-required");
      return;
    }
    if (!kycVerified && pathname.startsWith("/user/offer")) {
      router.push("/kyc-required");
      return;
    }
    if (
      !emailVerified &&
      (pathname.startsWith("/client/post-job") ||
        pathname.startsWith("/user/proposal"))
    ) {
      router.push("/email-required");
    }
  }, [userData, loading, verificationData, pathname, id, router]);

  if (error) {
    console.error("Error fetching KYC status:", error);
    return null;
  }

  if (verificationData?.kycVerified || !isVisible) {
    return null; // Do not show the notification bar if KYC is verified or closed
  }

  return (
    <div className="fixed top-[75px] z-[5] left-0 right-0 bg-yellow-500 text-white p-2 px-10 flex justify-between items-center">
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

"use client";
import { ReactNode } from "react";
import UserProfile from "../user/profile/page";
import UserProfileLoader from "../lib/userProfileLoader";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import AppLogo from "../ui/shared/AppLogo";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <div className="px-4 py-4">
        <UserProfileLoader />
        <AppLogo width={100} height={100} className="object-contain" alt="Logo" />
      </div>

      {/* Page Content */}
      <PayPalScriptProvider
        options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
          currency: "USD",
          intent: "capture",
        }}
      >
        {children}
      </PayPalScriptProvider>
    </>
  );
}

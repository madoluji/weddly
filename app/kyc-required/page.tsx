import React from "react";
import Link from "next/link";

const KYCRequiredPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Account Verification Required
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          To proceed further and access all platform features, we require you to
          complete the KYC (Know Your Customer) process.
        </p>

        <div className="mt-4">
          <Link
            href={`/kyc-form`}
            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            Complete KYC Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default KYCRequiredPage;

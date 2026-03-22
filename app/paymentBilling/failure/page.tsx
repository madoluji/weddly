"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface PaymentDetails {
  transaction_code?: string; // Optional, may not be present in failure
  status: string; // e.g., "FAILED"
  total_amount?: string; // Optional
  transaction_uuid: string;
  product_code?: string; // Optional
  signed_field_names?: string; // Optional
  signature?: string; // Optional
  error_message?: string; // Optional, if provided by eSewa
  [key: string]: any;
}

const PaymentFailureContent = () => {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );

  useEffect(() => {
    if (data) {
      try {
        const decodedData = decodeURIComponent(data);
        const parsedData = JSON.parse(atob(decodedData)) as PaymentDetails;
        setPaymentDetails(parsedData);
      } catch (error) {
        console.error("Error parsing failure data:", error);
      }
    }
  }, [data]);

  if (!paymentDetails) {
    return <div className="text-center p-10">Loading failure details...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-600">Payment Failed ❌</h2>
        <p className="mt-2 text-gray-600">
          There was an issue processing your payment.
        </p>

        <div className="mt-4 text-left">
          <p>
            <strong>Transaction ID:</strong> {paymentDetails.transaction_uuid}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="text-red-600">{paymentDetails.status}</span>
          </p>
          {paymentDetails.transaction_code && (
            <p>
              <strong>Transaction Code:</strong>{" "}
              {paymentDetails.transaction_code}
            </p>
          )}
          {paymentDetails.total_amount && (
            <p>
              <strong>Amount:</strong> NPR {paymentDetails.total_amount}
            </p>
          )}
          {paymentDetails.product_code && (
            <p>
              <strong>Product Code:</strong> {paymentDetails.product_code}
            </p>
          )}
          {paymentDetails.error_message && (
            <p>
              <strong>Error Message:</strong> {paymentDetails.error_message}
            </p>
          )}
          {paymentDetails.signature && (
            <p>
              <strong>Signature:</strong> {paymentDetails.signature}
            </p>
          )}
          {paymentDetails.signed_field_names && (
            <p>
              <strong>Signed Field Names:</strong>{" "}
              {paymentDetails.signed_field_names}
            </p>
          )}
        </div>

        <div className="mt-6 text-left w-full">
          <h3 className="text-lg font-semibold">Full Failure Data:</h3>
          <pre className="bg-gray-200 p-4 rounded-md text-sm overflow-x-auto">
            {JSON.stringify(paymentDetails, null, 2)}
          </pre>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            onClick={() => (window.location.href = "/payment")} // Adjust to your payment retry route
          >
            Try Again
          </button>
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
            onClick={() => (window.location.href = "/dashboard")} // Adjust to your dashboard route
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentFailure = () => {
  return (
    <Suspense
      fallback={
        <div className="text-center p-10">Loading failure details...</div>
      }
    >
      <PaymentFailureContent />
    </Suspense>
  );
};

export default PaymentFailure;

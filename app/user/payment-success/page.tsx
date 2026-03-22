"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface PaymentDetails {
  transaction_code: string;
  status: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  [key: string]: any;
}

const PaymentSuccessContent = () => {
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
        console.error("Error parsing payment data:", error);
      }
    }
  }, [data]);

  if (!paymentDetails) {
    return <div className="text-center p-10">Loading payment details...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-green-600">
          Payment Successful ✅
        </h2>
        <p className="mt-2 text-gray-600">Thank you for your payment!</p>

        <div className="mt-4 text-left">
          <p>
            <strong>Transaction Code:</strong> {paymentDetails.transaction_code}
          </p>
          <p>
            <strong>Status:</strong> {paymentDetails.status}
          </p>
          <p>
            <strong>Amount:</strong> NPR {paymentDetails.total_amount}
          </p>
          <p>
            <strong>Transaction ID:</strong> {paymentDetails.transaction_uuid}
          </p>
          <p>
            <strong>Product Code:</strong> {paymentDetails.product_code}
          </p>
        </div>

        <div className="mt-6 text-left w-full">
          <h3 className="text-lg font-semibold">Full Payment Data:</h3>
          <pre className="bg-gray-200 p-4 rounded-md text-sm overflow-x-auto">
            {JSON.stringify(paymentDetails, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

const PaymentSuccess = () => {
  return (
    <Suspense
      fallback={
        <div className="text-center p-10">Loading payment details...</div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccess;

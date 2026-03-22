"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
interface Props {
  method: string;
}

const PaymentConfirmContent = ({ method }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const confirmPayment = async () => {
      try {
        let response;
        if (method === "esewa") {
          const data = searchParams.get("data");

          if (!data) {
            setError("Missing payment data");
            return;
          }
          response = await fetchWithAuth(
            `/api/esewa-payment/callback?data=${data}`,
            {
              method: "GET",
            }
          );

          if (response.status === 200) {
            const url = new URL(response.url);
            // e.g., "/paymentBilling/success/..."
            console.log(
              "Payment confirmed successfully, navigating to:",
              url.toString()
            );
            router.push(url.toString());
          } else {
            console.error("Payment confirmation failed:");
            setError("Payment confirmation failed");
          }
        } else if (method === "khalti") {
          const pidx = searchParams.get("pidx");
          const txnId = searchParams.get("txnId");
          const amount = searchParams.get("amount");
          const total_amount = searchParams.get("total_amount");
          const status = searchParams.get("status");
          const mobile = searchParams.get("mobile");
          const tidx = searchParams.get("tidx");
          const purchase_order_id = searchParams.get("purchase_order_id");
          const purchase_order_name = searchParams.get("purchase_order_name");
          const transaction_id = searchParams.get("transaction_id");

          if (
            !pidx ||
            !amount ||
            !total_amount ||
            !status ||
            !mobile ||
            !tidx ||
            !purchase_order_id ||
            !purchase_order_name ||
            !transaction_id
          ) {
            setError("Missing payment data");
            return;
          }

          const queryParams = new URLSearchParams({
            pidx,
            amount,
            total_amount,
            status,
            mobile,
            tidx,
            purchase_order_id,
            purchase_order_name,
            transaction_id,
          }).toString();

          response = await fetchWithAuth(
            // `/api/kalti-payment/callback?pidx=${pidx}&txnId=${txnId}&amount=${amount}&total_amount=${total_amount}&status=${status}&mobile=${mobile}&tidx=${tidx}&purchase_order_id=${purchase_order_id}&purchase_order_name=${purchase_order_name}&transaction_id=${transaction_id}`,
            `/api/kalti-payment/callback?${queryParams}`,
            {
              method: "GET",
            }
          );

          if (response.status === 200) {
            console.log("Payment confirmed successfully");
            const url = new URL(response.url);
            router.push(url.toString());
          } else {
            const result = await response.json();
            console.error("Payment confirmation failed:", result);
            setError(result.error || "Payment confirmation failed");
          }
        } else {
          setError("Invalid payment method");
          return;
        }

        if (!response) {
          setError("No response from payment confirmation");
          return;
        }
        console.log("Payment confirmation response:", response);
      } catch (err) {
        console.error("Payment confirmation error:", err);
        setError("Error confirming payment");
      }
    };

    confirmPayment();
  }, [searchParams, router, method]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => router.push("/payment")}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold">Processing Payment...</h2>
        <p className="mt-2 text-gray-600">
          Please wait while we confirm your payment.
        </p>
      </div>
    </div>
  );
};

const PaymentConfirm = ({
  params,
}: {
  params: { contractId: string; freelancerId: string; method: string };
}) => {
  const { contractId, freelancerId, method } = params;
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <PaymentConfirmContent method={method} />
    </Suspense>
  );
};

export default PaymentConfirm;

"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  CreditCardIcon,
  ExclamationCircleIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";
import { handlePayment } from "../lib/handlePayment";
import { fetchWithAuth } from "../lib/fetchWIthAuth";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { createOrder, captureOrder } from "../actions/paypal";

const paymentMethods = [
  { name: "esewa", color: "bg-green-500" },
  { name: "Khalti", color: "bg-purple-500" },
  { name: "PayPal", color: "bg-blue-500" },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

function Payment({
  contractId,
  userId,
}: {
  contractId: string;
  userId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const paypalRef = useRef(null);

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderId = await createOrder(contractId);
      return orderId;
    } catch (err) {
      setError("Failed to create order. Please try again.");
      console.error("Create order error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureOrder = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await captureOrder(data.orderID);
      setSuccess(`Payment completed! Order ID: ${data.orderID}`);
      // Redirect to the success page with the appropriate parameters
      router.push(
        `/paymentBilling/success/${contractId}/${orderData.freelancerId}?method=paypal&amount=${billDetails.total}&code=${orderData.transaction_code}&transaction_id=${orderData.transcation_uuid}`
      );
      return;
    } catch (err) {
      setError("Payment failed. Please try again.");
      console.error("Capture order error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [billDetails, setBillDetails] = useState({
    basePrice: 0,
    serviceCharge: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetchWithAuth(
          `/api/fetch-contracts?contractId=${contractId}&clientId=${userId}`
        );
        const { data } = await response.json();
        const price = data.price;

        // Calculate service charge (3%)
        const serviceCharge = price * 0.03;
        // Calculate tax (13% VAT for example)
        const tax = price * 0.13;
        // Calculate total
        const total = price + serviceCharge;

        setBillDetails({
          basePrice: price,
          serviceCharge,
          total,
        });
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    };

    fetchPrice();
  }, [contractId, userId]);

  const proceedPayment = async (method: string) => {
    setIsLoading(true);
    setError(null);

    await handlePayment(contractId, method, (errorMessage) => {
      setError(errorMessage);
      setIsLoading(false);
    });

    // Note: For eSewa, the page will redirect; no need to set loading false here
    // For Khalti, add logic to reset loading if no redirect occurs
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-md mx-auto p-4"
    >
      <div className="bg-white shadow-lg rounded-xl p-6 w-full relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold">Billing Details</h2>
          <p className="text-gray-500 mt-2">Review your payment information</p>
        </motion.div>

        {/* Billing Section */}
        <motion.div
          className="mt-4 border border-gray-200 rounded-lg p-4"
          variants={itemVariants}
        >
          <div className="flex items-center mb-2">
            <ReceiptPercentIcon className="mr-2 text-blue-500 w-5 h-5" />
            <h3 className="font-medium">Bill Summary</h3>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Base Price</span>
              <span className="font-medium">
                {formatCurrency(billDetails.basePrice)}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-gray-600">Service Charge (3%)</span>
              <span className="font-medium">
                {formatCurrency(billDetails.serviceCharge)}
              </span>
            </div>

            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <motion.span
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-blue-600"
                >
                  {formatCurrency(billDetails.total)}
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6"
        >
          <h3 className="font-medium flex items-center">
            <CreditCardIcon className="mr-2 text-blue-500 w-5 h-5" />
            Choose Payment Method
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Select your preferred payment option
          </p>
        </motion.div>

        <div className="grid gap-4 mt-4">
          <AnimatePresence mode="sync">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={method.name}
                variants={itemVariants}
                custom={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  className={`w-full flex items-center px-4 py-2 border rounded-lg transition-all duration-300 text-left font-medium shadow-sm relative overflow-hidden ${
                    selectedMethod === method.name
                      ? "border-2 bg-gray-100 border-blue-500"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedMethod(method.name)}
                >
                  <motion.div
                    className={`mr-2 h-4 w-4 rounded-full ${method.color}`}
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  />
                  {method.name}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6">
          <AnimatePresence mode="sync">
            {selectedMethod && selectedMethod !== "PayPal" && (
              <motion.div
                className="w-full"
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                whileHover="hover"
                whileTap="tap"
              >
                <button
                  className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium relative overflow-hidden"
                  onClick={() => proceedPayment(selectedMethod)}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Pay {formatCurrency(billDetails.total)} with{" "}
                    {selectedMethod}
                  </motion.span>
                </button>
              </motion.div>
            )}
            {selectedMethod === "PayPal" && (
              <>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-red-800">Error</h3>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-green-800">Success</h3>
                      <p className="text-sm">{success}</p>
                    </div>
                  </div>
                )}

                <div
                  ref={paypalRef}
                  className={
                    loading ? "opacity-50 pointer-events-none mt-5" : ""
                  }
                >
                  <PayPalButtons
                    createOrder={handleCreateOrder}
                    onApprove={handleCaptureOrder}
                    style={{ layout: "vertical", shape: "rect" }}
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export { Payment };

"use client";

import type React from "react";

import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  use,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CreditCardIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  SparklesIcon,
  CurrencyRupeeIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import {
  collection,
  updateDoc,
  doc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";

import { Appcontext } from "@/app/context/appContext";
import { db } from "@/app/lib/firebase";
import UserProfileLoader from "@/app/lib/userProfileLoader";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";
import { set } from "mongoose";
import Image from "next/image";

interface PaymentDetails {
  transaction_code: string;
  status: string;
  total_amount: string;
  transaction_uuid: string;

  [key: string]: any;
}

interface ContractDetails {
  price: string | number;
  jobId: {
    title: string;
  };
  freelancerDetails: {
    fullName: string;
  };
  [key: string]: any;
}

interface UserData {
  id: string;
}

type ChatDataItem = {
  messageId: string;
  lastMessage: string;
  rId: string;
  updatedAt: number;
  messageSeen: boolean;
  userData: UserData;
  user: UserData;
  lastMessageSender?: string;
  chatStatus: string;
  ContractArray?: string[];
};

interface AppContextValue {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  chatData: ChatDataItem[] | null;
  setChatData: React.Dispatch<React.SetStateAction<ChatDataItem[] | null>>;
  loadUserData: (uid: string) => Promise<void>;
  messages: any;
  setMessages: React.Dispatch<React.SetStateAction<any>>;
  messagesId: string | null;
  setMessagesId: React.Dispatch<React.SetStateAction<string | null>>;
}

interface Props {
  contractId: string;
  freelancerId: string;
  clientId: string;
}

const PaymentSuccessContent = ({ contractId, freelancerId }: Props) => {
  const { session } = useAuth();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [contractDetails, setContractDetails] =
    useState<ContractDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientId = session?.user?.id;
  const [hasClosedChat, setHasClosedChat] = useState(false);

  // const { loadUserData } = useContext(Appcontext);
  const context = useContext(Appcontext) as AppContextValue;
  const { userData, chatData } = context;
  const searchParams = useSearchParams();
  const method = searchParams.get("method");
  const data = searchParams.get("data");
  const total_amount = searchParams.get("amount");
  const status = searchParams.get("status");
  const purchase_order_id = searchParams.get("purchase_order_id");
  const transaction_id = searchParams.get("transaction_id");

  // PayPal specific parameters
  const code = searchParams.get("code");

  const isPayPal = method === "paypal";

  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  // Fetch contract details
  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setIsLoading(true);
        console.log(
          `Fetching contract details for contractId: ${contractId}, clientId: ${clientId}`
        );

        // Check if we're running on the client side
        if (typeof window === "undefined") {
          console.log("Not fetching contract details on server side");
          return;
        }

        const response = await fetchWithAuth(
          `/api/fetch-contracts?contractId=${contractId}&clientId=${clientId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch contract details: ${response.status}`
          );
        }

        const { data } = await response.json();
        console.log("Contract details fetched successfully:", data);
        setContractDetails(data);

        if (isPayPal) {
          // Set payment details with the contract price
          setPaymentDetails({
            transaction_code: code || "Unknown",
            status: "Completed",
            total_amount: total_amount || "0",
            transaction_uuid: transaction_id || "Unknown",
          });
        }
      } catch (err) {
        console.error("Error fetching contract details:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch contract details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Add a console log to verify the effect is running
    console.log(
      "Contract details useEffect running with IDs:",
      contractId,
      clientId
    );

    if (contractId && clientId) {
      fetchContractDetails();
    }
  }, [contractId, clientId, isPayPal, total_amount, code, transaction_id]);

  // Decode and parse the payment data
  useEffect(() => {
    if (data) {
      try {
        const decodedData = decodeURIComponent(data);
        const parsedData = JSON.parse(atob(decodedData)) as PaymentDetails;
        setPaymentDetails(parsedData);
      } catch (error) {
        console.error("Error parsing payment data:", error);
        setError("Failed to parse payment data");
      }
    }
  }, [data]);

  // Memoize the handleCloseChat function to prevent unnecessary re-creations
  const handleCloseChat = useCallback(async () => {
    if (!session) {
      console.log("Session not available, aborting...");
      return;
    }

    try {
      const userId = userData?.id;

      // Early return if required data isn't ready
      if (!userId || !chatData) {
        console.log("Missing userId or chatData, aborting...");
        return;
      }

      const conversationExists = chatData.find(
        (chat: ChatDataItem) => chat.rId === freelancerId
      );

      if (!conversationExists) {
        console.log("freelancerId", freelancerId);
        console.log("userId", userId);
        console.log("no chat");
        return;
      }

      if (conversationExists.chatStatus === "closed") {
        console.log("Chat already closed, skipping...");
        return;
      }

      const chatsRef = collection(db, "chats");
      const message = "paid the due amount";
      const eMessageId = conversationExists.messageId;

      await updateDoc(doc(db, "messages", eMessageId), {
        messages: arrayUnion({
          sId: userId,
          text: message,
          createdAt: new Date(),
        }),
      });

      const userIDs = [freelancerId, userId];

      for (const id of userIDs) {
        const selectedUserChatRef = doc(chatsRef, id);
        const UserChatSnap = await getDoc(selectedUserChatRef);

        if (UserChatSnap.exists()) {
          const UserChatData = UserChatSnap.data();
          const chatIndex = UserChatData.chatsData.findIndex(
            (c: ChatDataItem) => c.messageId === eMessageId
          );

          if (chatIndex !== -1) {
            const updatedChatsData = [...UserChatData.chatsData];

            // Safeguard: Ensure ContractArray is defined before filtering
            updatedChatsData[chatIndex].ContractArray = (
              updatedChatsData[chatIndex].ContractArray || []
            ).filter((id: string) => id !== contractId);

            if (updatedChatsData[chatIndex].ContractArray?.length === 0) {
              updatedChatsData[chatIndex].chatStatus = "closed";
            }
            updatedChatsData[chatIndex].lastMessage = message;
            updatedChatsData[chatIndex].updatedAt = Date.now();
            updatedChatsData[chatIndex].messageSeen = false;

            await updateDoc(selectedUserChatRef, {
              chatsData: updatedChatsData,
            });
          }
        }
      }
      console.log("Chat closed");
      setHasClosedChat(true);
    } catch (error) {
      console.error("Error closing chat:", error);
    }
  }, [session, userData, chatData, freelancerId, contractId]);

  // Use a ref to track if the effect has already run
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (session && !hasRunRef.current && chatData) {
      hasRunRef.current = true;
      handleCloseChat();
    }
  }, [session, handleCloseChat, chatData]);

  useEffect(() => {
    if (method === "khalti") {
      if (!total_amount || !status || !purchase_order_id || !transaction_id) {
        console.log("Missing khalti payment data");
        return;
      }

      setPaymentDetails({
        transaction_code: transaction_id,
        status: status,
        total_amount: (Number(total_amount) / 100).toString(),
        transaction_uuid: purchase_order_id,
      });
    }
  }, [method, total_amount, status, purchase_order_id, transaction_id]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
        delay: 0.1,
      },
    },
  } as const;
  

  const formatCurrency = (amount: string | number) => {
    if (isPayPal) {
      return `$${typeof amount === "number" ? amount.toLocaleString() : amount}`;
    }
    return `NPR ${typeof amount === "number" ? amount.toLocaleString() : amount}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-2xl text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/client/best-matches"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl"
      >
        {/* Header Section */}
        <div className="text-center mb-8 border-b pb-8">
          <motion.div
            variants={iconVariants}
            className="mb-6 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-25"></div>
              <CheckCircleSolid className="h-20 w-20 text-green-500 relative z-10" />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold text-gray-800 mb-2"
          >
            Payment Successful
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg text-gray-600">
            Your transaction has been completed successfully
          </motion.p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Contract Details Column */}
          <motion.div
            variants={itemVariants}
            className="bg-primary-50 rounded-xl p-6 h-full"
          >
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                Contract Details
              </h2>
            </div>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-primary-100 rounded w-3/4"></div>
                <div className="h-6 bg-primary-100 rounded w-1/2"></div>
                <div className="h-6 bg-primary-100 rounded w-2/3"></div>
              </div>
            ) : contractDetails ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-start">
                    <SparklesIcon className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-primary-600 font-medium">
                        Wedding Gig
                      </p>
                      <p className="text-lg font-medium text-gray-800">
                        {contractDetails.jobId?.title ||
                          "Wedding gig information unavailable"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start">
                    <UserIcon className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-primary-600 font-medium">
                        Wedding Specialist
                      </p>
                      <p className="text-lg font-medium text-gray-800">
                        {contractDetails.freelancerDetails?.fullName ||
                          "Wedding specialist information unavailable"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start">
                    <CurrencyRupeeIcon className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-primary-600 font-medium">
                        Contract Amount
                      </p>
                      <p className="text-xl font-bold text-gray-800">
                        {contractDetails.price
                          ? formatCurrency(contractDetails.price)
                          : "Price information unavailable"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <BanknotesIcon className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-primary-600 font-medium">
                        Payment Method
                      </p>
                      <span className="flex items-center justify-center mt-2 ">
                        {method && (
                          <Image
                            src={`/logo/${method}.png`}
                            width={`${method === "khalti" ? "100" : "50"}`}
                            height={`${method === "khalti" ? "50" : "30"}`}
                            alt={method}
                          />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                <p className="text-primary-700 text-center">
                  Contract details could not be loaded. The payment was still
                  successful.
                </p>
              </div>
            )}
          </motion.div>

          {/* Payment Details Column */}
          <motion.div
            variants={itemVariants}
            className="bg-gray-50 rounded-xl p-6"
          >
            <div className="flex items-center mb-4">
              <CreditCardIcon className="h-6 w-6 text-gray-700 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                Payment Receipt
              </h2>
            </div>

            {paymentDetails ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Transaction Code</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">
                      {paymentDetails.transaction_code}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          paymentDetails.transaction_code,
                          "transaction_code"
                        )
                      }
                      className="text-primary-500 hover:text-primary-700 focus:outline-none"
                      aria-label="Copy transaction code"
                    >
                      {copied === "transaction_code" ? (
                        <CheckIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ClipboardDocumentIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {paymentDetails.status}
                  </span>
                </div>
                <div className="py-2 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">Contract Price</span>
                    <span className="font-medium text-gray-800">
                      NPR{" "}
                      {(
                        Number.parseFloat(paymentDetails.total_amount) / 1.03
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">Service Fee (3%)</span>
                    <span className="font-medium text-gray-800">
                      NPR{" "}
                      {(
                        Number.parseFloat(paymentDetails.total_amount) -
                        Number.parseFloat(paymentDetails.total_amount) / 1.03
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 mt-1 border-t border-dashed border-gray-200">
                    <span className="text-gray-700 font-medium">
                      Total Amount
                    </span>
                    <span className="font-bold text-lg text-gray-800">
                      NPR {paymentDetails.total_amount}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-medium text-sm text-gray-700">
                    {paymentDetails.transaction_uuid}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Product Code</span>
                  <span className="font-medium">
                    {paymentDetails.product_code}
                  </span>
                </div>
                <div className="pt-4 text-center text-sm text-gray-500">
                  <p>Payment processed on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="h-8 w-8 border-3 border-gray-200 border-t-gray-600 rounded-full"
                ></motion.div>
              </div>
            )}
          </motion.div>
        </div>

        {!isLoading && !contractDetails && paymentDetails && (
          <motion.div
            variants={itemVariants}
            className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-center"
          >
            <p className="text-yellow-700">
              We couldn&apos;t load your contract details, but your payment of{" "}
              <strong>NPR {paymentDetails.total_amount}</strong> was successful.
            </p>
          </motion.div>
        )}

        {/* Footer Section */}
        <motion.div
          variants={itemVariants}
          className="mt-8 pt-6 border-t border-gray-100"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              A confirmation email has been sent to your registered email
              address.
            </p>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/client/best-matches"
                className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-md shadow-primary-100 group"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

const PaymentSuccess = ({
  params,
}: {
  params: Promise<{ contractId: string; freelancerId: string; clientId: string }>;
}) => {
  const { contractId, freelancerId, clientId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl">
            <div className="animate-pulse">
              <div className="flex justify-center mb-8 pb-8 border-b">
                <div className="rounded-full bg-gray-200 h-20 w-20 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-6 w-6 bg-gray-200 rounded-full mr-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-20 bg-primary-100 rounded"></div>
                    <div className="h-20 bg-primary-100 rounded"></div>
                    <div className="h-20 bg-primary-100 rounded"></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-6 w-6 bg-gray-200 rounded-full mr-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent
        contractId={contractId}
        freelancerId={freelancerId}
        clientId={clientId}
      />
    </Suspense>
  );
};

export default PaymentSuccess;

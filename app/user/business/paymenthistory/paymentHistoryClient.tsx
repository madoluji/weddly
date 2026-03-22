"use client";

import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/app/providers";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

interface Job {
  _id: string;
  title: string;
}

interface User {
  _id: string;
  name: string;
  lastName: string;
}

interface Payment {
  _id: string;
  jobId: Job;
  contractId: string;
  clientId: User;
  freelancerId: User;
  totalAmount: number;
  freelancerAmount: number;
  transactionId: string;
  method: string;
  status: string;
  createdAt: string;
  type: "income" | "expense";
}

const PaymentHistoryClient = () => {
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { session } = useAuth();
  const userId = session?.user.id;

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await fetchWithAuth(
          `/api/fetchpayment/${userId}?alltransaction=true`
        );
        const data = await response.json();
        setPaymentHistory(data.transactionsWithType || []);
      } catch (error) {
        console.error("Error fetching payment history:", error);
        setPaymentHistory([]); // Ensure paymentHistory is always an array
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [userId]);

  const filteredPayments = paymentHistory.filter((payment) => {
    if (filter === "all") return true;
    if (filter === "income") return payment.type === "income";
    if (filter === "expense") return payment.type === "expense";
    if (filter === "completed") return payment.status === "completed";
    if (filter === "pending") return payment.status === "pending";
    if (filter === "failed") return payment.status === "failed";
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const refreshData = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await fetchWithAuth(
        `/api/fetchpayment/${userId}?alltransaction=true`
      );
      const data = await response.json();
      setPaymentHistory(data.transactionsWithType || []);
    } catch (error) {
      console.error("Error refreshing payment history:", error);
      setPaymentHistory([]); // Ensure paymentHistory is always an array
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Payment History
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View all your transaction history and payment details
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={refreshData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <BanknotesIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">
                {filteredPayments.length} Transactions
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                  placeholder="Search transactions..."
                />
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Transaction
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      To/From
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Method
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              payment.type === "income"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {payment.type === "income" ? (
                              <ArrowDownIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowUpIcon className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.type === "income"
                                ? "Payment Received"
                                : "Payment Sent"}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              ID: {payment._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.type === "income"
                            ? `From: ${payment.clientId?.name || "Unknown"} ${payment.clientId?.lastName || ""}`
                            : `To: ${payment.freelancerId?.name || "Unknown"} ${payment.freelancerId?.lastName || ""}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.jobId?.title && (
                            <span>Job: {payment.jobId.title}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(payment.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-semibold ${
                            payment.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {payment.type === "income" ? "+" : "-"} Rs{" "}
                          {payment.type === "income"
                            ? payment.freelancerAmount.toFixed(2)
                            : payment.totalAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {payment.method}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.status === "completed" && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />{" "}
                            Successful
                          </span>
                        )}
                        {payment.status === "pending" && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            <ClockIcon className="h-4 w-4 mr-1" /> Pending
                          </span>
                        )}
                        {payment.status === "failed" && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            <XCircleIcon className="h-4 w-4 mr-1" /> Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <BanknotesIcon className="h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No transactions found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter !== "all"
                  ? "Try changing your filter settings to see more transactions."
                  : "You don't have any transactions yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryClient;

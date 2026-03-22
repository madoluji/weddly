"use client";

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";
import type React from "react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Updated interfaces to include more relevant information
interface Job {
  _id: string;
  title: string;
  description: string;
  budget: number;
}

interface FreelancerDetails {
  _id: string;
  userId: string;
  fullName: string;
  location: string;
  rate: number;
  industries: string[];
}

interface Contract {
  _id: string;
  jobId: Job;
  status: "pending" | "active" | "completed" | "canceled" | "declined";
  paymentType: "fixed" | "hourly" | "milestone";
  price: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  freelancerDetails: FreelancerDetails;
}

interface ContractsListProps {
  contractStatus?: string;
  paymentType?: string;
  search?: string;
}

const ContractsList: React.FC<ContractsListProps> = () => {
  const searchParams = useSearchParams();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const status = searchParams.get("status") || "";
  const paymentType = searchParams.get("paymentType") || "";
  const search = searchParams.get("search") || "";

  // Debounced fetch function
  const debouncedFetchContracts = useCallback(
    async (clientId: string, status: string, paymentType: string) => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(
          `/api/fetch-contracts?clientId=${clientId}${status ? `&status=${status}` : ""}${paymentType ? `&paymentType=${paymentType}` : ""}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch contracts");
        }

        const { data } = await response.json();
        setContracts(data);
        setError(null);
      } catch (error) {
        console.error(error);
        setError("Failed to load contracts. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!session?.user?.id) return;

    debouncedFetchContracts(session.user.id, status, paymentType);
  }, [status, paymentType, session?.user?.id, debouncedFetchContracts]);

  // Filter contracts by search term if provided
  const filteredContracts = search
    ? contracts.filter(
        (contract) =>
          contract.jobId.title.toLowerCase().includes(search.toLowerCase()) ||
          (contract.freelancerDetails?.fullName &&
            contract.freelancerDetails.fullName
              .toLowerCase()
              .includes(search.toLowerCase()))
      )
    : contracts;

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between">
              <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-5 w-40 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-5 w-32 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <div className="h-9 w-28 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded">
        <p className="text-red-700 font-medium">{error}</p>
        <p className="text-sm mt-1 text-red-600">
          Please try refreshing the page or check your connection.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-primary-100 text-primary-700";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "declined":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {filteredContracts.length > 0 ? (
        filteredContracts.map((contract) => (
          <div
            key={contract._id}
            className="border rounded-lg overflow-hidden transition-all hover:shadow-md"
          >
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold line-clamp-1">
                {contract.jobId.title}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}
              >
                {contract.status.charAt(0).toUpperCase() +
                  contract.status.slice(1)}
              </span>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Freelancer</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {contract.freelancerDetails?.fullName || "Unknown"}
                    </span>
                    {contract.freelancerDetails?.location && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{contract.freelancerDetails.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Contract Value</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      ${contract.price.toLocaleString()}
                      {contract.paymentType === "hourly" && (
                        <span className="text-sm font-normal"> /hour</span>
                      )}
                    </span>
                    <span className="text-sm text-gray-500 capitalize mt-1">
                      {contract.paymentType} payment
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-500 mr-1">Created:</span>
                  <span>
                    {contract.createdAt
                      ? new Date(contract.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-500 mr-1">Deadline:</span>
                  <span>
                    {contract.deadline
                      ? new Date(contract.deadline).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <Link
                href={`/contracts/${contract._id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No contracts found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {status || paymentType || search
              ? "Try adjusting your filter criteria to see more results."
              : "You don't have any contracts yet. When you create contracts, they will appear here."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContractsList;

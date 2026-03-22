"use client";
import React, { useEffect, useState } from "react";
import {
  SparklesIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";
import AcceptButton from "./acceptButton";

export default function ContractDetails({
  contractId,
}: {
  contractId: string;
}) {
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, status } = useAuth();
  useEffect(() => {
    const fetchContractOffers = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(
          `/api/fetch-contracts?freelancerId=${session?.user.id}&contractId=${contractId}`
        );
        const { success, data } = await response.json();

        if (success) {
          setContract(data);
        } else {
          setError("Failed to fetch contract details.");
        }
      } catch (err) {
        setError("Something went wrong while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user.id) {
      fetchContractOffers();
    }
  }, [session?.user.id, contractId]);

  if (loading)
    return (
      <p className="text-center text-gray-500">Loading contract details...</p>
    );

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-lg border px-10  border-gray-200 shadow-sm overflow-hidden sticky top-6">
      <div className="p-6 pb-3">
        <h2 className="text-xl font-semibold">Contract Summary</h2>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {/* Client Information */}
        <div className="flex items-center">
          <SparklesIcon className="h-5 w-5 mr-3 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Venue / Vendor</p>
            <p className="font-medium">{contract?.clientDetails.fullName}</p>
          </div>
        </div>

        {/* Budget */}
        <div className="flex items-center">
          <CurrencyDollarIcon className="h-5 w-5 mr-3 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Offered Booking Fee / Rate</p>
            <p className="font-medium">
              {contract?.paymentType === "fixed" ? "$" : "$/hr"}
              {contract?.price}
            </p>
          </div>
        </div>

        {/* Payment Type */}
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 mr-3 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Payment Type</p>
            <p className="font-medium capitalize">{contract?.paymentType}</p>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center">
          <CalendarDaysIcon className="h-5 w-5 mr-3 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Project Deadline</p>
            <p className="font-medium">
              {new Date(contract?.deadline).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Client Location */}
        <div className="flex items-center">
          <BuildingLibraryIcon className="h-5 w-5 mr-3 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Venue Location</p>
            <p className="font-medium">{contract?.clientDetails?.location}</p>
          </div>
        </div>

        {/* Offer Expiration */}
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-3 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Offer Expiration</p>
            <p className="font-medium text-red-500">
              {new Date(contract?.expiration).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="my-4 border-t border-gray-200"></div>

        {/* Terms & Conditions Binding Message */}

        <div className="bg-gray-50 border border-gray-200 rounded-md p-2 mb-3">
          <p className="text-xs text-gray-600 flex ]">
            <ShieldCheckIcon className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
            Accepting this offer creates a legally binding contract
          </p>
        </div>
      </div>

      {/* Accept Button */}
      <AcceptButton
        jobId={contract.jobId._id}
        freelancerId={session?.user.id}
        contractId={contractId}
      />
    </div>
  );
}

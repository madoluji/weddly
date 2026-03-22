"use client";
import useFetch from "@/app/hooks/useFetch";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { Button } from "@/app/ui/button";
import Card from "@/app/ui/card";
import CardSkeleton from "@/app/ui/dashboard-components/skeletons/cardSkeleton";
import {
  CalculatorIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/app/providers";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const ProposalList = () => {
  const [activeTab, setActiveTab] = useState("proposal-list");
  const { session, status } = useAuth();
  const [loading, setLoading] = useState(true);

  interface ContractOffer {
    id: string;
    title: string;
    company: string;
    jobId: string;
    price: string;
    paymentType: string;
    deadline: string;
    isNew: boolean;
    expiration: string;
  }

  interface proposal {
    id: string;
    title: string;
    bidAmount: string;
    status: string;
    createdAt: string;
    jobId: {
      title: string;
    };
  }

  const [contractOffers, setContractOffers] = useState<ContractOffer[]>([]);
  const [proposal, setProposal] = useState<proposal[]>([]);

  useEffect(() => {
    const fetchContractOffers = async () => {
      setLoading(true);
      const response = await fetchWithAuth(
        `/api/fetch-contracts?freelancerId=${session?.user.id}&status=pending`
      );
      const res = await fetchWithAuth(
        `/api/jobproposal?freelancerId=${session?.user.id}`
      );

      const { proposals } = await res.json();
      setProposal(proposals);
      const { data } = await response.json();

      // Map the response data to the ContractOffer structure
      const offers = data?.map((offer: any) => ({
        id: offer._id,
        title: offer.jobId?.title, // Extract title from jobId
        company: offer.clientDetails?.fullName, // Extract company name from clientDetails
        price: offer.price,
        paymentType: offer.paymentType,
        deadline: offer.deadline,
        jobId: offer.jobId._id,
        expiration: `expires in ${Math.ceil((new Date(offer.expiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}`,
        isNew:
          new Date(offer.createdAt) >
          new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Check if the offer is within the last 3 days
      }));

      setContractOffers(offers);
      setLoading(false);
    };

    if (session?.user.id) {
      fetchContractOffers();
    }
  }, [session?.user.id]);

  return (
    <div>
      <div className="flex gap-10 border-b font-medium border-primary-400 mb-10 py-2">
        <span
          onClick={() => setActiveTab("proposal-list")}
          className={`cursor-pointer relative ${activeTab === "proposal-list" ? "active-tab" : ""}`}
        >
          Submitted Proposals
        </span>
        <span
          onClick={() => setActiveTab("contract-offers")}
          className={`cursor-pointer relative ${activeTab === "contract-offers" ? "active-tab" : ""}`}
        >
          Contract Offers
        </span>
      </div>
      {activeTab === "contract-offers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))
            ) : contractOffers.length === 0 ? (
              <div className="col-span-1 text-center">
                No contract offers available.
              </div>
            ) : (
              contractOffers.map((offer) => (
                <Card key={offer.id} className="overflow-hidden">
                  <div className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="text-2xl font-semibold">
                        {offer.title}
                      </div>
                      {offer.expiration.includes("expires in 1") ||
                      offer.expiration.includes("expires in 2") ||
                      offer.expiration.includes("expires in 3") ? (
                        <div className="px-3 py-1 rounded-lg new-pin text-xs text-white bg-red-500">
                          High-priority
                        </div>
                      ) : offer.isNew ? (
                        <div className="px-3 py-1 rounded-lg new-pin text-xs text-white bg-green-500">
                          new
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-lg new-pin text-xs text-white bg-yellow-500">
                          pending
                        </div>
                      )}
                    </div>
                    <div className="description mt-1 text-gray-500">
                      {offer.company}
                    </div>
                  </div>
                  <div className="pb-3 content">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-500" />
                        <span>
                          Offered Rate:{" "}
                          {offer.paymentType === "hourly" ? "$/hr" : "$"}
                          {offer.price}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CalculatorIcon className="h-5 w-5 mr-2 text-gray-500" />
                        <span>{offer.paymentType}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
                        <span>
                          Deadline:{" "}
                          {new Date(offer.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="footer flex justify-between pt-3">
                    <div className="text-red-500 items-center flex py-2">
                      <ExclamationCircleIcon className="h-5 w-5 mr-1" />
                      {offer.expiration} days
                    </div>
                    <Link
                      className="border flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 border-primary-500 hover:bg-zinc-100 text-primary-600 bg-transparent"
                      href={`/user/offer/${offer.id}/${offer.jobId}`}
                    >
                      View Details
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "proposal-list" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))
            ) : proposal.length === 0 ? (
              <div className="col-span-1 text-center">
                No submitted proposals found.
              </div>
            ) : (
              proposal.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  <div className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="text-2xl font-semibold">
                        {p.jobId.title}
                      </div>
                      {p.status && (
                        <div
                          className={`px-3 p-1 rounded-lg new-pin text-xs text-white ${
                            p.status === "pending"
                              ? "bg-yellow-400"
                              : p.status === "shortlisted"
                                ? "bg-blue-500"
                                : p.status === "accepted"
                                  ? "bg-green-500"
                                  : p.status === "rejected"
                                    ? "bg-red-500"
                                    : p.status === "withdrawn"
                                      ? "bg-gray-500"
                                      : p.status === "canceled"
                                        ? "bg-black"
                                        : ""
                          }`}
                        >
                          {p.status}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pb-3 content">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-500" />
                        <span>Your bid: ${p.bidAmount}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
                        <span>
                          Submitted:{" "}
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="footer flex justify-between pt-3">
                    <Button outline={true}>View Details</Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalList;

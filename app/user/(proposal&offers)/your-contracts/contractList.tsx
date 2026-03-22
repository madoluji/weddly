// File: app/user/(proposal&offers)/your-contracts/comp/ContractList.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import Card from "@/app/ui/card";
import CardSkeleton from "@/app/ui/dashboard-components/skeletons/cardSkeleton";
import Link from "next/link";
import {
  CalculatorIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/app/providers";

interface Contract {
  id: string;
  title: string;
  company: string;
  jobId: string;
  price: string;
  paymentType: string;
  deadline: string;
  status: string;
  toDueDate: string;
  isNew: boolean;
}

const ContractList = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active tab from URL or default to "active-contracts"
  const activeTab = searchParams.get("tab") || "active-contracts";

  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      const response = await fetchWithAuth(
        `/api/fetch-contracts?freelancerId=${session?.user.id}&status=active,completed,canceled`
      );

      const { data } = await response.json();

      // Map the response data to the Contract structure
      const offers = data?.map((offer: any) => ({
        id: offer._id,
        title: offer.jobId?.title,
        company: offer.clientDetails?.fullName,
        price: offer.price,
        paymentType: offer.paymentType,
        deadline: offer.deadline,
        toDueDate: Math.ceil(
          (new Date(offer.deadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        ).toString(), // Convert to string as per interface
        jobId: offer.jobId._id,
        status: offer.status,
        isNew:
          new Date(offer.statusHistory[1].changedAt) >
          new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      }));

      setContract(offers);
      setLoading(false);
    };

    if (session?.user.id) {
      fetchContract();
    }
  }, [session?.user.id]);

  // Update URL when tab changes
  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Filter contracts based on active tab
  const filteredContracts = contract.filter((c) =>
    activeTab === "active-contracts"
      ? c.status === "active"
      : ["completed", "canceled"].includes(c.status)
  );

  return (
    <div>
      <div className="flex gap-10 border-b font-medium border-primary-400 mb-10 py-2">
        <span
          onClick={() => setActiveTab("active-contracts")}
          className={`cursor-pointer relative ${activeTab === "active-contracts" ? "active-tab" : ""}`}
        >
          Active Contracts
        </span>
        <span
          onClick={() => setActiveTab("archived-contracts")}
          className={`cursor-pointer relative ${activeTab === "archived-contracts" ? "active-tab" : ""}`}
        >
          Archived Contracts
        </span>
      </div>
      {activeTab === "active-contracts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))
            ) : filteredContracts.length === 0 ? (
              <div className="col-span-1 text-center">
                No contract offers available.
              </div>
            ) : (
              filteredContracts.map((offer) => (
                <Card key={offer.id} className="overflow-hidden">
                  <div className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="text-2xl font-semibold">
                        {offer.title}
                      </div>
                      {offer.deadline.includes("expires in 1") ||
                      offer.deadline.includes("expires in 2") ||
                      offer.deadline.includes("expires in 3") ? (
                        <div className="px-3 py-1 rounded-lg new-pin text-xs text-white bg-red-500">
                          High-priority
                        </div>
                      ) : offer.isNew ? (
                        <div className="px-3 py-1 rounded-lg new-pin text-xs text-white bg-green-500">
                          New
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-lg new-pin text-xs text-white bg-yellow-500">
                          Pending
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
                          Deadline: {new Date(offer.deadline).toDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="footer flex justify-between pt-3">
                    <div className="text-red-500 items-center flex py-2">
                      <ExclamationCircleIcon className="h-5 w-5 mr-1" />
                      {offer.toDueDate} days until due date
                    </div>
                    <Link
                      className="border flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 border-primary-500 hover:bg-zinc-100 text-primary-600 bg-transparent"
                      href={`/user/your-contracts/${offer.id}/${offer.jobId}`}
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

      {activeTab === "archived-contracts" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))
            ) : filteredContracts.length === 0 ? (
              <div className="col-span-1 text-center">
                No archived contracts found.
              </div>
            ) : (
              filteredContracts.map((offer) => (
                <Card key={offer.id} className="overflow-hidden">
                  <div className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="text-2xl font-semibold">
                        {offer.title}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-lg new-pin text-xs text-white ${
                          offer.status === "completed"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {offer.status}
                      </div>
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
                          Deadline: {new Date(offer.deadline).toDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="footer flex justify-between pt-3">
                    {/* <div className="text-red-500 items-center flex py-2">
                      <ExclamationCircleIcon className="h-5 w-5 mr-1" />
                      {offer.toDueDate} from to due date
                    </div> */}
                    <Link
                      className="border flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 border-primary-500 hover:bg-zinc-100 text-primary-600 bg-transparent"
                      href={`/user/your-contracts/${offer.id}/${offer.jobId}`}
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
    </div>
  );
};

export default ContractList;

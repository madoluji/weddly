"use client";

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";
import type React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

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
  const paymentType =
    searchParams.get("contractType") || searchParams.get("paymentType") || "";
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

  const filteredContracts = useMemo(() => {
    const scoped = search
      ? contracts.filter(
          (contract) =>
            contract.jobId.title.toLowerCase().includes(search.toLowerCase()) ||
            (contract.freelancerDetails?.fullName &&
              contract.freelancerDetails.fullName
                .toLowerCase()
                .includes(search.toLowerCase()))
        )
      : contracts;

    return scoped.sort((a, b) => {
      const aDeadline = a.deadline
        ? new Date(a.deadline).getTime() - Date.now()
        : Number.POSITIVE_INFINITY;
      const bDeadline = b.deadline
        ? new Date(b.deadline).getTime() - Date.now()
        : Number.POSITIVE_INFINITY;

      const aOpen = a.status === "active" || a.status === "pending";
      const bOpen = b.status === "active" || b.status === "pending";

      if (aOpen !== bOpen) return aOpen ? -1 : 1;
      if (aOpen && bOpen && aDeadline !== bDeadline) return aDeadline - bDeadline;

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [contracts, search]);

  const stats = useMemo(
    () => [
      {
        label: "Open Contracts",
        value: contracts.filter((item) => ["active", "pending"].includes(item.status))
          .length,
      },
      {
        label: "Archived Contracts",
        value: contracts.filter((item) =>
          ["completed", "canceled", "declined"].includes(item.status)
        ).length,
      },
      {
        label: "New Updates",
        value: contracts.filter(
          (item) =>
            item.updatedAt &&
            new Date(item.updatedAt) >
              new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        ).length,
      },
    ],
    [contracts]
  );

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
      <div className="bg-slate-50 border-l-4 border-primary-500 p-4 my-4 rounded">
        <p className="text-slate-700 font-medium">{error}</p>
        <p className="text-sm mt-1 text-slate-600">
          Please try refreshing the page or check your connection.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary-100 text-primary-700";
      case "pending":
        return "bg-primary-100 text-primary-700";
      case "completed":
        return "bg-primary-100 text-primary-700";
      case "canceled":
        return "bg-slate-100 text-slate-700";
      case "declined":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const cardAccent = (status: Contract["status"]) => {
    if (status === "completed") return "from-primary-50 via-white to-white";
    if (status === "canceled" || status === "declined") {
      return "from-slate-50 via-white to-white";
    }
    if (status === "pending") return "from-primary-50 via-white to-white";
    return "from-primary-50 via-white to-white";
  };

  const formatDate = (value?: string) => {
    if (!value) return "Not set";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Not set";

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const dueDays = (deadline?: string) => {
    if (!deadline) return null;
    const deadlineTime = new Date(deadline).getTime();
    if (Number.isNaN(deadlineTime)) return null;
    return Math.ceil((deadlineTime - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const dueDateLabel = (days: number | null) => {
    if (days === null) return "Deadline not available";
    if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "1 day remaining";
    return `${days} days remaining`;
  };

  const dueDateTone = (days: number | null) => {
    if (days === null) return "text-slate-500";
    if (days < 0) return "text-primary-700";
    if (days <= 3) return "text-primary-700";
    return "text-slate-500";
  };

  const formatPrice = (value: number, type: Contract["paymentType"]) =>
    type === "hourly" ? `$${value.toLocaleString()}/hr` : `$${value.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-sm"
          >
            <p className="font-label text-xs uppercase tracking-[0.18em] text-slate-400">
              {item.label}
            </p>
            <p className="font-headline mt-4 text-4xl text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      {filteredContracts.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredContracts.map((contract) => {
            const days = dueDays(contract.deadline);
            return (
              <article
                key={contract._id}
                className={`overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br ${cardAccent(
                  contract.status
                )} p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-label text-xs uppercase tracking-[0.18em] text-slate-400">
                      Client Contract
                    </p>
                    <h3 className="font-headline mt-3 text-3xl leading-tight text-slate-900 line-clamp-2">
                      {contract.jobId.title}
                    </h3>
                    <p className="font-body mt-2 text-sm text-slate-500">
                      With {contract.freelancerDetails?.fullName || "Freelancer"}
                    </p>
                    <p className="font-body mt-1 text-xs text-slate-400">
                      Updated {formatDate(contract.updatedAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(contract.status)}`}
                  >
                    {contract.status.charAt(0).toUpperCase() +
                      contract.status.slice(1)}
                  </span>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      Contract Value
                    </div>
                    <p className="mt-3 font-body text-lg font-semibold text-slate-900">
                      {formatPrice(contract.price, contract.paymentType)}
                    </p>
                    <p className="mt-2 text-sm capitalize text-slate-500">
                      {contract.paymentType} payment
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDaysIcon className="h-4 w-4" />
                      Deadline
                    </div>
                    <p className="mt-3 font-body text-lg font-semibold text-slate-900">
                      {formatDate(contract.deadline)}
                    </p>
                    <p className={`mt-2 text-sm ${dueDateTone(days)}`}>
                      {dueDateLabel(days)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-white/70 bg-white/80 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                          Freelancer
                        </p>
                        <p className="font-body text-sm font-semibold text-slate-900">
                          {contract.freelancerDetails?.fullName || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {contract.freelancerDetails?.location || "Location not set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <ClockIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                          Created
                        </p>
                        <p className="font-body text-sm font-semibold text-slate-900">
                          {formatDate(contract.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <DocumentTextIcon className="h-4 w-4" />
                    Review milestones and progress from the contract details page.
                  </div>

                  <Link
                    href={`/client/your-contracts/${contract._id}/${contract.jobId._id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary-500 hover:text-primary-700"
                  >
                    View Details
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-slate-400"
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
          <h3 className="font-headline text-3xl text-slate-900">No contracts found</h3>
          <p className="font-body mt-3 max-w-xl mx-auto text-base leading-7 text-slate-500">
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

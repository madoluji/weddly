"use client";

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";
import {
  ArrowTopRightOnSquareIcon,
  CalculatorIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

const ProposalList = () => {
  const [activeTab, setActiveTab] = useState("proposal-list");
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);

  interface ContractOffer {
    id: string;
    title: string;
    company: string;
    jobId: string;
    price: string;
    paymentType: string;
    deadline: string;
    eventDate?: string;
    location?: string;
    experience?: string;
    clientWeddingDate?: string;
    isNew: boolean;
    expiration: number;
  }

  interface Proposal {
    _id: string;
    title: string;
    bidAmount: string;
    status: string;
    createdAt: string;
    coverLetter: string;
    duration: string;
    attachments?: string[];
    jobId: {
      _id: string;
      title: string;
      eventDate?: string;
      location?: string;
      budget?: string;
      experience?: string;
      fullName?: string;
    };
    clientDetails?: {
      fullName?: string;
      targetWeddingDate?: string;
    } | null;
  }

  const [contractOffers, setContractOffers] = useState<ContractOffer[]>([]);
  const [proposal, setProposal] = useState<Proposal[]>([]);

  useEffect(() => {
    const fetchContractOffers = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(
          `/api/fetch-contracts?freelancerId=${session?.user.id}&status=pending`
        );
        const res = await fetchWithAuth(
          `/api/jobproposal?freelancerId=${session?.user.id}`
        );

        const { proposals } = await res.json();
        setProposal(proposals || []);

        const { data } = await response.json();

        const offers =
          data?.map((offer: any) => ({
            id: offer._id,
            title: offer.jobId?.title,
            company: offer.clientDetails?.fullName,
            price: offer.price,
            paymentType: offer.paymentType,
            deadline: offer.deadline,
            jobId: offer.jobId._id,
            eventDate: offer.jobId?.eventDate,
            location: offer.jobId?.location,
            experience: offer.jobId?.experience,
            clientWeddingDate: offer.clientDetails?.targetWeddingDate,
            expiration: Math.ceil(
              (new Date(offer.expiration).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            ),
            isNew:
              new Date(offer.createdAt) >
              new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          })) || [];

        setContractOffers(offers);
      } catch (error) {
        console.error("Failed to load proposals page", error);
        setContractOffers([]);
        setProposal([]);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user.id) {
      fetchContractOffers();
    }
  }, [session?.user.id]);

  const statusPillClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "shortlisted":
        return "bg-sky-100 text-sky-700";
      case "accepted":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-rose-100 text-rose-700";
      case "withdrawn":
        return "bg-slate-200 text-slate-700";
      case "canceled":
        return "bg-slate-900 text-white";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const offerTone = (daysLeft: number, isNew: boolean) => {
    if (daysLeft <= 3) {
      return {
        badge: "High Priority",
        badgeClass: "bg-rose-500 text-white",
        accent: "from-rose-50 to-white",
      };
    }

    if (isNew) {
      return {
        badge: "New",
        badgeClass: "bg-emerald-500 text-white",
        accent: "from-emerald-50 to-white",
      };
    }

    return {
      badge: "Pending",
      badgeClass: "bg-amber-400 text-slate-900",
      accent: "from-amber-50 to-white",
    };
  };

  const stats = useMemo(
    () => [
      {
        label: "Submitted Proposals",
        value: proposal.length,
      },
      {
        label: "Pending Offers",
        value: contractOffers.length,
      },
      {
        label: "Shortlisted",
        value: proposal.filter((item) => item.status === "shortlisted").length,
      },
    ],
    [contractOffers.length, proposal]
  );

  const tabs = [
    { id: "proposal-list", label: "Submitted Proposals", count: proposal.length },
    { id: "contract-offers", label: "Contract Offers", count: contractOffers.length },
  ];

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return "Not available";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const formatLocation = (location: unknown) => {
    if (!location) return "Not specified";

    if (typeof location === "string") {
      return location;
    }

    if (typeof location === "object") {
      const value = location as {
        address?: unknown;
        lat?: unknown;
        lng?: unknown;
      };

      if (typeof value.address === "string" && value.address.trim().length > 0) {
        return value.address;
      }

      if (
        typeof value.lat === "number" &&
        typeof value.lng === "number" &&
        Number.isFinite(value.lat) &&
        Number.isFinite(value.lng)
      ) {
        return `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}`;
      }
    }

    return "Not specified";
  };

  const renderLoadingCards = () => (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="mt-8 h-11 w-32 animate-pulse rounded-xl bg-slate-200" />
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (title: string, description: string) => (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center shadow-sm">
      <h3 className="font-headline text-3xl text-slate-900">{title}</h3>
      <p className="font-body mx-auto mt-3 max-w-xl text-base leading-7 text-slate-500">
        {description}
      </p>
    </div>
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-sm"
          >
            <p className="font-label text-xs uppercase tracking-[0.18em] text-slate-400">
              {item.label}
            </p>
            <p className="font-headline mt-4 text-4xl text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-between rounded-[1rem] px-4 py-3 text-left transition sm:min-w-[220px] ${
                activeTab === tab.id
                  ? "bg-primary-700 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="font-body text-sm font-semibold">{tab.label}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-white text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeTab === "contract-offers" && (
        <section>
          {loading ? (
            renderLoadingCards()
          ) : contractOffers.length === 0 ? (
            renderEmptyState(
              "No contract offers yet",
              "When a client wants to move forward, their offer will show up here so you can review the terms and respond quickly."
            )
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {contractOffers.map((offer) => {
                const tone = offerTone(offer.expiration, offer.isNew);

                return (
                  <article
                    key={offer.id}
                    className={`overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br ${tone.accent} p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-label text-xs uppercase tracking-[0.18em] text-slate-400">
                          Contract Offer
                        </p>
                        <h3 className="font-headline mt-3 text-3xl leading-tight text-slate-900">
                          {offer.title}
                        </h3>
                        <p className="font-body mt-2 text-sm text-slate-500">
                          From {offer.company || "Client"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badgeClass}`}
                      >
                        {tone.badge}
                      </span>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDaysIcon className="h-4 w-4" />
                          Event Date
                        </div>
                        <p className="mt-3 font-body text-lg font-semibold text-slate-900">
                          {formatEventDate(offer.eventDate || offer.clientWeddingDate)}
                        </p>
                      </div>

                      <div className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          Offered Rate
                        </div>
                        <p className="mt-3 font-body text-lg font-semibold text-slate-900">
                          {offer.paymentType === "hourly" ? "$/hr" : "$"}
                          {offer.price}
                        </p>
                      </div>

                      <div className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <CalculatorIcon className="h-4 w-4" />
                          Experience
                        </div>
                        <p className="mt-3 font-body text-lg font-semibold capitalize text-slate-900">
                          {offer.experience || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <ClockIcon className="h-4 w-4" />
                          Offer Deadline
                        </div>
                        <p className="mt-3 font-body text-lg font-semibold text-slate-900">
                          {new Date(offer.deadline).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPinIcon className="h-4 w-4" />
                          Location
                        </div>
                        <p className="mt-3 font-body text-lg font-semibold text-slate-900">
                          {formatLocation(offer.location)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-rose-500">
                        <ExclamationCircleIcon className="h-5 w-5" />
                        Expires in {offer.expiration} day
                        {offer.expiration === 1 ? "" : "s"}
                      </div>

                      <Link
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-primary-600 px-4 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                        href={`/user/offer/${offer.id}/${offer.jobId}`}
                      >
                        View Details
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === "proposal-list" && (
        <section>
          {loading ? (
            renderLoadingCards()
          ) : proposal.length === 0 ? (
            renderEmptyState(
              "No submitted proposals yet",
              "Once you send a proposal for a wedding gig, it will appear here with its latest status and a quick path back to the details."
            )
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {proposal.map((p) => (
                <article
                  key={p._id}
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-label text-xs uppercase tracking-[0.18em] text-slate-400">
                        Submitted Proposal
                      </p>
                      <h3 className="font-headline mt-3 text-3xl leading-tight text-slate-900">
                        {p.jobId.title}
                      </h3>
                      <p className="font-body mt-2 text-sm text-slate-500">
                        For {p.clientDetails?.fullName || p.jobId.fullName || "Client"}
                      </p>
                    </div>

                    {p.status && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPillClass(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    )}
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDaysIcon className="h-4 w-4" />
                        Event Date
                      </div>
                      <p className="mt-3 font-body text-lg font-semibold text-slate-900">
                        {formatEventDate(
                          p.jobId.eventDate || p.clientDetails?.targetWeddingDate
                        )}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        Your Bid
                      </div>
                      <p className="mt-3 font-body text-lg font-semibold text-slate-900">
                        ${p.bidAmount}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <ClockIcon className="h-4 w-4" />
                        Submitted
                      </div>
                      <p className="mt-3 font-body text-lg font-semibold text-slate-900">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPinIcon className="h-4 w-4" />
                        Location
                      </div>
                      <p className="mt-3 font-body text-lg font-semibold text-slate-900">
                        {formatLocation(p.jobId.location)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-white p-4">
                    <p className="font-label text-xs uppercase tracking-[0.18em] text-slate-400">
                      Cover Letter Preview
                    </p>
                    <p className="font-body mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                      {p.coverLetter || "No cover letter was included."}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end border-t border-slate-200 pt-5">
                    <Link
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-primary-600 px-4 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
                      href={`/user/your-proposals/${p._id}`}
                    >
                      View Details
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ProposalList;

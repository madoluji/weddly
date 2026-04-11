// File: app/user/(proposal&offers)/your-contracts/comp/ContractList.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import Link from "next/link";
import {
  ArchiveBoxIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  FolderOpenIcon,
  UserIcon,
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
  toDueDate: number | null;
  isNew: boolean;
  lastUpdated: string;
}

const ContractList = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get active tab from URL or default to "active-contracts"
  const activeTab = searchParams.get("tab") || "active-contracts";

  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(
          `/api/fetch-contracts?freelancerId=${session?.user.id}&status=active,completed,canceled`
        );
        const { data } = await response.json();

        const offers =
          data?.map((offer: any) => {
            const deadlineTime = offer.deadline
              ? new Date(offer.deadline).getTime()
              : NaN;
            const daysUntilDue = Number.isNaN(deadlineTime)
              ? null
              : Math.ceil((deadlineTime - Date.now()) / (1000 * 60 * 60 * 24));

            const changedAt =
              offer?.statusHistory?.[1]?.changedAt ||
              offer?.updatedAt ||
              offer?.createdAt;

            return {
              id: offer._id,
              title: offer.jobId?.title || "Untitled contract",
              company: offer.clientDetails?.fullName || "Client",
              price: offer.price,
              paymentType: offer.paymentType,
              deadline: offer.deadline,
              toDueDate: daysUntilDue,
              jobId: offer.jobId?._id || "",
              status: offer.status,
              lastUpdated: changedAt || offer.updatedAt || offer.createdAt,
              isNew:
                !!changedAt &&
                new Date(changedAt) >
                  new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            };
          }) || [];

        setContract(offers);
        setError(null);
      } catch (fetchError) {
        console.error("Failed to load contracts", fetchError);
        setContract([]);
        setError("Failed to load contracts. Please try again.");
      } finally {
        setLoading(false);
      }
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

  // Filter and prioritize contracts based on active tab
  const filteredContracts = useMemo(() => {
    const scoped = contract.filter((c) =>
      activeTab === "active-contracts"
        ? c.status === "active"
        : ["completed", "canceled"].includes(c.status)
    );

    if (activeTab === "active-contracts") {
      return scoped.sort((a, b) => {
        const aDays = a.toDueDate ?? Number.POSITIVE_INFINITY;
        const bDays = b.toDueDate ?? Number.POSITIVE_INFINITY;

        // Lower day count first: overdue (-) -> due today (0) -> due soon -> later
        if (aDays !== bDays) return aDays - bDays;

        return (
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      });
    }

    // Archived: newest updates first
    return scoped.sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }, [contract, activeTab]);

  const stats = useMemo(
    () => [
      {
        label: "Active Contracts",
        value: contract.filter((item) => item.status === "active").length,
      },
      {
        label: "Archived Contracts",
        value: contract.filter((item) =>
          ["completed", "canceled"].includes(item.status)
        ).length,
      },
      {
        label: "New Updates",
        value: contract.filter((item) => item.isNew).length,
      },
    ],
    [contract]
  );

  const tabs = [
    {
      id: "active-contracts",
      label: "Active Contracts",
      count: contract.filter((item) => item.status === "active").length,
      icon: FolderOpenIcon,
    },
    {
      id: "archived-contracts",
      label: "Archived Contracts",
      count: contract.filter((item) =>
        ["completed", "canceled"].includes(item.status)
      ).length,
      icon: ArchiveBoxIcon,
    },
  ];

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

  const formatPrice = (value: string, paymentType: string) => {
    const amount = Number(value);
    const formatted = Number.isFinite(amount)
      ? amount.toLocaleString("en-US")
      : value;

    return paymentType === "hourly" ? `$${formatted}/hr` : `$${formatted}`;
  };

  const paymentLabel = (paymentType: string) =>
    paymentType ? `${paymentType} payment` : "Payment type not set";

  const statusPillClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "completed":
        return "bg-primary-100 text-primary-700";
      case "canceled":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const cardAccent = (item: Contract) => {
    if (item.status === "completed") return "from-primary-50 via-white to-white";
    if (item.status === "canceled") return "from-rose-50 via-white to-white";
    if (item.toDueDate !== null && item.toDueDate <= 3) {
      return "from-primary-50 via-white to-white";
    }

    return "from-emerald-50 via-white to-white";
  };

  const badgeConfig = (item: Contract) => {
    if (item.status === "completed") {
      return { label: "Completed", className: "bg-primary-100 text-primary-700" };
    }

    if (item.status === "canceled") {
      return { label: "Canceled", className: "bg-rose-100 text-rose-700" };
    }

    if (item.toDueDate !== null && item.toDueDate <= 3) {
      return { label: "High Priority", className: "bg-rose-500 text-white" };
    }

    if (item.isNew) {
      return { label: "New", className: "bg-emerald-500 text-white" };
    }

    return { label: "On Track", className: "bg-slate-900 text-white" };
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
    if (days < 0) return "text-rose-600";
    if (days <= 3) return "text-primary-700";
    return "text-slate-500";
  };

  const renderLoadingCards = () => (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="w-full">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-32 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="h-28 animate-pulse rounded-[1.25rem] bg-slate-100" />
            <div className="h-28 animate-pulse rounded-[1.25rem] bg-slate-100" />
          </div>
          <div className="mt-4 h-20 animate-pulse rounded-[1.25rem] bg-slate-100" />
          <div className="mt-6 h-11 w-36 animate-pulse rounded-xl bg-slate-200" />
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
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-between gap-3 rounded-[1rem] px-4 py-3 text-left transition sm:min-w-[220px] ${
                  activeTab === tab.id
                    ? "bg-primary-700 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span className="font-body text-sm font-semibold">
                    {tab.label}
                  </span>
                </span>
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
            );
          })}
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 shadow-sm">
          <p className="font-body font-semibold">{error}</p>
          <p className="mt-1 text-sm text-rose-600">
            Refresh the page and try again.
          </p>
        </div>
      ) : loading ? (
        renderLoadingCards()
      ) : filteredContracts.length === 0 ? (
        renderEmptyState(
          activeTab === "active-contracts"
            ? "No active contracts right now"
            : "No archived contracts yet",
          activeTab === "active-contracts"
            ? "As soon as a contract becomes active, it will appear here with the latest payment, deadline, and client details."
            : "Completed and canceled contracts will move here automatically so your active workspace stays focused."
        )
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredContracts.map((offer) => {
            const badge = badgeConfig(offer);

            return (
              <article
                key={offer.id}
                className={`overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br ${cardAccent(
                  offer
                )} p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-label text-xs uppercase tracking-[0.18em] text-slate-400">
                      {activeTab === "active-contracts"
                        ? "Current Contract"
                        : "Archived Contract"}
                    </p>
                    <h3 className="font-headline mt-3 text-3xl leading-tight text-slate-900">
                      {offer.title}
                    </h3>
                    <p className="font-body mt-2 text-sm text-slate-500">
                      With {offer.company}
                    </p>
                    <p className="font-body mt-1 text-xs text-slate-400">
                      Updated {formatDate(offer.lastUpdated)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      Contract Value
                    </div>
                    <p className="mt-3 font-body text-lg font-semibold text-slate-900">
                      {formatPrice(offer.price, offer.paymentType)}
                    </p>
                    <p className="mt-2 text-sm capitalize text-slate-500">
                      {paymentLabel(offer.paymentType)}
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/70 bg-white/80 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDaysIcon className="h-4 w-4" />
                      Deadline
                    </div>
                    <p className="mt-3 font-body text-lg font-semibold text-slate-900">
                      {formatDate(offer.deadline)}
                    </p>
                    <p className={`mt-2 text-sm ${dueDateTone(offer.toDueDate)}`}>
                      {dueDateLabel(offer.toDueDate)}
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
                          Client
                        </p>
                        <p className="font-body text-sm font-semibold text-slate-900">
                          {offer.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <DocumentTextIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                          Status
                        </p>
                        <p
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusPillClass(
                            offer.status
                          )}`}
                        >
                          {offer.status.charAt(0).toUpperCase() +
                            offer.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDaysIcon className="h-4 w-4" />
                    Keep track of milestones and deliverables from the details
                    view.
                  </div>

                  <Link
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary-500 hover:text-primary-700"
                    href={`/user/your-contracts/${offer.id}/${offer.jobId}`}
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
    </div>
  );
};

export default ContractList;

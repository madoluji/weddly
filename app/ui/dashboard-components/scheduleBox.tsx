"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/providers";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

interface ContractResponse {
  _id: string;
  status: "pending" | "active" | "completed" | "canceled" | "declined";
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  jobId?: {
    _id?: string;
    title?: string;
  };
}

interface ScheduleItem {
  id: string;
  jobId: string;
  title: string;
  deadline: string;
  status: "pending" | "active" | "completed" | "canceled" | "declined";
}

const monthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

const dayLabel = (date: Date) => date.toLocaleDateString("en-US", { day: "2-digit" });

const toTitleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const statusTone = (status: ScheduleItem["status"]) => {
  if (status === "active") return "bg-primary-50 text-primary-700 border-primary-100";
  if (status === "pending") return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

const getBucketLabel = (value: Date) => {
  const today = startOfDay(new Date());
  const target = startOfDay(value);
  const diffDays = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return "This Week";
  return "Later";
};

const ScheduleBox = () => {
  const { session } = useAuth();
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const freelancerId = session?.user?.id;
    if (!freelancerId) {
      setLoading(false);
      return;
    }

    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(
          `/api/fetch-contracts?freelancerId=${freelancerId}&status=active,pending`
        );

        if (!response.ok) {
          setItems([]);
          return;
        }

        const { data } = await response.json();
        const mapped: ScheduleItem[] = (data || [])
          .map((contract: ContractResponse) => ({
            id: contract._id,
            jobId: contract.jobId?._id || "",
            title: contract.jobId?.title || "Untitled Contract",
            deadline: contract.deadline || contract.updatedAt || contract.createdAt || "",
            status: contract.status,
          }))
          .filter((item: ScheduleItem) => !!item.deadline)
          .sort(
            (a: ScheduleItem, b: ScheduleItem) =>
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          )
          .slice(0, 8);

        setItems(mapped);
      } catch (error) {
        console.error("Failed to load schedule:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [session?.user?.id]);

  const visibleItems = useMemo(() => items, [items]);

  const groupedItems = useMemo(() => {
    const order = ["Today", "Tomorrow", "This Week", "Later"] as const;
    const buckets: Record<(typeof order)[number], ScheduleItem[]> = {
      Today: [],
      Tomorrow: [],
      "This Week": [],
      Later: [],
    };

    visibleItems.forEach((item) => {
      const label = getBucketLabel(new Date(item.deadline));
      buckets[label].push(item);
    });

    return order
      .map((label) => ({ label, items: buckets[label] }))
      .filter((group) => group.items.length > 0);
  }, [visibleItems]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-primary-700">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M8 2v3M16 2v3M3.5 9.5h17M6 5h12a2.5 2.5 0 0 1 2.5 2.5V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V7.5A2.5 2.5 0 0 1 6 5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div>
              <h2 className="font-headline text-2xl font-medium leading-none text-slate-900 xl:text-[1.65rem]">Your Schedule</h2>
              <p className="mt-1.5 text-xs uppercase tracking-[0.12em] text-slate-500">Smart deadline view</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
          Upcoming milestones
        </p>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
          {visibleItems.length}
        </span>
      </div>

      <div className="mt-4 h-px bg-slate-200" />

      {loading ? (
        <div className="mt-5 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-16 w-14 rounded-md border border-slate-200 bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 rounded bg-slate-200 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleItems.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">
          No upcoming items yet. Active and pending contract deadlines will show up here.
        </p>
      ) : (
        <div className="mt-6 max-h-[440px] space-y-5 overflow-y-auto pr-1">
          {groupedItems.map((group) => (
            <div key={group.label} className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                  {group.label}
                </p>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="space-y-3.5">
                {group.items.map((item) => {
                  const date = new Date(item.deadline);
                  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
                  const isOverdue =
                    date.getTime() < Date.now() &&
                    item.status !== "completed" &&
                    item.status !== "canceled" &&
                    item.status !== "declined";
                  const timeLabel = hasTime
                    ? date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "Any time";

                  const href = item.jobId
                    ? `/user/your-contracts/${item.id}/${item.jobId}`
                    : "/user/your-contracts?tab=active-contracts";

                  return (
                    <Link
                      key={item.id}
                      href={href}
                      className="group flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white px-3 py-3.5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-600">
                          {monthLabel(date)}
                        </p>
                        <p className="font-headline mt-0.5 text-xl leading-none text-slate-900">
                          {dayLabel(date)}
                        </p>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium leading-tight text-slate-800 transition group-hover:text-slate-900">
                            {item.title}
                          </p>
                          <span
                            className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] ${statusTone(item.status)}`}
                          >
                            {toTitleCase(item.status)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {isOverdue && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                              Overdue
                            </span>
                          )}
                          <p className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600">
                            {timeLabel}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </section>
  );
};

export default ScheduleBox;

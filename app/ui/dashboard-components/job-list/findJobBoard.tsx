"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import SaveButton from "../../saveButton";
import PostingSkeleton from "../skeletons/postingSkeleton";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import {
  buildFindJobQueryParams,
  defaultFindJobFilters,
  type FindJobFilters,
  getApplyAction,
} from "@/app/lib/findJobFlow";

interface FindJob {
  jobId: string;
  title: string;
  type: string;
  experience: string;
  budget: string | number;
  description: string;
  tags: string[];
  location: string;
  saved: boolean;
  createdAt: string;
  fullName: string;
  status: "active" | "in-progress" | "completed" | "canceled" | string;
  eventDate?: string;
  hasApplied?: boolean;
  myProposalStatus?:
    | "pending"
    | "shortlisted"
    | "accepted"
    | "rejected"
    | "withdrawn"
    | "canceled"
    | null;
}

interface Props {
  initialFilters?: Partial<FindJobFilters>;
}

const BRAND = "#2f5f4a";
const PAGE_SIZE = 6;

const getTimeAgo = (dateString: string) => {
  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  const diffInSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  );

  if (diffInSeconds < 60) return "just now";

  for (const unit of units) {
    const value = Math.floor(diffInSeconds / unit.seconds);
    if (value >= 1) {
      return `${value} ${unit.label}${value > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};

const truncate = (text: string, limit = 190) => {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}...`;
};

const statusClasses: Record<string, string> = {
  active: "bg-[#2f5f4a]/10 text-[#2f5f4a] border-[#2f5f4a]/20",
  "in-progress": "bg-amber-100/70 text-amber-800 border-amber-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  canceled: "bg-rose-100/70 text-rose-700 border-rose-200",
};

const FindJobBoard = ({ initialFilters }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const mergedInitialFilters: FindJobFilters = {
    ...defaultFindJobFilters,
    ...initialFilters,
    experienceFilters: initialFilters?.experienceFilters || [],
    sortBy: initialFilters?.sortBy === "budget" ? "budget" : "newest",
  };

  const [jobs, setJobs] = useState<FindJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [titleSearch, setTitleSearch] = useState(mergedInitialFilters.search);
  const [locationSearch, setLocationSearch] = useState(mergedInitialFilters.location);
  const [selectedCategory, setSelectedCategory] = useState(mergedInitialFilters.category);
  const [experienceFilters, setExperienceFilters] = useState<string[]>(
    mergedInitialFilters.experienceFilters
  );
  const [budgetMin, setBudgetMin] = useState(mergedInitialFilters.minBudget);
  const [budgetMax, setBudgetMax] = useState(mergedInitialFilters.maxBudget);
  const [eventDateFilter, setEventDateFilter] = useState(mergedInitialFilters.eventDate);
  const [sortBy, setSortBy] = useState<"newest" | "budget">(
    mergedInitialFilters.sortBy
  );
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const lastSyncedQueryRef = useRef("");

  const categories = useMemo(() => {
    const baseCategories = [
      "All Categories",
      "Engagement (Wagdan)",
      "Pre-Wedding",
      "Haldi",
      "Mehendi",
      "Sangeet",
      "Wedding Day (Janti & Bibaha)",
      "Reception",
      "Post-Wedding (Mukh Herne)",
    ];

    const dynamicCategories = Array.from(
      new Set(jobs.map((job) => job.type).filter((type) => type && type.trim().length > 0))
    );

    return [...baseCategories, ...dynamicCategories.filter((category) => !baseCategories.includes(category))];
  }, [jobs]);

  const resetPageToFirst = () => {
    setPage(1);
  };

  const buildFiltersState = (): FindJobFilters => ({
    search: titleSearch,
    location: locationSearch,
    category: selectedCategory,
    experienceFilters,
    minBudget: budgetMin,
    maxBudget: budgetMax,
    eventDate: eventDateFilter,
    sortBy,
  });

  useEffect(() => {
    const query = buildFindJobQueryParams(buildFiltersState()).toString();
    if (query === lastSyncedQueryRef.current) {
      return;
    }

    lastSyncedQueryRef.current = query;
    const target = query.length > 0 ? `${pathname}?${query}` : pathname;
    router.replace(target, { scroll: false });
  }, [
    titleSearch,
    locationSearch,
    selectedCategory,
    experienceFilters,
    budgetMin,
    budgetMax,
    eventDateFilter,
    sortBy,
    pathname,
    router,
  ]);

  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      const isFirstPage = page === 1;

      if (active && isFirstPage) {
        setLoading(true);
      }

      if (active && !isFirstPage) {
        setLoadingMore(true);
      }

      try {
        const params = buildFindJobQueryParams(buildFiltersState());
        params.set("mostRecent", "true");
        params.set("sortBy", sortBy);
        params.set("page", `${page}`);
        params.set("limit", `${PAGE_SIZE}`);

        const response = await fetchWithAuth(`/api/fetchJobs?${params.toString()}`, {
          method: "GET",
          next: { revalidate: 3600 },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch jobs with status ${response.status}`);
        }

        const payload = await response.json();
        const incomingJobs = Array.isArray(payload?.jobs) ? payload.jobs : [];
        const pagination = payload?.pagination;

        if (active) {
          setJobs((previous) => {
            if (isFirstPage) {
              return incomingJobs;
            }

            const previousIds = new Set(previous.map((job) => job.jobId));
            const uniqueIncoming = incomingJobs.filter((job: FindJob) => !previousIds.has(job.jobId));
            return [...previous, ...uniqueIncoming];
          });

          setTotalJobs(
            typeof pagination?.total === "number"
              ? pagination.total
              : incomingJobs.length
          );
          setHasMore(Boolean(pagination?.hasMore));
        }
      } catch (error) {
        console.error("Error loading jobs:", error);
        if (active) {
          if (page === 1) {
            setJobs([]);
            setTotalJobs(0);
          }
          setHasMore(false);
        }
      } finally {
        if (active) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      loadJobs();
    }, page === 1 ? 300 : 0);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [
    titleSearch,
    locationSearch,
    selectedCategory,
    experienceFilters,
    budgetMin,
    budgetMax,
    eventDateFilter,
    sortBy,
    page,
  ]);

  const visibleJobs = jobs;

  const totalJobsCount = totalJobs > 0 || jobs.length === 0 ? totalJobs : jobs.length;

  const resetFilters = () => {
    setSelectedCategory("All Categories");
    setExperienceFilters([]);
    setBudgetMin("");
    setBudgetMax("");
    setEventDateFilter("");
    setLocationSearch("");
    setTitleSearch("");
    setSortBy("newest");
    setPage(1);
  };

  const toggleExperienceFilter = (experience: string) => {
    setPage(1);
    setExperienceFilters((current) =>
      current.includes(experience)
        ? current.filter((entry) => entry !== experience)
        : [...current, experience]
    );
  };

  if (loading) {
    return <PostingSkeleton />;
  }

  return (
    <div className="">
      <section className="border-b border-[#dbe5df] bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#ffffff]">
        <div className="mx-auto w-full  px-4 py-8 md:px-8">
          <p className="text-xs tracking-[0.22em] uppercase text-[#2f5f4a]/75">
            Weddly Marketplace
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#20382d] md:text-4xl">
            Find your perfect wedding gig
          </h1>
          
          <form
            className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
            }}
          >
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2f5f4a]/60" />
              <input
                value={titleSearch}
                onChange={(event) => {
                  setTitleSearch(event.target.value);
                  resetPageToFirst();
                }}
                placeholder="Job title, keyword, or skill"
                className="h-12 w-full rounded-lg border border-[#c8d8cf] bg-white pl-12 pr-4 text-sm text-[#1f2f27] shadow-[0_8px_24px_rgba(34,58,45,0.06)] focus:border-[#2f5f4a] focus:ring-[#2f5f4a]"
              />
            </div>
            <div className="relative">
              <MapPinIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2f5f4a]/60" />
              <input
                value={locationSearch}
                onChange={(event) => {
                  setLocationSearch(event.target.value);
                  resetPageToFirst();
                }}
                placeholder="City, state, or venue area"
                className="h-12 w-full rounded-lg border border-[#c8d8cf] bg-white pl-12 pr-4 text-sm text-[#1f2f27] shadow-[0_8px_24px_rgba(34,58,45,0.06)] focus:border-[#2f5f4a] focus:ring-[#2f5f4a]"
              />
            </div>
            <button
              type="submit"
              className="h-12 rounded-lg px-7 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(47,95,74,0.28)] transition hover:brightness-110"
              style={{ backgroundColor: BRAND }}
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <main className="mx-auto grid w-full  grid-cols-1 gap-6 px-4 py-6 md:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <aside className="h-fit rounded-xl border border-[#d2dfd8] bg-white p-5 shadow-[0_14px_35px_rgba(31,54,42,0.08)] lg:sticky lg:top-24">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#20382d]">Filters</h2>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-[#2f5f4a] hover:underline"
            >
              Reset
            </button>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#2c4639]">Category</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center gap-3 text-sm text-[#415e50]">
                  <input
                    type="radio"
                    name="job-category"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={(event) => {
                      setSelectedCategory(event.target.value);
                      resetPageToFirst();
                    }}
                    className="h-4 w-4 border-[#b8cbbf] text-[#2f5f4a] focus:ring-[#2f5f4a]"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="my-5 border-[#e7efeb]" />

          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#2c4639]">Experience Level</h3>
            <div className="space-y-2">
              {["Entry", "Intermediate", "Expert"].map((experience) => (
                <label key={experience} className="flex items-center gap-3 text-sm text-[#415e50]">
                  <input
                    type="checkbox"
                    checked={experienceFilters.includes(experience)}
                    onChange={() => toggleExperienceFilter(experience)}
                    className="h-4 w-4 rounded border-[#b8cbbf] text-[#2f5f4a] focus:ring-[#2f5f4a]"
                  />
                  <span>{experience}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="my-5 border-[#e7efeb]" />

          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#2c4639]">Budget / Rate</h3>
            <div className="flex flex-row items-center gap-2">
                <input
                  min="0"
                  placeholder="Min"
                  type="number"
                  value={budgetMin}
                  onChange={(event) => {
                    setBudgetMin(event.target.value);
                    resetPageToFirst();
                  }}
                  className="h-10 w-1/2 rounded-md border border-[#d2dfd8] text-sm text-[#1f2f27] placeholder:text-[#6c8478] focus:border-[#2f5f4a] focus:ring-[#2f5f4a]"
                />

                <span className="text-[#8fa59a]">-</span>

                <input
                  min="0"
                  placeholder="Max"
                  type="number"
                  value={budgetMax}
                  onChange={(event) => {
                    setBudgetMax(event.target.value);
                    resetPageToFirst();
                  }}
                  className="h-10 w-1/2 rounded-md border border-[#d2dfd8] text-sm text-[#1f2f27] placeholder:text-[#6c8478] focus:border-[#2f5f4a] focus:ring-[#2f5f4a]"
                />
                </div>
          </div>

          <hr className="my-5 border-[#e7efeb]" />

          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#2c4639]">Event Date</h3>
            <div className="relative">
              <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f8a7d]" />
              <input
                type="date"
                value={eventDateFilter}
                onChange={(event) => {
                  setEventDateFilter(event.target.value);
                  resetPageToFirst();
                }}
                className="h-10 w-full rounded-md border border-[#d2dfd8] pl-10 text-sm text-[#1f2f27] focus:border-[#2f5f4a] focus:ring-[#2f5f4a]"
              />
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-[#20382d]">
              {totalJobsCount} Jobs found
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#5c786b]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as "newest" | "budget");
                  resetPageToFirst();
                }}
                className="rounded-md border border-[#d2dfd8] bg-white py-2 pl-3 pr-8 text-sm font-medium text-[#2f5f4a] focus:border-[#2f5f4a] focus:ring-[#2f5f4a]"
              >
                <option value="newest">Newest</option>
                <option value="budget">Highest Budget</option>
              </select>
            </div>
          </div>

          {visibleJobs.length === 0 ? (
            <div className="rounded-xl border border-[#d2dfd8] bg-white px-6 py-10 text-center shadow-[0_10px_28px_rgba(31,54,42,0.08)]">
              <p className="text-base text-[#385247]">No wedding gigs found for your current filters.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-sm font-semibold text-[#2f5f4a] underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleJobs.map((job) => {
                const budgetLabel = `${job.budget ?? "N/A"}`;
                const applyAction = getApplyAction({
                  jobStatus: job.status,
                  hasApplied: job.hasApplied,
                  jobId: job.jobId,
                });

                return (
                  <article
                    key={job.jobId}
                    className="relative overflow-hidden rounded-xl border border-[#d2dfd8] bg-white p-5 shadow-[0_14px_35px_rgba(31,54,42,0.09)] transition hover:shadow-[0_18px_45px_rgba(31,54,42,0.15)]"
                  >
                    <SaveButton itemId={job.jobId} saved={job.saved} itemType="job" />
                    <div className="pr-8">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={clsx(
                            "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                            statusClasses[job.status] || statusClasses.active
                          )}
                        >
                          {job.status}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-[#627d71]">
                          <ClockIcon className="h-4 w-4" />
                          Posted {getTimeAgo(job.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-2 text-xl font-semibold text-[#1f3229]">{job.title}</h3>

                      <p className="mt-1 text-sm font-medium text-[#496459]">
                        {job.fullName || "Client"} • {job.type || "General"}
                      </p>

                      {job.eventDate && (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#5e7b6f]">
                          <CalendarDaysIcon className="h-4 w-4" />
                          Event Date: {new Date(job.eventDate).toLocaleDateString(undefined, { timeZone: "UTC" })}
                        </p>
                      )}

                      <p className="mt-3 text-sm leading-6 text-[#556f63]">
                        {truncate(job.description)}
                      </p>

                      {job.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.tags.map((tag) => (
                            <span
                              key={`${job.jobId}-${tag}`}
                              className="rounded-md bg-[#eef4f1] px-2.5 py-1 text-xs font-medium text-[#3f5c4f]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex flex-col gap-3 border-t border-[#e8efeb] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="inline-flex items-center gap-1 font-semibold text-[#1f3229]">
                            <CurrencyDollarIcon className="h-4 w-4 text-[#6b8579]" />
                            {budgetLabel}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#5d786c]">
                            <MapPinIcon className="h-4 w-4 text-[#6b8579]" />
                            {job.location}
                          </span>
                        </div>

                        {!applyAction.disabled ? (
                          <Link
                            href={applyAction.href}
                            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(47,95,74,0.28)] transition hover:brightness-110"
                            style={{ backgroundColor: BRAND }}
                          >
                            {applyAction.label}
                          </Link>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <button
                              type="button"
                              disabled
                              className="inline-flex items-center justify-center rounded-lg border border-[#d2dfd8] px-5 py-2.5 text-sm font-semibold text-[#81968c]"
                            >
                              {applyAction.label}
                            </button>
                            {job.hasApplied && job.myProposalStatus && (
                              <span className="text-xs text-[#607a6f] capitalize">
                                Status: {job.myProposalStatus.replace("-", " ")}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}

              {hasMore && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={loadingMore}
                    className="rounded-lg border border-[#cddad3] bg-white px-6 py-3 text-sm font-semibold text-[#2f5f4a] shadow-[0_10px_24px_rgba(34,58,45,0.08)] transition hover:bg-[#f2f7f4]"
                  >
                    {loadingMore ? "Loading..." : "Load More Jobs"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default FindJobBoard;

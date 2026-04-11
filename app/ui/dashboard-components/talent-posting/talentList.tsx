"use client";

import { BuildingLibraryIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import StarRating from "../../starRating";
import PostingSkeleton from "../skeletons/postingSkeleton";
import SaveButton from "../../saveButton";
import SafeImage from "@/app/ui/shared/SafeImage";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useRouter } from "next/navigation";

const truncateString = (str: string, num: number) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "... ";
};

interface Props {
  bestMatches?: boolean;
  savedFreelancers?: boolean;
  query?: string;
}

interface Freelancer {
  userId?: string;
  fullName?: string;
  email?: string;
  location?: string;
  phone?: string;
  skills?: string[];
  bio?: string;
  languages?: string[];
  rate?: string;
  saved: boolean;
  profilePicture: string;
  rating?: number;
}

const FreelancerList = ({ bestMatches, savedFreelancers, query }: Props) => {
  const [data, setData] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (bestMatches) params.append("bestMatches", "true");
        if (savedFreelancers) params.append("savedFreelancers", "true");
        if (query) {
          const queryParams = new URLSearchParams(query);
          queryParams.forEach((value, key) => {
            params.append(key, value);
          });
        }
        const response = await fetchWithAuth(`/api/freelancers?${params}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          next: { revalidate: 3600 },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { freelancers } = await response.json();
        setData(freelancers);
      } catch (error) {
        console.error("Error fetching freelancers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [query, bestMatches, savedFreelancers]);

  const loadFreelancerDetails = (freelancer: Freelancer) => {
    const params = new URLSearchParams(window.location.search);
    params.set("freelancerId", freelancer.userId || "");
    router.push(`?${params.toString()}`, { scroll: false });
    console.log("Freelancer details loaded:", freelancer);
  };

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <PostingSkeleton />
      ) : data.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          No wedding planners/coordinators found for this search.
        </div>
      ) : (
        data.map((freelancer, index) => (
          <div key={index} className="relative">
            <div
              className="group flex cursor-pointer flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(26,44,35,0.10)] sm:p-6"
              onClick={() => loadFreelancerDetails(freelancer)}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-[84px] w-[84px] items-center overflow-hidden rounded-full border border-slate-200">
                  <SafeImage
                    src={freelancer.profilePicture || "/images/image.png"}
                    alt="freelancer dp"
                    width={84}
                    height={84}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-headline text-2xl font-medium text-slate-900 transition-all duration-250 group-hover:text-primary-700 sm:text-3xl">
                    {freelancer.fullName || "Freelancer"}
                  </h2>
                  <p className="mt-2 inline-flex rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                    Available Now
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Booking Fee / Rate: {freelancer.rate || "N/A"} USD/hr
                    {freelancer.email ? ` • Contact: ${freelancer.email}` : ""}
                    {freelancer.phone ? ` • ${freelancer.phone}` : ""}
                  </p>
                </div>
              </div>

              <p className="leading-7 text-slate-700">
                {truncateString(freelancer.bio || "No introduction available.", 240)}
                {(freelancer.bio || "").length > 240 ? (
                  <button className="text-primary-700 hover:text-primary-500">
                    Read More
                  </button>
                ) : null}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {(freelancer.skills || []).slice(0, 6).map((skill, index) => (
                  <div
                    key={index}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700"
                  >
                    {skill}
                  </div>
                ))}
                {!freelancer.skills?.length && (
                  <span className="text-sm text-slate-500">Skills not listed</span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="flex text-sm font-medium text-slate-700">
                  <BuildingLibraryIcon className="mr-1 h-5 w-5" /> {freelancer.location || "Location not specified"}
                </p>
                <StarRating rating={freelancer.rating || 0} />
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/user/profile?userId=${freelancer.userId}`);
                  }}
                  className="rounded-xl bg-primary-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-primary-800"
                >
                  View Profile
                </button>
              </div>
            </div>
            <SaveButton
              itemId={freelancer.userId}
              saved={freelancer.saved}
              itemType="freelancer"
            />
          </div>
        ))
      )}
    </div>
  );
};

export default FreelancerList;

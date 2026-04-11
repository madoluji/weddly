"use client";

import {
  BuildingLibraryIcon,
  CalendarDaysIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useContext } from "react";
import SaveButton from "../../saveButton";
import { Appcontext } from "@/app/context/appContext";
import PostingSkeleton from "../skeletons/postingSkeleton";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import SafeImage from "@/app/ui/shared/SafeImage";

const truncateString = (str: string, num: number) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "... ";
};

interface Props {
  bestMatches?: boolean;
  mostRecent?: boolean;
  savedJobs?: boolean;
  query?: string;
}

export interface Job {
  title: string;
  time: string;
  type: string;
  budget: number; // Changed from string to number to match the provided data structure
  description: string;
  tags: string[];
  location: string;
  saved: boolean;
  jobId: string; // Added jobId field to match the provided data structure
  createdAt: string;
  fullName: string;
  fileUrls: string[];
  status: string;
  proposalCount: number;
  profilePicture?: string;
  eventDate?: string;
}

export const getTimeAgo = (dateString: string) => {
  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  const diffInSeconds = Math.floor(
    (new Date().getTime() - new Date(dateString).getTime()) / 1000
  );
  if (diffInSeconds < 60) return "just now";

  for (const unit of units) {
    const value = Math.floor(diffInSeconds / unit.seconds);
    if (value >= 1) return `${value} ${unit.label}${value > 1 ? "s" : ""} ago`;
  }

  return "just now";
};

// JobList component definition
const JobList = ({ bestMatches, mostRecent, savedJobs, query }: Props) => {
  // State variable to store fetched job data, initialized as an empty array
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const {
    setJobData,
    setJobDetailsVisible,
    // jobData,
    // jobDetailsVisible,
  } = useContext(Appcontext);

  // useEffect hook to fetch job data when the component mounts
  useEffect(() => {
    // Create an AbortController to allow aborting the fetch request
    const controller = new AbortController();

    // Async function to fetch job data from the API
    const fetchData = async () => {
      setLoading(true);
      try {
        // Build the query string based on the passed props
        const params = new URLSearchParams();
        if (bestMatches) params.append("bestMatches", "true");
        if (mostRecent) params.append("mostRecent", "true");
        if (savedJobs) params.append("savedJobs", "true");
        if (query) {
          const queryParams = new URLSearchParams(query);
          queryParams.forEach((value, key) => {
            params.append(key, value);
          });
        }

        const response = await fetchWithAuth(
          `/api/fetchJobs?${params.toString()}`,
          {
            method: "GET",
            next: { revalidate: 3600 }, // Supports Next.js revalidation
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const payload = await response.json();
        const jobs = Array.isArray(payload?.jobs) ? payload.jobs : [];
        setData(jobs);
      } catch (error) {
        // Log any errors that occur during the fetch
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    // Call the fetchData function to fetch job data
    fetchData();

    // Cleanup function to abort the fetch request if the component unmounts
    return () => {
      controller.abort();
    };
  }, [query, bestMatches, mostRecent, savedJobs]); // Empty dependency array means this effect runs once when the component mounts

  const loadJobDetails = (job: Job) => {
    setJobData(job);
    setJobDetailsVisible(true);
    console.log("Job details loaded:", job);
  };

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return "Date to be confirmed";

    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div className="flex  flex-col mt-8 w-full ">
      {loading ? (
        <PostingSkeleton />
      ) : data.length === 0 ? (
        <p className="text-center text-success-600/70 mt-5">
          No wedding gigs found. Try adjusting your search criteria.
        </p>
      ) : (
        data.map((job, index) => (
          <div key={index} className="relative">
            <div
              className={`flex flex-col gap-2 p-6 border border-primary-300/70 dark:border-dark-outline-variant rounded-3xl bg-white dark:bg-dark-surface shadow-[0_10px_30px_rgba(31,47,39,0.08)] group mb-5 hover:shadow-[0_14px_40px_rgba(31,47,39,0.12)] transition-all duration-300`}
              onClick={() => loadJobDetails(job)}
            >
              <div className="flex items-center gap-4 mb-2">
                <SafeImage
                  src={job.profilePicture || "/images/image.png"}
                  alt={job.fullName}
                  width={50}
                  height={50}
                  className="rounded-full object-cover w-12 h-12"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-dark-on-surface-variant">{job.fullName}</p>
                  <p className="text-xs text-success-600/60 dark:text-dark-on-surface-variant">
                    Posted {getTimeAgo(job.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between ">
                <h1 className="text-2xl text-success-600 font-medium group-hover:text-primary-700 transition-all duration-250 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-primary-600" />
                  {job.title}
                </h1>
                {/* {job.saved ? (
                <Liked className="w-6 h-6 text-red-600 " />
              ) : (
                <Unliked className="w-6 h-6  " />
              )} */}
              </div>
              <div className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-primary-200 dark:border-dark-outline-variant bg-primary-50 dark:bg-dark-surface-container px-4 py-2 text-sm font-semibold text-primary-700">
                <CalendarDaysIcon className="h-4 w-4" />
                Event Date: {formatEventDate(job.eventDate)}
              </div>
              <p className="text-sm mt-1 text-success-600/75 dark:text-dark-on-surface-variant">
                {job.type || "General"} • Booking Fee / Rate: ${job.budget}
              </p>
              <p className="text-success-600 dark:text-dark-on-surface-variant my-4 leading-7 ">
                {truncateString(job.description, 400)}
                {job.description.length > 400 ? (
                  <button className="text-primary-700 hover:text-primary-500">
                    Read More
                  </button>
                ) : null}
              </p>
              <div className="flex justify-start gap-5 flex-wrap items-center">
                {job.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-primary-100 dark:bg-dark-surface-container text-success-600 dark:text-dark-on-surface-variant px-4 py-2 text-sm flex flex-wrap justify-center items-center rounded-full border border-primary-300/70 dark:border-dark-outline-variant"
                  >
                    {tag}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-5">
                <p className="text-sm mt-3 flex items-center gap-1 font-medium text-success-600 dark:text-dark-on-surface-variant">
                  <BuildingLibraryIcon className="w-5 h-5" /> {job.location}
                </p>
                {job.status !== "active" && (
                  <p className="text-danger-600 text-sm mt-2">
                    This wedding gig is no longer active
                  </p>
                )}
              </div>
            </div>
            <SaveButton itemId={job.jobId} saved={job.saved} itemType={"job"} />
          </div>
        ))
      )}
    </div>
  );
};

export default JobList;

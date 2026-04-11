"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import {
  ClockIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  TagIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/app/providers";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import Link from "next/link";
import CardSkeleton from "../skeletons/cardSkeleton"; // Assuming CardSkeleton is the skeleton component

interface Job {
  id: string;
  _id: string;
  title: string;
  description: string;
  fullName: string;
  location: string;
  createdAt: string;
  budget: number;
  tags: string[];
  status: string;
  proposalCount: number;
}

// Helper function to calculate time ago
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
}

const ProjectCarousel: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { session, status } = useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    if (session?.user.id) {
      const fetchJobs = async () => {
        try {
          setLoading(true); // Start loading
          const response = await fetchWithAuth(
            `/api/fetchJobs?userId=${session?.user.id}`
          );

          if (response.status === 429) {
            setJobs([]);
            return;
          }

          if (!response.ok) {
            throw new Error(`Failed to fetch jobs: ${response.status}`);
          }

          const data = await response.json();
          const jobsList = Array.isArray(data?.jobs) ? data.jobs : [];

          // Filter jobs with status 'active' and sort by creation date in descending order
          const activeJobs = jobsList
            .filter((job: Job) => job.status === "active")
            .sort(
              (a: Job, b: Job) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          setJobs(activeJobs);
        } catch (error) {
          console.error("Error fetching jobs:", error);
        } finally {
          setLoading(false); // Stop loading
        }
      };

      fetchJobs();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session?.user.id, status]);

  // Update scroll position and max scroll
  useEffect(() => {
    const updateScrollInfo = () => {
      if (carouselRef.current) {
        setScrollPosition(carouselRef.current.scrollLeft);
        setMaxScroll(
          carouselRef.current.scrollWidth - carouselRef.current.clientWidth
        );
      }
    };

    // Initial update
    updateScrollInfo();

    // Update on resize
    window.addEventListener("resize", updateScrollInfo);

    // Update on scroll
    const currentRef = carouselRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", updateScrollInfo);
    }

    return () => {
      window.removeEventListener("resize", updateScrollInfo);
      if (currentRef) {
        currentRef.removeEventListener("scroll", updateScrollInfo);
      }
    };
  }, [jobs]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-64">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-7xl">
      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-background px-6 py-14 text-center md:px-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <SparklesIcon className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-4xl font-semibold">No wedding gigs yet</h3>
            <p className="mb-6 text-muted-foreground">
              You haven&apos;t posted any wedding gigs yet.
            </p>
            <Link
              href="/client/post-job"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90"
            >
              Create your first wedding gig
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Left scroll button */}
          <button
            onClick={scrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-background border border-border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
              scrollPosition <= 0
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
            aria-label="Scroll left"
            disabled={scrollPosition <= 0}
          >
            <ChevronLeftIcon className="w-5 h-5 text-foreground" />
          </button>

          {/* Carousel container */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-4 py-4 px-1 snap-x scrollbar-hide scroll-smooth"
            aria-label="Projects carousel"
          >
            {jobs.map((job) => (
              <div
                key={job._id || job.id}
                className="min-w-[320px] max-w-[320px] flex-shrink-0 snap-start border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-card overflow-hidden"
              >
                <div className="p-5">
                  <h2 className="text-xl font-semibold mb-2 line-clamp-1 text-card-foreground">
                    {job.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-2 text-sm h-10">
                    {job.description}
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-sm">
                      <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                      <p className="text-card-foreground truncate">
                        {job.fullName}
                      </p>
                    </div>
                    <div className="flex items-center text-sm">
                      <BuildingLibraryIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                      <p className="text-card-foreground truncate">
                        {job.location}
                      </p>
                    </div>
                    <div className="flex items-center text-sm">
                      <ClockIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                      <p className="text-card-foreground">
                        {getTimeAgo(job.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center text-sm">
                      <CurrencyDollarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                      <p className="text-card-foreground font-medium">
                        Booking Fee / Rate: ${job.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {job.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={`${job._id || job.id}-tag-${tag}-${index}`}
                        className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs flex items-center"
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {job.tags.length > 3 && (
                      <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                        +{job.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <Link
                      href={`/client/job-proposal/${job._id}`}
                      className="text-xs text-primary hover:text-primary/80 font-medium underline"
                    >
                      View Details
                    </Link>
                    {job.proposalCount > 0 && (
                      <span className="text-xs bg-green-100 text-green-500 dark:bg-green-500 dark:text-green-100 px-2 py-1 rounded-full font-medium">
                        {job.proposalCount}{" "}
                        {job.proposalCount === 1 ? "proposal" : "proposals"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right scroll button */}
          <button
            onClick={scrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-background border border-border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
              scrollPosition >= maxScroll
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
            aria-label="Scroll right"
            disabled={scrollPosition >= maxScroll}
          >
            <ChevronRightIcon className="w-5 h-5 text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectCarousel;

"use client";

import useFetch from "@/app/hooks/useFetch";
import React from "react";
import { getTimeAgo } from "../dashboard-components/job-list/jobList";
import {
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  ClockIcon,
  DocumentTextIcon,
  MapPinIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface JobDetailsProps {
  jobId: string;
}

type Data = {
  _id: string;
  userId: string;
  fullName: string;
  location: string;
  tags: string[];
  experience: string;
  budget: string;
  description: string;
  title: string;
  createdAt: string;
  fileUrls: string[] | [];
};

export function formatPostedDate(createdAt: string) {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 24) {
    return getTimeAgo(createdAt);
  }

  return createdDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

const JobDetails = ({ jobId }: JobDetailsProps) => {
  const { data } = useFetch<Data>(`/fetchJobs?jobId=${jobId}`);

  if (!data) {
    return (
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="h-8 w-3/4 rounded bg-slate-200" />
          <div className="h-20 rounded-2xl bg-slate-100" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-20 rounded-2xl bg-slate-100" />
            <div className="h-20 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-br from-white to-slate-50 px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
              Gig summary
            </p>
            <h2 className="mt-2 text-2xl font-medium leading-tight text-slate-900">
              {data.title}
            </h2>
          </div>
          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            Posted {formatPostedDate(data.createdAt || "")}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
        <div className="rounded-[1.5rem] bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3 text-slate-700">
                <TrophyIcon className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Experience
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {data.experience}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3 text-slate-700">
                <BanknotesIcon className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Budget
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    Booking Fee / Rate: Rs {data.budget}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2">
              <div className="flex items-center gap-3 text-slate-700">
                <MapPinIcon className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Location
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {data.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-primary-600" />
            <p className="text-base font-semibold text-slate-900">
              Project brief
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-7 text-slate-600">
              {data.description}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-primary-600" />
            <p className="text-base font-semibold text-slate-900">
              Attachments
            </p>
          </div>
          {data.fileUrls?.length > 0 ? (
            <div className="space-y-3">
              {data.fileUrls.map((url, index) => (
                <Link
                  key={index}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-primary-200 hover:text-primary-700"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Attachment {index + 1}</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No attachments were included with this gig.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;

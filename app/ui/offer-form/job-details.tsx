"use client";

import useFetch from "@/app/hooks/useFetch";
import React, { useEffect } from "react";
import { getTimeAgo } from "../dashboard-components/job-list/jobList";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { CurrencyRupeeIcon } from "@heroicons/react/24/solid";
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
    return;
  }

  return (
    <div className="border-[1px] border-gray-300 rounded-xl p-5 ">
      <p className="font-semibold text-xl">Wedding Gig Details</p>
      <div className="flex justify-between mt-2">
        <div className="py-5 space-y-8 border-r-[1px] border-gray-300 pr-5 flex-1">
          <p className="text-xl">{data?.title}</p>
          <p className="mt-3">
            {data?.tags.map((tag) => (
              <span key={tag} className="bg-gray-200 p-2 rounded-2xl  text-sm ">
                {tag}
              </span>
            ))}
            <span className=" p-1 mx-1 text-sm text-gray-500">
              Posted {formatPostedDate(data?.createdAt || "")}
            </span>
          </p>
          <p className="text-gray-500 text-sm">{data?.description}</p>
        </div>
        <div className="py-5 m-10 pr-14 text-md">
          <div className="flex flex-col gap-5">
            <div className="flex gap-2 justify-start items-center">
              <TrophyIcon className="w-5 h-5 text-primary-500" />
              <p className="text-black">{data?.experience}</p>
            </div>
            <div className="flex gap-2 justify-start items-center">
              <BanknotesIcon className="w-5 h-5 text-primary-500" />
              <p className="text-black">
                Booking Fee / Rate: $ {data?.budget}
              </p>
            </div>
            <div className="flex gap-2 justify-start items-center">
              <BuildingLibraryIcon className="w-5 h-5 text-primary-500" />
              <p className="text-black">{data?.location}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="font-medium text-xl border-t-[1px] py-5 border-gray-300 mt-14">
        Attachments
        <div className="flex gap-5 mt-2">
          {data.fileUrls?.length > 0 &&
            data?.fileUrls.map((url, index) => (
              <Link
                key={index}
                className="text-primary-500 text-sm hover:underline"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Attachment {index + 1}
              </Link>
            ))}
        </div>
      </p>
    </div>
  );
};

export default JobDetails;

"use client";

import useFetch from "@/app/hooks/useFetch";
import React from "react";
import {
  TrophyIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

interface FreelancerDetailProps {
  freelancerId: string;
}

type FreelancerData = {
  freelancerId: string;
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  location: string;
  skills: string[];
  workExperience: string[];
  projectPortfolio: string[];
  education: string[];
  bio?: string;
  languages: string[];
  rate: string;
  createdAt: string;
  updatedAt: string;
  industries: string[];
  saved: boolean;
  profilePicture?: string;
};

type ApiResponse = {
  freelancer: FreelancerData;
};

const FreelancerDetail = ({ freelancerId }: FreelancerDetailProps) => {
  const { data } = useFetch<ApiResponse>(`/freelancers?userId=${freelancerId}`);

  if (!data || !data.freelancer) {
    return null;
  }

  const freelancer = data.freelancer;

  return (
    // <div className="border-[1px] border-gray-300 rounded-xl p-5">
    <div className="">
      <p className="font-semibold text-xl">Wedding Specialist Details</p>
      <div className="flex mt-2">
        <div className="py-5 space-y-8 border-r-[1px] border-gray-300 pr-5 ">
          {/* Profile Image & Name */}
          <div className="flex items-center gap-4">
            {freelancer.profilePicture && (
              <Image
                width={300}
                height={300}
                src={freelancer.profilePicture}
                alt={freelancer.fullName}
                className="w-16 h-16 rounded-full border"
              />
            )}
            <div className="">
              <p className="text-xl font-semibold">{freelancer.fullName}</p>
              {/* Industries */}
              {freelancer.industries && (
                <p className="text-sm text-gray-500">
                  {freelancer.industries.join(" | ")}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {freelancer.bio && (
            <p className="text-gray-500 text-sm">{freelancer.bio}</p>
          )}
        </div>

        {/* Sidebar Section */}
        <div className=" m-10 pr-14 text-md">
          <div className="flex flex-col gap-5">
            <div className="flex gap-2 justify-start items-center">
              <TrophyIcon className="w-5 h-5 text-primary-500" />
              <p className="text-black">
                {freelancer.workExperience.length} years experience
              </p>
            </div>
            <div className="flex gap-2 justify-start items-center">
              <BanknotesIcon className="w-5 h-5 text-primary-500" />
              <p className="text-black">Booking Fee / Rate: ${freelancer.rate} / hour</p>
            </div>
            <div className="flex gap-2 justify-start items-center">
              <BuildingLibraryIcon className="w-5 h-5 text-primary-500" />
              <p className="text-black">{freelancer.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDetail;

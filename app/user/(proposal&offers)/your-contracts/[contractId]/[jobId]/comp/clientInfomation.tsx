"use client";
import useFetch from "@/app/hooks/useFetch";
import { UserIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

interface Props {
  jobId: string;
}

const ClientInfomation = ({ jobId }: Props) => {
  const {
    data: job,
    loading,
    error,
  } = useFetch<any>(`/fetchJobs?jobId=${jobId}`);

  if (loading) return <p>Loading...</p>;
  if (error || !job) return <p>Error loading job details</p>;
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Client Information</h2>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">{job?.fullName}</p>
            {/* <p className="text-sm text-gray-600">{contract.client.position}</p> */}
          </div>
        </div>
        <div className="space-y-3">
          <button className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-800 mt-2">
            <PaperAirplaneIcon className="h-4 w-4 mr-1" />
            <Link href={`/user/chatroom/`}>Send Message</Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientInfomation;

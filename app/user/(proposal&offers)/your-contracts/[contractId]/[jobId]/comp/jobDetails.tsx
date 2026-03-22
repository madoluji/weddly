"use client";
import useFetch from "@/app/hooks/useFetch";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { CalendarDaysIcon, UserIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

type Data = {
  _id: string;
  userId: string;
  status: string;
  fullName: string;
  location: string;
  tags: string[];
  experience: string;
  budget: string;
  description: string;
  title: string;
  statusHistory: any;
  createdAt: string;
  fileUrls: string[] | [];
};

export default function JobDetails({ jobId }: { jobId: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const {
    data: job,
    loading,
    error,
  } = useFetch<Data>(`/fetchJobs?jobId=${jobId}`);

  if (loading) return <p>Loading...</p>;
  if (error || !job) return <p>Error loading job details</p>;

  return (
    // <div className="bg-white lg:col-span-2 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
    //   <div className="p-6 pb-3">
    //     <div className="flex justify-between items-start">
    //       <div>
    //         <h2 className="text-2xl font-semibold">{job.title}</h2>
    //         <p className="text-base mt-1 text-gray-600">{job.fullName}</p>
    //       </div>
    //       <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
    //         Posted:{" "}
    //         {new Date(job.createdAt).toLocaleDateString("en-US", {
    //           day: "2-digit",
    //           month: "short",
    //           year: "numeric",
    //         })}
    //       </span>
    //     </div>
    //   </div>
    //   <div className="px-6 pb-6">
    //     <div className="space-y-6">
    //       <div>
    //         <h3 className="font-medium text-lg mb-3">Project Description</h3>
    //         <p className="text-gray-600">{job.description}</p>
    //       </div>

    //       <div>
    //         <h3 className="font-medium text-lg mb-3">Requirement skills</h3>
    //         <ul className="list-disc pl-5 space-y-1 text-gray-600">
    //           {job.tags.map((req: string, index: number) => (
    //             <li key={index}>{req}</li>
    //           ))}
    //         </ul>
    //       </div>
    //       {job.fileUrls.length > 0 && (
    //         <div>
    //           <h3 className="font-medium text-lg mb-3">Attachments</h3>
    //           <ul className="list-disc pl-5 space-y-1 text-gray-600">
    //             {job.fileUrls.map((fileUrl: string, index: number) => (
    //               <li key={index}>
    //                 <a
    //                   href={fileUrl}
    //                   target="_blank"
    //                   rel="noopener noreferrer"
    //                   className="text-blue-600 hover:underline"
    //                 >
    //                   Attachment {index + 1}
    //                 </a>
    //               </li>
    //             ))}
    //           </ul>
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </div>
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
              <UserIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">{job?.fullName}</p>
              {/* <p className="text-sm text-gray-600">{contract.client.position}</p> */}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(job.status)}`}
          >
            {job.status}
          </span>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800">
            <CalendarDaysIcon className="h-4 w-4 mr-1" />
            Project Start Date:{" "}
            {new Date(job.statusHistory[1].changedAt).toDateString()}
          </span>
        </div>
      </div>
      <p className="text-gray-600 mt-4">{job.description}</p>
    </div>
  );
}

"use client";
import useFetch from "@/app/hooks/useFetch";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import React, { useEffect, useState } from "react";

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

export default function JobDetails({ jobId }: { jobId: string }) {
  const {
    data: job,
    loading,
    error,
  } = useFetch<Data>(`/fetchJobs?jobId=${jobId}`);

  if (loading) return <p>Loading...</p>;
  if (error || !job) return <p>Error loading job details</p>;

  return (
    <div className="bg-white lg:col-span-2 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold">{job.title}</h2>
            <p className="text-base mt-1 text-gray-600">{job.fullName}</p>
          </div>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
            Posted:{" "}
            {new Date(job.createdAt).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
      <div className="px-6 pb-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-3">Project Description</h3>
            <p className="text-gray-600">{job.description}</p>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-3">Requirement skills</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              {job.tags.map((req: string, index: number) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          {job.fileUrls.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-3">Attachments</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                {job.fileUrls.map((fileUrl: string, index: number) => (
                  <li key={index}>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Attachment {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import {
  ClockIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  TagIcon,
  UserIcon,
  SparklesIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  XMarkIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline"
import { getTimeAgo } from "../../dashboard-components/job-list/jobList"
import Link from "next/link"
import { getLocationDisplay } from "@/app/lib/jobLocation"

const JobLocationPreview = dynamic(() => import("@/app/ui/maps/JobLocationPreview"), {
  ssr: false,
})

interface Job {
  _id: string
  fullName: string
  location: string
  locationMeta?: unknown
  createdAt: string
  budget: number
  tags: string[]
  title: string
  description: string
  proposalCount: number
  // Add other job properties as needed
}

interface JobDetailsModalProps {
  job: Job | null
  onClose: () => void
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const locationValue = job?.locationMeta ?? job?.location
  const locationLabel = getLocationDisplay(locationValue)

  useEffect(() => {
    // Handle escape key press
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    // Handle click outside modal
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscapeKey)
    document.addEventListener("mousedown", handleClickOutside)

    // Prevent scrolling on body when modal is open
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "auto"
    }
  }, [onClose])

  if (!job) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{job.title}</h2>
              <p className="text-sm text-gray-500 mt-1">Gig ID: {job._id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full p-1"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Gig Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4 flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Posted by</p>
                <p className="font-medium text-gray-900">{job.fullName}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4 flex items-center space-x-3">
              <BuildingLibraryIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{locationLabel}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4 flex items-center space-x-3">
              <ClockIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Posted</p>
                <p className="font-medium text-gray-900">{getTimeAgo(job.createdAt)}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4 flex items-center space-x-3">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Booking Fee / Rate</p>
                <p className="font-medium text-gray-900">₹{job.budget.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-3">
              <BuildingLibraryIcon className="h-5 w-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Pinned Location</h3>
            </div>
            <JobLocationPreview location={locationValue} />
          </div>

          {/* Gig Description */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <DocumentTextIcon className="h-5 w-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Gig Description</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>
          </div>

          {/* Required Skills */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <TagIcon className="h-5 w-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Required Skills</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              {job.tags && job.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No specific skills listed</p>
              )}
            </div>
          </div>

          {/* Proposals */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <UserGroupIcon className="h-5 w-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Proposals</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1 rounded-full mr-3">
                    {job.proposalCount} Proposals
                  </span>
                  <p className="text-gray-700">
                    {job.proposalCount === 0
                      ? "No proposals yet"
                      : job.proposalCount === 1
                        ? "1 wedding specialist has applied"
                        : `${job.proposalCount} wedding specialists have applied`}
                  </p>
                </div>
                <Link
                  href={`/client/job-proposal/${job._id}`}
                  className="inline-flex items-center text-primary-600 hover:text-primary-500 font-medium"
                >
                  View all proposals
                  <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-between">
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={onClose}
          >
            <PencilSquareIcon className="h-4 w-4 mr-2" />
            Edit Job
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobDetailsModal


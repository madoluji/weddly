"use client"

import type React from "react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth"
import JobDetailsModal from "@/app/ui/client-components/jobdetailsmodal/jobdetailscard"
import {
  SparklesIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  TagIcon,
  DocumentTextIcon,
  UserGroupIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"

interface Job {
  _id: string
  title: string
  description: string
  proposalCount: number
  fullName: string
  location: string
  status: string
  createdAt: string
  budget: number
  tags: string[]
}

interface AllJobsListProps {
  userId: string
}

const AllJobsList: React.FC<AllJobsListProps> = ({ userId }) => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("active")

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetchWithAuth(`/api/fetchJobs?userId=${userId}`)
      const data = await response.json()
      setJobs(data.jobs)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchJobs()
    }
  }, [userId, fetchJobs])

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
  }

  const handleCloseModal = () => {
    setSelectedJob(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const filteredJobs = jobs
    .filter(
      (job) =>
        (sortBy === "active" && job.status === "active") ||
        (sortBy === "completed" && job.status === "completed") ||
        (sortBy === "all" && job.status !== ""),
    )
    .filter(
      (job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div className="text-sm text-gray-500">
          {filteredJobs.length} result{filteredJobs.length === 1 ? "" : "s"}
          {searchTerm || sortBy !== "active" ? " after filters" : ""}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchJobs}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <a
            href="/client/post-job"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Post New Wedding Gig
          </a>
        </div>
      </div>

      {/* Search and filter */}
      <div className="bg-gray-50 border rounded-lg mb-6 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
              placeholder="Search wedding gigs by title or description..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="active">Active Gigs</option>
              <option value="completed">Completed Gigs</option>
              <option value="all">All Gigs</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 w-full rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <SparklesIcon className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No wedding gigs posted yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first wedding gig posting.</p>
          <div className="mt-6">
            <a
              href="/client/post-job"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Post Your First Wedding Gig
            </a>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No matching wedding gigs found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          <div className="mt-6">
            <button
              onClick={() => {
                setSearchTerm("")
                setSortBy("active")
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              onClick={() => handleJobClick(job)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden cursor-pointer border border-gray-100"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <SparklesIcon className="h-5 w-5 text-primary-500 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {job.tags &&
                        job.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                    </div>

                    <p className="mt-3 text-gray-600 line-clamp-2">
                      <DocumentTextIcon className="inline-block h-4 w-4 mr-1 text-gray-400" />
                      {job.description}
                    </p>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <BuildingLibraryIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {job.location || "Remote"}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        Posted on {formatDate(job.createdAt)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <CurrencyRupeeIcon className="h-4 w-4 mr-1 text-gray-400" />
                        Booking Fee / Rate: Rs{job.budget.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-center">
                    <div className="bg-primary-50 rounded-full p-3">
                      <UserGroupIcon className="h-6 w-6 text-primary-500" />
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-2xl font-bold text-primary-600">{job.proposalCount}</span>
                      <p className="text-xs text-gray-500">Proposals</p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="bg-gray-50 px-6 py-3 flex justify-end gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => handleJobClick(job)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  View Details
                </button>
                <Link
                  href={`/client/job-proposal/${job._id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Open Proposals →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && <JobDetailsModal job={selectedJob} onClose={handleCloseModal} />}
    </div>
  )
}

export default AllJobsList

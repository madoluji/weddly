"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth"
import {
  ClockIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  TagIcon,
  UserIcon,
  PaperClipIcon,
  SparklesIcon,
  UserGroupIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline"
import { getTimeAgo } from "../../dashboard-components/job-list/jobList"
import JobProposalModal from "@/app/ui/client-components/joblist-client/joblistpopupmodal"
import Image from "next/image"

interface Proposal {
  _id: string
  jobId: {
    _id: string
  }
  userId: string
  clientId: string
  attachments: string
  coverLetter: string
  bidAmount: number
  createdAt: string
}

interface Job {
  id: string
  title: string
  description: string
  proposalCount: number
  fullName: string
  location: string
  createdAt: string
  budget: number
  tags: string[]
}

interface Freelancer {
  userId: string
  fullName: string
  profilePicture: string
}

interface AllProposalsListProps {
  jobId: string
}

const AllProposalsList: React.FC<AllProposalsListProps> = ({ jobId }) => {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [freelancers, setFreelancers] = useState<{ [key: string]: Freelancer }>({})
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    const fetchJobAndProposals = async () => {
      try {
        // Fetch job details
        const jobResponse = await fetchWithAuth(`/api/fetchJobs?jobId=${jobId}`)
        const jobData = await jobResponse.json()
        setJob(jobData)

        // Fetch proposals
        const proposalsResponse = await fetchWithAuth(`/api/jobproposal?jobId=${jobId}`)
        const proposalsData = await proposalsResponse.json()
        setProposals(proposalsData.proposals)

        // Fetch freelancer data for each proposal
        const freelancerData = await Promise.all(
          proposalsData.proposals.map(async (proposal: Proposal) => {
            const response = await fetchWithAuth(`/api/freelancers?userId=${proposal.userId}`)
            const data = await response.json()
            return {
              userId: proposal.userId,
              fullName: data.freelancer.fullName,
              profilePicture: data.freelancer.profilePicture,
            }
          }),
        )

        // Store freelancer data in state
        const freelancerMap: { [key: string]: Freelancer } = {}
        freelancerData.forEach((freelancer) => {
          freelancerMap[freelancer.userId] = freelancer
        })
        setFreelancers(freelancerMap)
      } catch (error) {
        console.error("Error fetching job and proposals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobAndProposals()
  }, [jobId])

  const handleProposalClick = (proposal: Proposal) => {
    setSelectedProposal(proposal)
  }

  const handleCloseModal = () => {
    setSelectedProposal(null)
  }

  const getSortedProposals = () => {
    return [...proposals].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy === "highest") {
        return b.bidAmount - a.bidAmount
      } else if (sortBy === "lowest") {
        return a.bidAmount - b.bidAmount
      }
      return 0
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <ArrowPathIcon className="h-10 w-10 text-primary-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      ) : (
        <>
          {/* Wedding Gig Details Card */}
          {job && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="bg-primary-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center">
                  <SparklesIcon className="h-6 w-6 text-primary-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Wedding Gig Details</h2>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{job.title}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center">
                    <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Posted by</p>
                      <p className="font-medium">{job.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <BuildingLibraryIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Venue / Location</p>
                      <p className="font-medium">{job.location || "Remote"}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <ClockIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Posted</p>
                      <p className="font-medium">{getTimeAgo(job.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Booking Fee / Rate</p>
                      <p className="font-medium">Rs{job.budget.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {job.tags && job.tags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          <TagIcon className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Proposals Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-primary-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <UserGroupIcon className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Proposals</h2>
                  <p className="text-sm text-gray-500">
                    {proposals.length} {proposals.length === 1 ? "wedding specialist has" : "wedding specialists have"} applied to this
                    gig
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <label htmlFor="sortBy" className="text-sm text-gray-500 mr-2">
                  Sort by:
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Bid</option>
                  <option value="lowest">Lowest Bid</option>
                </select>
              </div>
            </div>

            {proposals.length === 0 ? (
              <div className="p-12 text-center">
                <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No proposals yet</h3>
                <p className="text-gray-500">Check back later for new proposals.</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getSortedProposals().map((proposal) => (
                    <div
                      key={`${proposal._id}-${proposal.userId}`}
                      onClick={() => handleProposalClick(proposal)}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer bg-white flex flex-col"
                    >
                      <div className="p-5 flex-grow">
                        <div className="flex items-start mb-4">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3 overflow-hidden">
                            {freelancers[proposal.userId]?.profilePicture ? (
                              <Image
                                src={freelancers[proposal.userId].profilePicture || "/placeholder.svg"}
                                alt={freelancers[proposal.userId]?.fullName || "Wedding Specialist"}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-5 w-5 text-primary-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {freelancers[proposal.userId]?.fullName || "Wedding Specialist"}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {formatDate(proposal.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center mb-1">
                            <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-500 mr-1" />
                            <p className="text-sm text-gray-500">Cover Letter</p>
                          </div>
                          <p className="text-gray-700 text-sm line-clamp-3">
                            {truncateText(proposal.coverLetter, 150)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-1" />
                            <span className="font-bold text-green-600">Rs {proposal.bidAmount.toLocaleString()}</span>
                          </div>

                          {proposal.attachments && (
                            <div className="flex items-center text-primary-600 text-sm">
                              <PaperClipIcon className="h-4 w-4 mr-1" />
                              <span>Attachment</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between items-center">
                        <div className="flex items-center">
                          <CheckBadgeIcon className="h-4 w-4 text-primary-600 mr-1" />
                          <span className="text-sm text-gray-600">View Details</span>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedProposal && <JobProposalModal proposal={selectedProposal} onClose={handleCloseModal} />}
        </>
      )}
    </div>
  )
}

export default AllProposalsList


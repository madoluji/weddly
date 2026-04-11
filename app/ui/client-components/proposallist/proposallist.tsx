"use client"

import type React from "react"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth"
import { useRouter } from "next/navigation"
import {
  ArrowPathIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  TagIcon,
  TrashIcon,
  UserGroupIcon,
  UserIcon,
  PaperClipIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"
import { getTimeAgo } from "../../dashboard-components/job-list/jobList"
import JobProposalModal from "@/app/ui/client-components/joblist-client/joblistpopupmodal"
import SafeImage from "@/app/ui/shared/SafeImage"
import { getLocationDisplay } from "@/app/lib/jobLocation"

const JobLocationPreview = dynamic(() => import("@/app/ui/maps/JobLocationPreview"), {
  ssr: false,
})

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
  locationMeta?: unknown
  createdAt: string
  budget: number
  tags: string[]
  eventDate?: string
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
  const router = useRouter()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [freelancers, setFreelancers] = useState<{ [key: string]: Freelancer }>({})
  const [sortBy, setSortBy] = useState<string>("newest")
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string>("")

  useEffect(() => {
    const fetchJobAndProposals = async () => {
      try {
        const jobResponse = await fetchWithAuth(`/api/fetchJobs?jobId=${jobId}`)
        const jobData = await jobResponse.json()
        setJob(jobData)

        const proposalsResponse = await fetchWithAuth(`/api/jobproposal?jobId=${jobId}`)
        const proposalsData = await proposalsResponse.json()
        setProposals(proposalsData.proposals)

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
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortBy === "highest") {
        return b.bidAmount - a.bidAmount
      }
      if (sortBy === "lowest") {
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

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return "Date to be confirmed"

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(dateString))
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const handleDeleteGig = async () => {
    if (isDeleting) return

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this gig? This action cannot be undone.",
    )

    if (!isConfirmed) return

    setIsDeleting(true)
    setDeleteError("")

    try {
      const response = await fetchWithAuth(`/api/post-job?jobId=${jobId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete gig")
      }

      router.push("/client/best-matches")
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete gig"
      setDeleteError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const sortedProposals = getSortedProposals()
  const highestBid = proposals.length ? Math.max(...proposals.map((proposal) => proposal.bidAmount)) : 0
  const lowestBid = proposals.length ? Math.min(...proposals.map((proposal) => proposal.bidAmount)) : 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {loading ? (
        <div className="flex h-72 flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-white">
          <ArrowPathIcon className="mb-4 h-10 w-10 animate-spin text-primary-500" />
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      ) : (
        <>
          {job && (
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white editorial-shadow">
              <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-primary-50/40 px-6 py-8 sm:px-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                      <SparklesIcon className="h-4 w-4" />
                      Client proposal review
                    </div>
                    <h1 className="mt-5 text-3xl font-medium leading-tight text-slate-900 sm:text-4xl">
                      {job.title}
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                      Review proposals, compare rates, and move forward with the
                      wedding specialist that best matches this event.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                    <button
                      type="button"
                      onClick={handleDeleteGig}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-500"
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      {isDeleting ? "Deleting..." : "Delete Gig"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-start">
                <div className="space-y-6">
                  {deleteError && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
                      {deleteError}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Event Date
                      </p>
                      <p className="mt-3 text-lg font-semibold text-slate-900">
                        {formatEventDate(job.eventDate)}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Proposals
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">
                        {proposals.length}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Lowest Bid
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">
                        Rs {lowestBid ? lowestBid.toLocaleString() : "0"}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Highest Bid
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">
                        Rs {highestBid ? highestBid.toLocaleString() : "0"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Posted by
                          </p>
                          <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                            {job.fullName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                          <BuildingLibraryIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Venue / Location
                          </p>
                          <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                            {getLocationDisplay(job.locationMeta ?? job.location)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                          <ClockIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Posted
                          </p>
                          <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                            {getTimeAgo(job.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                          <CurrencyDollarIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Booking Fee / Rate
                          </p>
                          <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
                            Rs {job.budget.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {job.tags && job.tags.length > 0 && (
                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Required Skills
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700"
                            >
                              <TagIcon className="h-3.5 w-3.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
                  <JobLocationPreview location={job.locationMeta ?? job.location} className="rounded-[1.25rem]" />
                </div>
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white editorial-shadow">
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center">
                  <UserGroupIcon className="mr-3 h-6 w-6 text-primary-600" />
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Proposals</h2>
                    <p className="text-sm text-slate-500">
                      {proposals.length} {proposals.length === 1 ? "proposal has" : "proposals have"} been submitted for this gig
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label htmlFor="sortBy" className="text-sm font-medium text-slate-500">
                    Sort by
                  </label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-primary-300"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Bid</option>
                    <option value="lowest">Lowest Bid</option>
                  </select>
                </div>
              </div>
            </div>

            {proposals.length === 0 ? (
              <div className="p-12 text-center">
                <UserGroupIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="mb-1 text-lg font-medium text-gray-900">No proposals yet</h3>
                <p className="text-gray-500">Check back later for new proposals.</p>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  {sortedProposals.map((proposal) => (
                    <div
                      key={`${proposal._id}-${proposal.userId}`}
                      onClick={() => handleProposalClick(proposal)}
                      className="group cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(27,28,26,0.08)]"
                    >
                      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white px-5 py-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100">
                              {freelancers[proposal.userId]?.profilePicture ? (
                                <SafeImage
                                  src={freelancers[proposal.userId].profilePicture || "/placeholder.svg"}
                                  alt={freelancers[proposal.userId]?.fullName || "Wedding Specialist"}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <UserIcon className="h-5 w-5 text-primary-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-semibold text-slate-900">
                                {freelancers[proposal.userId]?.fullName || "Wedding Specialist"}
                              </h3>
                              <p className="mt-1 flex items-center text-sm text-slate-500">
                                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                                Submitted {formatDate(proposal.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700">
                            Rs {proposal.bidAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5 p-5">
                        <div>
                          <div className="mb-2 flex items-center">
                            <ChatBubbleLeftRightIcon className="mr-2 h-4 w-4 text-slate-400" />
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Cover Letter
                            </p>
                          </div>
                          <p className="text-sm leading-7 text-slate-700">
                            {truncateText(proposal.coverLetter, 180)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <CurrencyDollarIcon className="h-4 w-4 text-primary-700" />
                              <span className="font-medium text-slate-800">Bid placed</span>
                            </div>

                            {proposal.attachments && (
                              <div className="flex items-center gap-1.5 text-primary-700">
                                <PaperClipIcon className="h-4 w-4" />
                                <span>Attachment</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center text-sm font-medium text-primary-700">
                            <CheckBadgeIcon className="mr-1.5 h-4 w-4" />
                            View Details
                            <ChevronRightIcon className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {selectedProposal && <JobProposalModal proposal={selectedProposal} onClose={handleCloseModal} />}
        </>
      )}
    </div>
  )
}

export default AllProposalsList

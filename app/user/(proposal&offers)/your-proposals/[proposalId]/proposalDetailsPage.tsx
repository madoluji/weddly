"use client";

import { useMemo } from "react";
import Link from "next/link";
import useFetch from "@/app/hooks/useFetch";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import JobDetails from "@/app/ui/proposal/job-details";

interface ProposalDetailsPageProps {
  proposalId: string;
}

interface ProposalData {
  _id: string;
  bidAmount: number;
  coverLetter: string;
  attachments?: string[];
  duration: string;
  status: string;
  createdAt: string;
  jobId: {
    _id: string;
    title: string;
  };
}

const statusStyles: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  shortlisted: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  withdrawn: "bg-slate-100 text-slate-700 border-slate-200",
  canceled: "bg-slate-900 text-white border-slate-900",
};

const ProposalDetailsPage = ({ proposalId }: ProposalDetailsPageProps) => {
  const { data, loading } = useFetch<{ proposals: ProposalData[] }>(
    `/jobproposal?proposalId=${proposalId}`
  );

  const proposal = useMemo(() => data?.proposals?.[0], [data]);

  const formattedDate = proposal
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(proposal.createdAt))
    : "";

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <div className="w-full animate-pulse space-y-6">
          <div className="h-12 w-48 rounded bg-slate-200" />
          <div className="h-64 rounded-[2rem] bg-slate-100" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="h-96 rounded-[2rem] bg-slate-100" />
            <div className="h-96 rounded-[2rem] bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="mx-auto flex w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-medium text-slate-900">
            Proposal not found
          </h1>
          <p className="mt-3 text-slate-500">
            We couldn&apos;t find the submitted proposal you were trying to view.
          </p>
          <Link
            href="/user/your-proposals"
            className="mt-6 inline-flex items-center rounded-full border border-primary-200 px-5 py-3 text-sm font-semibold text-primary-700"
          >
            Back to my proposals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="flex w-full flex-col gap-6 lg:gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 editorial-shadow">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.5fr)_280px] lg:px-10 lg:py-10">
            <div className="space-y-5">
              <Link
                href="/user/your-proposals"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-primary-700"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to my proposals
              </Link>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">
                  Submitted proposal
                </p>
                <h1 className="text-4xl font-medium leading-tight text-slate-900 sm:text-5xl">
                  {proposal.jobId.title}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  This is the proposal you already sent for this wedding gig.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
              <div
                className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold capitalize ${
                  statusStyles[proposal.status] || statusStyles.pending
                }`}
              >
                {proposal.status}
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Your bid
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    Rs {proposal.bidAmount.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Submitted on
                  </p>
                  <p className="mt-2 text-base font-medium text-slate-900">
                    {formattedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start lg:gap-8">
          <div className="order-2 flex flex-col gap-6 lg:order-1">
            <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <p className="text-2xl font-semibold text-slate-900">
                  Proposal summary
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  A snapshot of the proposal you submitted to the client.
                </p>
              </div>

              <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                      <CurrencyDollarIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Bid amount
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        Rs {proposal.bidAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                      <ClockIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Timeline
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">
                        {proposal.duration}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                      <CalendarDaysIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Submitted on
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-700" />
                  <p className="text-2xl font-semibold text-slate-900">
                    Cover letter
                  </p>
                </div>
              </div>

              <div className="px-5 py-5 sm:px-6">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                    {proposal.coverLetter}
                  </p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-2">
                  <PaperClipIcon className="h-5 w-5 text-primary-700" />
                  <p className="text-2xl font-semibold text-slate-900">
                    Attachments
                  </p>
                </div>
              </div>

              <div className="space-y-3 px-5 py-5 sm:px-6">
                {proposal.attachments && proposal.attachments.length > 0 ? (
                  proposal.attachments.map((attachment, index) => (
                    <Link
                      key={`${attachment}-${index}`}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-primary-200 hover:text-primary-700"
                    >
                      <span>Attachment {index + 1}</span>
                      <DocumentTextIcon className="h-4 w-4" />
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    No attachments were included with this proposal.
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
            <JobDetails jobId={proposal.jobId._id} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetailsPage;

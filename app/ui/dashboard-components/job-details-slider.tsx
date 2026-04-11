"use client";

import { Appcontext } from "@/app/context/appContext";
import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  FolderOpenIcon,
  TagIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useContext } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import SafeImage from "@/app/ui/shared/SafeImage";
import SaveButton from "../saveButton";
import ApplyProposalButton from "./apply-proposal-button";

const JobDetailsSlider: React.FC = () => {
  const { session } = useAuth();
  const {
    jobData: job,
    jobDetailsVisible,
    setJobDetailsVisible,
  } = useContext(Appcontext);

  const onClose = () => {
    setJobDetailsVisible(false);
  };

  const getTimeAgo = (dateString: string) => {
    const diffInSeconds = Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / 1000
    );

    const units = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];

    for (const unit of units) {
      const value = Math.floor(diffInSeconds / unit.seconds);
      if (value >= 1) {
        return `${value} ${unit.label}${value > 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  };

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return "Date to be confirmed";

    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const metaItems = [
    {
      label: "Posted by",
      value: job?.fullName || "Client",
      icon: UserIcon,
    },
    {
      label: "Location",
      value: job?.location || "Location not provided",
      icon: BuildingLibraryIcon,
    },
    {
      label: "Posted",
      value: getTimeAgo(job?.createdAt || new Date().toISOString()),
      icon: ClockIcon,
    },
    {
      label: "Budget",
      value: `Booking Fee / Rate: Rs ${job?.budget ?? "-"}`,
      icon: CurrencyDollarIcon,
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-100 ${
        jobDetailsVisible ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-1000 ${
          jobDetailsVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative flex h-full w-full max-w-3xl transform flex-col overflow-hidden border-l border-slate-200 dark:border-dark-outline-variant bg-[#f9fafb] dark:bg-dark-surface-container shadow-2xl transition-transform duration-1000 ${
          jobDetailsVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-outline-variant bg-white dark:bg-dark-surface px-4 py-4 sm:px-6">
          <button
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-dark-on-surface-variant transition hover:text-slate-900 dark:hover:text-dark-on-surface"
            onClick={onClose}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>

          <div className="relative flex h-10 w-10 items-center justify-center">
            <SaveButton itemId={job?.jobId} saved={job?.saved} itemType="job" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
            <section className="border-b border-slate-200 dark:border-dark-outline-variant pb-8">
              <div className="flex items-start gap-4">
                <SafeImage
                  src={job?.profilePicture || "/images/image.png"}
                  alt={job?.fullName || "Client"}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                    Wedding gig
                  </p>
                  <h2 className="mt-3 text-3xl font-medium leading-tight text-slate-900 dark:text-dark-on-surface">
                    {job?.title}
                  </h2>
                  <p className="mt-3 text-sm text-slate-500 dark:text-dark-on-surface-variant">
                    {job?.fullName || "Client"} posted this opportunity{" "}
                    {getTimeAgo(job?.createdAt || new Date().toISOString())}
                  </p>
                </div>
              </div>
            </section>

            <section className="border-b border-slate-200 dark:border-dark-outline-variant pb-8">
              <div className="rounded-[1.5rem] border border-primary-100 dark:border-dark-outline-variant bg-primary-50/60 dark:bg-dark-surface-container px-5 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-dark-surface text-primary-700 shadow-sm">
                    <CalendarDaysIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                      Event Date
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-dark-on-surface">
                      {formatEventDate(job?.eventDate)}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-dark-on-surface-variant">
                      Plan your availability around the actual event day before
                      sending your proposal.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-x-6 gap-y-5 border-b border-slate-200 dark:border-dark-outline-variant pb-8 sm:grid-cols-2">
              {metaItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-dark-surface-container text-slate-600 dark:text-dark-on-surface-variant">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-dark-on-surface-variant">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-800 dark:text-dark-on-surface">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="border-b border-slate-200 dark:border-dark-outline-variant pb-8">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-dark-surface-container text-slate-600 dark:text-dark-on-surface-variant">
                  <DocumentTextIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-on-surface">
                    Job Description
                  </h3>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-dark-on-surface-variant">
                    {job?.description || "No description available."}
                  </p>
                </div>
              </div>
            </section>

            <section className="border-b border-slate-200 dark:border-dark-outline-variant pb-8">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-dark-surface-container text-slate-600 dark:text-dark-on-surface-variant">
                  <TagIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-on-surface">
                    Required Skills
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {job?.tags?.length ? (
                      job.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="rounded-full border border-slate-200 dark:border-dark-outline-variant bg-slate-100 dark:bg-dark-surface-container px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-dark-on-surface-variant"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-dark-on-surface-variant">
                        No specific skills listed.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-x-6 gap-y-8 border-b border-slate-200 dark:border-dark-outline-variant pb-8 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-dark-surface-container text-slate-600 dark:text-dark-on-surface-variant">
                  <UserGroupIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-on-surface">
                    Activity
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-dark-on-surface-variant">
                    <div className="flex items-center justify-between">
                      <span>Proposals</span>
                      <span className="font-semibold text-slate-900 dark:text-dark-on-surface">
                        {job?.proposalCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-dark-surface-container text-slate-600 dark:text-dark-on-surface-variant">
                  <FolderOpenIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-on-surface">
                    Attachments
                  </h3>
                  <div className="mt-4 space-y-3">
                    {job?.fileUrls && job.fileUrls.length > 0 ? (
                      job.fileUrls.map((url, index) => (
                        <Link
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-dark-outline-variant px-4 py-3 text-sm text-slate-700 dark:text-dark-on-surface-variant transition hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-dark-surface-container"
                        >
                          <span>Attachment {index + 1}</span>
                          <DocumentTextIcon className="h-4 w-4" />
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-dark-on-surface-variant">
                        No attachments available.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {jobDetailsVisible && (
              <section className="pb-2">
                <div className="rounded-2xl bg-white dark:bg-dark-surface">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-on-surface">
                    Apply for this gig
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-dark-on-surface-variant">
                    If this listing feels right, send a clear and thoughtful
                    proposal.
                  </p>
                  <ApplyProposalButton
                    jobId={job?.jobId}
                    userId={session?.user.id}
                  />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsSlider;

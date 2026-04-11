"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import JobDetails from "./job-details";
import Terms from "./term";
import CoverLetter from "./cover-letter";
import Duration from "./duration";
import { useAuth } from "@/app/providers";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "@/app/lib/firebase";
import { Button } from "../button";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import Alert from "../alert";

interface ProposalFormProps {
  jobId: string;
}

const ProposalForm = ({ jobId }: ProposalFormProps) => {
  const { session } = useAuth();
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [customDuration, setCustomDuration] = useState<string>("");
  const [customDurationUnit, setCustomDurationUnit] = useState<"days" | "months">("days");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const storage = getStorage(app); // Firebase Storage reference
  const formatCustomDuration = (value: string, unit: "days" | "months") => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    const numericValue = Number(trimmedValue);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return "";

    const normalizedUnit = numericValue === 1 ? unit.slice(0, -1) : unit;
    return `${numericValue} ${normalizedUnit}`;
  };

  const resolvedDuration =
    duration === "custom"
      ? formatCustomDuration(customDuration, customDurationUnit)
      : duration;
  const completedSteps = [bidAmount.trim(), coverLetter.trim(), resolvedDuration].filter(
    Boolean
  ).length;
  const progressPercent = Math.round((completedSteps / 3) * 100);

  useEffect(() => {
    if (!showSuccessPopup) return;

    const redirectTimer = window.setTimeout(() => {
      router.push("/user/best-matches");
    }, 2200);

    return () => window.clearTimeout(redirectTimer);
  }, [router, showSuccessPopup]);

  // Upload files to Firebase Storage
  const uploadFiles = async () => {
    if (files.length === 0) return [];

    const uploadPromises = files.map(async (file) => {
      const fileRef = ref(
        storage,
        `proposals/${jobId}/${session?.user?.id}/${file.name}`
      );
      await uploadBytes(fileRef, file);
      return getDownloadURL(fileRef);
    });

    return Promise.all(uploadPromises);
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitted(true);
    setAlert(null); // Clear previous alerts

    // Frontend validation
    if (!bidAmount.trim() || !coverLetter.trim() || !resolvedDuration) {
      setAlert({
        type: "error",
        message: "Please fill in all required fields.",
      });
      return;
    }

    if (parseFloat(bidAmount) < 10) {
      setAlert({
        type: "error",
        message: "The minimum bid amount is Rs 10.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedFiles = await uploadFiles();

      const proposalData = {
        jobId,
        bidAmount,
        coverLetter,
        duration: resolvedDuration,
        attachments: uploadedFiles,
      };

      const response = await fetchWithAuth(
        `/api/submit-proposal/${session?.user.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(proposalData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to submit proposal");
      }

      setShowSuccessPopup(true);
      setAlert(null);
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.message || "Error submitting proposal",
      });

      setFiles([]); // Clear selected files after submission
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 lg:gap-8">
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-[3px]">
          <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
                  Submission complete
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Proposal sent successfully
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Your proposal has been submitted. We&apos;ll redirect you to
                  your best matches page in a moment.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Redirecting to `Best Matches`...
            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full origin-left animate-[pulse_1.4s_ease-in-out_infinite] rounded-full bg-primary-700" />
            </div>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-[2rem] border border-primary-100 bg-gradient-to-br from-white via-slate-50 to-primary-50/40 editorial-shadow">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.5fr)_280px] lg:px-10 lg:py-10">
          <div className="space-y-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">
              <SparklesIcon className="h-4 w-4" />
              Freelancer proposal
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-medium leading-tight text-slate-900 sm:text-5xl">
                Present your offer with clarity and confidence.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Share your pricing, timeline, and approach in a cleaner layout
                that feels polished, modern, and aligned with the rest of the
                freelancer experience.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Submission checklist
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Complete the essentials before sending.
                </p>
              </div>
              <div className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">
                {progressPercent}%
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full cta-gradient transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              {[
                {
                  label: "Set a bid amount",
                  complete: Boolean(bidAmount.trim()),
                },
                {
                  label: "Add your cover letter",
                  complete: Boolean(coverLetter.trim()),
                },
                {
                  label: "Choose a timeline",
                  complete: Boolean(resolvedDuration),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <CheckCircleIcon
                    className={`h-5 w-5 ${
                      item.complete ? "text-primary-600" : "text-slate-300"
                    }`}
                  />
                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {alert && <Alert type={alert.type} message={alert.message} />}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start lg:gap-8">
        <form
          onSubmit={handleSubmit}
          className="order-2 flex flex-col gap-6 lg:order-1"
        >
          <Terms
            bidAmount={bidAmount}
            setBidAmount={setBidAmount}
            isSubmitted={isSubmitted}
          />

          <CoverLetter
            coverLetter={coverLetter}
            setCoverLetter={setCoverLetter}
            isSubmitted={isSubmitted}
            files={files}
            setFiles={setFiles}
          />

          <Duration
            duration={duration}
            setDuration={setDuration}
            customDuration={customDuration}
            setCustomDuration={setCustomDuration}
            customDurationUnit={customDurationUnit}
            setCustomDurationUnit={setCustomDurationUnit}
            isSubmitted={isSubmitted}
          />

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                  <DocumentTextIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    Ready to send your proposal?
                  </p>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                    Review your rate, message, and timeline one last time before
                    submitting to the client.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className={`h-12 min-w-[180px] rounded-full px-6 text-sm font-semibold text-white shadow-sm ${
                  isSubmitting ? "bg-gray-400" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            </div>
          </div>
        </form>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
          <JobDetails jobId={jobId} />
        </aside>
      </div>
    </div>
  );
};

export default ProposalForm;

"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

import SafeImage from "@/app/ui/shared/SafeImage";
import useFirebaseAuth from "@/app/hooks/useFirebaseAuth";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { jobCategories, skills as predefinedSkills } from "@/app/lib/data";
import {
  type JobLocation,
  getLocationDisplay,
  toLocationPayload,
} from "@/app/lib/jobLocation";
import { storage } from "../../lib/firebase";

type PaymentType = "fixed" | "hourly";

type FormDataState = {
  title: string;
  type: string;
  eventDate: string;
  paymentType: PaymentType;
  minimumBudget: string;
  maximumBudget: string;
  description: string;
  tags: string[];
  location: JobLocation | null;
  locationText: string;
};

const PAYMENT_TYPES: Array<{ value: PaymentType; label: string }> = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Hourly Rate" },
];

const FEATURED_SKILLS_COUNT = 6;
const DRAFT_STORAGE_KEY = "weddly:post-job:job-details-draft";

const SKILL_ICON_MAP: Record<string, string> = {
  Photography: "camera_alt",
  Videography: "videocam",
  "Floral Design": "local_florist",
  DJ: "music_note",
  Catering: "restaurant",
  Makeup: "brush",
};

const JobLocationPicker = dynamic(
  () => import("@/app/ui/maps/JobLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl bg-surface-container-low px-4 py-5 text-sm text-on-surface-variant">
        Loading map...
      </div>
    ),
  }
);

const buildBudgetLabel = (
  paymentType: PaymentType,
  minimumBudget: string,
  maximumBudget: string
): string => {
  const min = minimumBudget.trim();
  const max = maximumBudget.trim();
  if (min && max)
    return `${min} - ${max} (${paymentType === "fixed" ? "Fixed" : "Hourly"})`;
  if (min) return `From ${min} (${paymentType === "fixed" ? "Fixed" : "Hourly"})`;
  if (max) return `Up to ${max} (${paymentType === "fixed" ? "Fixed" : "Hourly"})`;
  return "";
};

function getDaysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatWeddingDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function LivePreview({
  formData,
  computedBudget,
}: {
  formData: FormDataState;
  computedBudget: string;
}) {
  const daysUntil = getDaysUntil(formData.eventDate);
  const weddingDateFormatted = formatWeddingDate(formData.eventDate);

  return (
    <div className="sticky top-6 flex flex-col gap-4">
      {formData.eventDate && (
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-6 text-on-primary shadow-[0_20px_40px_rgba(47,95,74,0.28)]">
          <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/5" />
          <p className="[font-family:var(--font-inter)] text-[10px] uppercase tracking-[0.2em] text-on-primary/70">
            Occasion Date
          </p>
          <p className="mt-2 [font-family:var(--font-noto-serif)] text-xl leading-snug text-on-primary">
            {weddingDateFormatted}
          </p>
          {daysUntil !== null && (
            <div className="mt-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-on-primary/80">
                hourglass_top
              </span>
              <p className="[font-family:var(--font-inter)] text-sm font-semibold text-on-primary">
                {daysUntil > 0
                  ? `${daysUntil} day${daysUntil !== 1 ? "s" : ""} to go`
                  : daysUntil === 0
                  ? "Today!"
                  : `${Math.abs(daysUntil)} days ago`}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-5">
        <p className="[font-family:var(--font-inter)] text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
          Listing Preview
        </p>
        <p className="mt-3 [font-family:var(--font-noto-serif)] text-lg leading-snug text-on-surface">
          {formData.title || (
            <span className="italic text-base text-on-surface-variant/50">
              Your title will appear here
            </span>
          )}
        </p>
        {formData.type && (
          <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 [font-family:var(--font-inter)] text-xs font-medium text-primary">
            {formData.type}
          </span>
        )}
        <div className="mt-4 flex flex-col gap-2">
          {computedBudget && (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-base text-primary">payments</span>
              <span>{computedBudget}</span>
            </div>
          )}
          {formData.locationText && (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-base text-primary">location_on</span>
              <span className="line-clamp-1">{formData.locationText}</span>
            </div>
          )}
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-container-highest px-2 py-0.5 [font-family:var(--font-inter)] text-xs text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-5">
        <p className="[font-family:var(--font-inter)] text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
          Completeness
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {[
            { label: "Title", done: Boolean(formData.title.trim()) },
            { label: "Occasion type", done: Boolean(formData.type) },
            { label: "Occasion date", done: Boolean(formData.eventDate) },
            { label: "Location", done: Boolean(formData.locationText.trim()) },
            { label: "Description", done: Boolean(formData.description.trim()) },
            { label: "Skills / tags", done: formData.tags.length > 0 },
            { label: "Budget", done: Boolean(computedBudget) },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={clsx(
                  "material-symbols-outlined text-base",
                  done ? "text-primary" : "text-on-surface-variant/30"
                )}
              >
                {done ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span
                className={clsx(
                  "[font-family:var(--font-inter)] text-xs",
                  done ? "text-on-surface" : "text-on-surface-variant/50"
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const DetailsForm = () => {
  const router = useRouter();

  const initialFormData: FormDataState = {
    title: "",
    type: "",
    eventDate: "",
    paymentType: "fixed",
    minimumBudget: "",
    maximumBudget: "",
    description: "",
    tags: [],
    location: null,
    locationText: "",
  };

  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string>("");

  useFirebaseAuth();

  useEffect(() => {
    try {
      const draftValue = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftValue) return;
      const parsedDraft = JSON.parse(draftValue) as Partial<FormDataState>;
      setFormData((prev) => ({
        ...prev,
        ...parsedDraft,
        tags: Array.isArray(parsedDraft.tags) ? parsedDraft.tags : prev.tags,
      }));
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, []);

  // useMemos in correct dependency order:
  // 1. featuredSkills
  const featuredSkills = useMemo(
    () => predefinedSkills.slice(0, FEATURED_SKILLS_COUNT),
    []
  );

  // 2. selectableSkills
  const selectableSkills = useMemo(
    () => predefinedSkills.filter((skill) => !formData.tags.includes(skill)),
    [formData.tags]
  );

  // 3. computedBudget — MUST be before completedFields
  const computedBudget = useMemo(
    () =>
      buildBudgetLabel(
        formData.paymentType,
        formData.minimumBudget,
        formData.maximumBudget
      ),
    [formData.paymentType, formData.minimumBudget, formData.maximumBudget]
  );

  // 4. completedFields (depends on computedBudget)
  const completedFields = useMemo(
    () =>
      [
        Boolean(formData.title.trim()),
        Boolean(formData.type),
        Boolean(formData.eventDate),
        Boolean(formData.locationText.trim()),
        Boolean(formData.description.trim()),
        formData.tags.length > 0,
        Boolean(computedBudget),
      ].filter(Boolean).length,
    [formData, computedBudget]
  );

  // 5. completionPercent (depends on completedFields)
  const completionPercent = useMemo(
    () => Math.round((completedFields / 8) * 100),
    [completedFields]
  );

  // 6. hasDraftContent
  const hasDraftContent = useMemo(
    () =>
      Boolean(
        formData.title.trim() ||
          formData.type ||
          formData.eventDate ||
          formData.minimumBudget.trim() ||
          formData.maximumBudget.trim() ||
          formData.description.trim() ||
          formData.tags.length ||
          formData.locationText.trim() ||
          files.length
      ),
    [formData, files.length]
  );

  // 7. canSubmit (plain const, not useMemo)
  const canSubmit =
    formData.title.trim().length > 0 &&
    formData.type.length > 0 &&
    formData.eventDate.length > 0 &&
    computedBudget.length > 0 &&
    formData.description.trim().length > 0 &&
    formData.tags.length > 0 &&
    Boolean(formData.location) &&
    formData.locationText.trim().length > 0;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTag = (tag: string) => {
    if (!tag || formData.tags.includes(tag)) return;
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((item) => item !== tag),
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const saveDraft = () => {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    setDraftSavedAt(new Date().toLocaleTimeString());
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setUploading(true);
      const fileUrls: string[] = [];
      for (const file of files) {
        const fileRef = ref(storage, `jobs-images/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrls.push(await getDownloadURL(fileRef));
      }
      const payload = {
        title: formData.title,
        type: formData.type,
        experience: "Not specified",
        eventDate: formData.eventDate,
        budget: computedBudget,
        description: formData.description,
        tags: formData.tags,
        location: formData.location ? toLocationPayload(formData.location) : null,
        locationText: formData.locationText,
        fileUrls,
      };
      const response = await fetchWithAuth("/api/post-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Form submission failed");
      setFormData(initialFormData);
      setFiles([]);
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      router.push("/client/best-matches");
    } catch (error) {
      console.error("An error occurred while submitting the form", error);
    } finally {
      setUploading(false);
    }
  };

  const inputClassName =
    "h-12 w-full rounded-xl border-none bg-surface-container-highest px-4 text-sm text-on-surface placeholder:text-on-surface-variant/80 transition-all focus:bg-surface-container-lowest focus:ring-0 focus:shadow-[inset_0_-2px_0_0_#2f5f4a]";

  return (
    <div className="relative min-h-screen bg-surface pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[22rem] bg-[radial-gradient(circle_at_18%_16%,rgba(47,95,74,0.12),transparent_45%),radial-gradient(circle_at_84%_-5%,rgba(178,135,95,0.18),transparent_38%)]" />

      <form
        onSubmit={handleSubmit}
        className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div
          className="mb-8 rounded-3xl bg-surface-container-low/80 px-6 py-6 backdrop-blur-lg md:px-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.28em] text-primary-600">
                Curated Listing Flow
              </p>
              <h1 className="mt-2 [font-family:var(--font-noto-serif)] text-3xl leading-tight text-on-surface md:text-5xl">
                Create a New Job Listing
              </h1>
              <p className="mt-3 max-w-2xl [font-family:var(--font-inter)] text-sm text-on-surface-variant md:text-base">
                Tell vendors exactly what you need, where it happens, and what budget feels right.
              </p>
            </div>
            <motion.span
              className="rounded-full bg-primary/10 px-4 py-2 [font-family:var(--font-inter)] text-xs font-semibold uppercase tracking-[0.08em] text-primary"
              animate={completionPercent === 100 ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              {completionPercent === 100 ? "✓ Ready to submit" : `${completionPercent}% complete`}
            </motion.span>
          </div>

          {/* Interactive progress bar */}
          <div className="mt-6 space-y-3 rounded-2xl bg-surface-container px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <p className="[font-family:var(--font-inter)] text-sm font-semibold text-on-surface">
                Job Details
              </p>
              <p className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-on-surface-variant">
                {completionPercent < 100
                  ? `${7 - completedFields} field${7 - completedFields !== 1 ? "s" : ""} remaining`
                  : "All fields complete"}
              </p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-container-highest">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            {/* 7 labeled dots */}
            <div className="flex items-center justify-between">
              {[
                { label: "Title", done: Boolean(formData.title.trim()) },
                { label: "Occasion", done: Boolean(formData.type) },
                { label: "Date", done: Boolean(formData.eventDate) },
                { label: "Location", done: Boolean(formData.locationText.trim()) },
                { label: "Description", done: Boolean(formData.description.trim()) },
                { label: "Skills", done: formData.tags.length > 0 },
                { label: "Budget", done: Boolean(computedBudget) },
              ].map(({ label, done }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <motion.div
                    animate={{
                      backgroundColor: done ? "#2f5f4a" : "#e5e2df",
                      scale: done ? 1 : 0.85,
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-2 w-2 rounded-full"
                  />
                  <span
                    className={clsx(
                      "[font-family:var(--font-inter)] text-[10px] transition-colors",
                      done ? "font-medium text-primary" : "text-on-surface-variant/50"
                    )}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Left: form sections */}
          <div className="flex flex-1 flex-col gap-8">

            {/* Section 1: The Basics */}
            <motion.section
              className="rounded-3xl bg-surface-container-low px-6 py-7 md:px-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <span className="material-symbols-outlined text-base text-primary">edit_note</span>
                  </span>
                  <div>
                    <h2 className="[font-family:var(--font-noto-serif)] text-2xl text-on-surface">
                      The Basics
                    </h2>
                    <p className="[font-family:var(--font-inter)] text-xs text-on-surface-variant">
                      Title, occasion &amp; date
                    </p>
                  </div>
                </div>
                <AnimatePresence>
                  {formData.title && formData.type && formData.eventDate && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 [font-family:var(--font-inter)] text-xs font-semibold text-primary"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Complete
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-on-surface-variant">
                    Job Title
                  </span>
                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g., Wedding Photographer needed for 8 hours"
                    className={clsx(inputClassName, "mt-2")}
                  />
                </label>

                <div className="md:col-span-2">
                  <span className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-on-surface-variant">
                    Occasion Type
                  </span>
                  <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {jobCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, type: category }))
                        }
                        className={clsx(
                          "min-h-14 rounded-xl px-4 py-3 text-left [font-family:var(--font-inter)] text-sm transition-all",
                          formData.type === category
                            ? "bg-primary text-on-primary shadow-[0_12px_28px_rgba(47,95,74,0.22)]"
                            : "bg-surface-container-highest text-on-surface hover:bg-surface-container-lowest"
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <label>
                  <span className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-on-surface-variant">
                    Occasion Date
                  </span>
                  <div className="relative mt-2">
                    <input
                      id="eventDate"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      type="date"
                      className={clsx(
                        inputClassName,
                        formData.eventDate &&
                          "border-b-2 border-primary bg-surface-container-lowest"
                      )}
                    />
                  </div>
                  {formData.eventDate &&
                    (() => {
                      const days = getDaysUntil(formData.eventDate);
                      if (days === null) return null;
                      return (
                        <p
                          className={clsx(
                            "mt-1.5 [font-family:var(--font-inter)] text-xs font-medium",
                            days > 30
                              ? "text-primary"
                              : days > 0
                              ? "text-amber-600"
                              : "text-on-surface-variant"
                          )}
                        >
                          {days > 0
                            ? `${days} days until the big day`
                            : days === 0
                            ? "Today is the day!"
                            : "This date has passed"}
                        </p>
                      );
                    })()}
                </label>
              </div>
            </motion.section>

            {/* Section 2: Details and Location */}
            <motion.section
              className="rounded-3xl bg-surface-container-low px-6 py-7 md:px-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <span className="material-symbols-outlined text-base text-primary">location_on</span>
                  </span>
                  <div>
                    <h2 className="[font-family:var(--font-noto-serif)] text-2xl text-on-surface">
                      Details and Location
                    </h2>
                    <p className="[font-family:var(--font-inter)] text-xs text-on-surface-variant">
                      Venue, description &amp; skills
                    </p>
                  </div>
                </div>
                <AnimatePresence>
                  {formData.locationText && formData.description && formData.tags.length > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 [font-family:var(--font-inter)] text-xs font-semibold text-primary"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Complete
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-7 grid gap-6">
                <label>
                  <span className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-on-surface-variant">
                    Venue Location
                  </span>
                  <div className="mt-2">
                    <JobLocationPicker
                      value={formData.location}
                      onChange={(location) => {
                        setFormData((prev) => ({
                          ...prev,
                          location,
                          locationText: getLocationDisplay(location, ""),
                        }));
                      }}
                    />
                  </div>
                </label>

                <label>
                  <span className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-on-surface-variant">
                    Selected Address
                  </span>
                  <input
                    id="locationText"
                    name="locationText"
                    required
                    value={formData.locationText}
                    onChange={handleChange}
                    placeholder="Address will appear here after pinning"
                    className={clsx(inputClassName, "mt-2")}
                  />
                </label>

                <label>
                  <span className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-on-surface-variant">
                    Job Description
                  </span>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your vision, key deliverables, and expectations."
                    className="mt-2 h-44 w-full resize-none rounded-2xl border-none bg-surface-container-highest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/80 transition-all focus:bg-surface-container-lowest focus:ring-0 focus:shadow-[inset_0_-2px_0_0_#2f5f4a]"
                  />
                  <p className="mt-1 text-right [font-family:var(--font-inter)] text-xs text-on-surface-variant">
                    {formData.description.length} characters
                  </p>
                </label>

                <div>
                  <span className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-on-surface-variant">
                    Service Category and Skills
                  </span>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {featuredSkills.map((skill) => {
                      const active = formData.tags.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => (active ? removeTag(skill) : addTag(skill))}
                          className={clsx(
                            "group flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl px-2 text-center [font-family:var(--font-inter)] text-xs font-medium transition-all",
                            active
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-highest text-on-surface hover:bg-surface-container-lowest"
                          )}
                        >
                          <span className="material-symbols-outlined text-base">
                            {SKILL_ICON_MAP[skill] ?? "sell"}
                          </span>
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {formData.tags.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => removeTag(skill)}
                          className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 [font-family:var(--font-inter)] text-xs font-medium text-primary transition-all hover:bg-primary/20"
                        >
                          {skill}
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <label className="mt-4 block">
                    <span className="[font-family:var(--font-inter)] text-[11px] uppercase tracking-[0.08em] text-on-surface-variant">
                      Add more skills
                    </span>
                    <select
                      value=""
                      onChange={(event) => addTag(event.target.value)}
                      className={clsx(inputClassName, "mt-2")}
                    >
                      <option value="" disabled>
                        Select a skill...
                      </option>
                      {selectableSkills.map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </motion.section>

            {/* Section 3: Budget */}
            <motion.section
              className="rounded-3xl bg-surface-container-low px-6 py-7 md:px-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <span className="material-symbols-outlined text-base text-primary">payments</span>
                  </span>
                  <div>
                    <h2 className="[font-family:var(--font-noto-serif)] text-2xl text-on-surface">
                      Budget and Payment
                    </h2>
                    <p className="[font-family:var(--font-inter)] text-xs text-on-surface-variant">
                      Set your price range
                    </p>
                  </div>
                </div>
                <AnimatePresence>
                  {computedBudget && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 [font-family:var(--font-inter)] text-xs font-semibold text-primary"
                    >
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Complete
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-7 flex flex-col gap-6">
                <div>
                  <p className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-on-surface-variant">
                    Payment Type
                  </p>
                  <div className="mt-3 inline-flex rounded-full bg-surface-container-high p-1">
                    {PAYMENT_TYPES.map((option) => {
                      const active = formData.paymentType === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              paymentType: option.value,
                            }))
                          }
                          className={clsx(
                            "rounded-full px-5 py-2 [font-family:var(--font-inter)] text-sm transition-all",
                            active
                              ? "bg-surface-container-lowest text-primary shadow-[0_8px_20px_rgba(27,28,26,0.06)]"
                              : "text-on-surface-variant hover:text-on-surface"
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <label>
                    <span className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-on-surface-variant">
                      Minimum Budget ($)
                    </span>
                    <input
                      id="minimumBudget"
                      name="minimumBudget"
                      value={formData.minimumBudget}
                      onChange={handleChange}
                      type="number"
                      min={0}
                      placeholder="0"
                      className={clsx(inputClassName, "mt-2")}
                    />
                  </label>
                  <label>
                    <span className="[font-family:var(--font-inter)] text-xs uppercase tracking-[0.08em] text-on-surface-variant">
                      Maximum Budget ($)
                    </span>
                    <input
                      id="maximumBudget"
                      name="maximumBudget"
                      value={formData.maximumBudget}
                      onChange={handleChange}
                      type="number"
                      min={0}
                      placeholder="1000"
                      className={clsx(inputClassName, "mt-2")}
                    />
                  </label>
                </div>

                {computedBudget && (
                  <div className="flex items-center gap-3 rounded-xl bg-primary/[0.08] px-4 py-3">
                    <span className="material-symbols-outlined text-base text-primary">
                      check_circle
                    </span>
                    <p className="[font-family:var(--font-inter)] text-sm text-on-surface">
                      Budget:{" "}
                      <span className="font-semibold text-primary">{computedBudget}</span>
                    </p>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Section 4: Inspiration Board */}
            <motion.section
              className="rounded-3xl bg-surface-container-low px-6 py-7 md:px-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <span className="material-symbols-outlined text-base text-primary">photo_library</span>
                </span>
                <div>
                  <h2 className="[font-family:var(--font-noto-serif)] text-2xl text-on-surface">
                    Inspiration Board
                  </h2>
                  <p className="[font-family:var(--font-inter)] text-xs text-on-surface-variant">
                    Upload photos, moodboards, or references
                  </p>
                </div>
              </div>

              <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-highest px-6 py-10 text-center transition-all hover:border-primary/40 hover:bg-surface-container-lowest">
                <span className="material-symbols-outlined rounded-full bg-primary/10 p-3 text-2xl text-primary">
                  cloud_upload
                </span>
                <span className="mt-4 [font-family:var(--font-inter)] text-base font-semibold text-on-surface">
                  Click to upload or drag and drop
                </span>
                <span className="mt-1 [font-family:var(--font-inter)] text-xs text-on-surface-variant">
                  SVG, PNG, JPG, or GIF (max. 5MB)
                </span>
                <input
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </label>

              {files.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="relative overflow-hidden rounded-xl bg-surface-container-highest"
                    >
                      <SafeImage
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-24 w-full object-cover"
                        width={160}
                        height={96}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute right-2 top-2 rounded-full bg-surface-container-lowest/90 px-2 py-1 text-xs font-medium text-on-surface backdrop-blur-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {/* Right: live preview sidebar */}
          <div className="w-full lg:w-80 xl:w-96">
            <LivePreview formData={formData} computedBudget={computedBudget} />
          </div>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-4 z-20 mt-8 rounded-2xl bg-surface/80 px-4 py-4 backdrop-blur-xl md:px-6">
          <div className="flex flex-col-reverse items-center justify-between gap-3 md:flex-row">
            <button
              type="button"
              onClick={() => router.push("/client/post-job")}
              className="w-full rounded-xl px-5 py-3 [font-family:var(--font-inter)] text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest md:w-auto"
            >
              Cancel
            </button>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <button
                type="button"
                onClick={saveDraft}
                disabled={!hasDraftContent || uploading}
                className="w-full rounded-xl bg-secondary-container px-5 py-3 [font-family:var(--font-inter)] text-sm font-semibold text-on-secondary-container transition-all hover:bg-secondary-fixed disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={!canSubmit || uploading}
                className="w-full rounded-xl bg-primary px-6 py-3 [font-family:var(--font-inter)] text-sm font-semibold text-on-primary shadow-[0_14px_28px_rgba(47,95,74,0.24)] transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                {uploading ? "Submitting..." : "Next Step →"}
              </button>
            </div>
          </div>
          {draftSavedAt && (
            <p className="mt-3 [font-family:var(--font-inter)] text-xs text-on-surface-variant">
              Draft saved at {draftSavedAt}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default DetailsForm;

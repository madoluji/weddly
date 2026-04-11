"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  MapPinIcon,
  PencilSquareIcon,
  SparklesIcon,
  StarIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import SafeImage from "@/app/ui/shared/SafeImage";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";

type UserInfo = {
  _id: string;
  name?: string;
  lastName?: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  profilePicture?: string;
  profileVisible?: boolean;
  kycVerified?: boolean;
  emailVerified?: boolean;
};

type ClientInfo = {
  fullName?: string;
  isWeddingPlanner?: boolean;
  weddingStyle?: string;
  targetWeddingDate?: string;
  location?: string;
  averageBudget?: number;
  rating?: number;
};

type Job = {
  jobId: string;
  title: string;
  type?: string;
  experience?: string;
  budget?: number;
  createdAt: string;
  eventDate?: string;
  location?: string;
  tags?: string[];
  status?: string;
  proposalCount?: number;
};

const formatDate = (date?: string) => {
  if (!date) return "Not set";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Not set";

  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

export default function DisplayClientProfile() {
  const { session } = useAuth();

  const [userData, setUserData] = useState<UserInfo | null>(null);
  const [clientData, setClientData] = useState<ClientInfo | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const [savingQuickEdit, setSavingQuickEdit] = useState(false);
  const [quickEditForm, setQuickEditForm] = useState({
    firstName: "",
    lastName: "",
    weddingStyle: "",
    targetWeddingDate: "",
    location: "",
    averageBudget: "",
    isWeddingPlanner: false,
  });

  const displayName = useMemo(() => {
    const first = userData?.name || "";
    const last = userData?.lastName || "";
    const fromUser = `${first} ${last}`.trim();
    return fromUser || clientData?.fullName || "Client";
  }, [clientData?.fullName, userData?.lastName, userData?.name]);

  const activeJobs = useMemo(
    () => jobs.filter((job) => (job.status || "").toLowerCase() === "active").length,
    [jobs]
  );

  const totalBudget = useMemo(
    () => jobs.reduce((sum, job) => sum + Number(job.budget || 0), 0),
    [jobs]
  );

  const totalProposals = useMemo(
    () => jobs.reduce((sum, job) => sum + Number(job.proposalCount || 0), 0),
    [jobs]
  );

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const job of jobs) {
      for (const tag of job.tags || []) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [jobs]);

  const profileStrength = useMemo(() => {
    const checks = [
      Boolean(userData?.profilePicture),
      Boolean(clientData?.weddingStyle),
      Boolean(clientData?.targetWeddingDate),
      Boolean(clientData?.location),
      Boolean(clientData?.averageBudget),
      Boolean(jobs.length),
      Boolean(topTags.length),
      Boolean(userData?.city),
      Boolean(userData?.country),
      Boolean(userData?.emailVerified),
    ];

    const complete = checks.filter(Boolean).length;
    return Math.round((complete / checks.length) * 100);
  }, [
    clientData?.averageBudget,
    clientData?.location,
    clientData?.targetWeddingDate,
    clientData?.weddingStyle,
    jobs.length,
    topTags.length,
    userData?.city,
    userData?.country,
    userData?.emailVerified,
    userData?.profilePicture,
  ]);

  const clientSummary = useMemo(() => {
    const pieces = [
      clientData?.weddingStyle ? `${clientData.weddingStyle} style` : null,
      clientData?.targetWeddingDate ? `Target ${formatDate(clientData.targetWeddingDate)}` : null,
      clientData?.location || userData?.city || null,
      clientData?.averageBudget ? `Budget Rs ${clientData.averageBudget.toLocaleString()}` : null,
    ].filter(Boolean);

    if (!pieces.length) {
      return "Complete your settings to publish a richer client profile for better freelancer matches.";
    }

    return pieces.join(" • ");
  }, [
    clientData?.averageBudget,
    clientData?.location,
    clientData?.targetWeddingDate,
    clientData?.weddingStyle,
    userData?.city,
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [userRes, clientRes, jobsRes] = await Promise.all([
          fetchWithAuth(
            "/api/user?fields=_id,name,lastName,email,city,state,country,profilePicture,profileVisible,kycVerified,emailVerified"
          ),
          fetchWithAuth(`/api/clientInfo?userId=${encodeURIComponent(session.user.id)}`),
          fetchWithAuth(`/api/fetchJobs?userId=${encodeURIComponent(session.user.id)}`),
        ]);

        if (userRes.ok) {
          const user = await userRes.json();
          setUserData(user);
        }

        if (clientRes.ok) {
          const data = await clientRes.json();
          setClientData(data?.client || null);
        } else {
          setClientData(null);
        }

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData?.jobs || []);
        } else {
          setJobs([]);
        }
      } catch (error) {
        setUserData(null);
        setClientData(null);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    setQuickEditForm({
      firstName: userData?.name || "",
      lastName: userData?.lastName || "",
      weddingStyle: clientData?.weddingStyle || "",
      targetWeddingDate: clientData?.targetWeddingDate || "",
      location: clientData?.location || "",
      averageBudget:
        clientData?.averageBudget !== undefined ? String(clientData.averageBudget) : "",
      isWeddingPlanner: Boolean(clientData?.isWeddingPlanner),
    });
  }, [
    clientData?.averageBudget,
    clientData?.isWeddingPlanner,
    clientData?.location,
    clientData?.targetWeddingDate,
    clientData?.weddingStyle,
    userData?.lastName,
    userData?.name,
  ]);

  const handleQuickEditSave = async () => {
    setSavingQuickEdit(true);
    try {
      const nextFirstName = quickEditForm.firstName.trim();
      const nextLastName = quickEditForm.lastName.trim();

      const userRes = await fetchWithAuth("/api/user", {
        method: "PATCH",
        body: JSON.stringify({
          name: nextFirstName,
          lastName: nextLastName,
        }),
      });

      if (!userRes.ok) {
        throw new Error("Failed to update user profile");
      }

      const clientRes = await fetchWithAuth("/api/clientInfo", {
        method: "PUT",
        body: JSON.stringify({
          fullName: `${nextFirstName} ${nextLastName}`.trim(),
          isWeddingPlanner: quickEditForm.isWeddingPlanner,
          weddingStyle: quickEditForm.weddingStyle.trim() || "Modern",
          targetWeddingDate: quickEditForm.targetWeddingDate,
          location: quickEditForm.location.trim(),
          averageBudget: Number(quickEditForm.averageBudget || 0),
        }),
      });

      if (!clientRes.ok) {
        throw new Error("Failed to update client profile");
      }

      setUserData((prev) =>
        prev
          ? {
              ...prev,
              name: nextFirstName,
              lastName: nextLastName,
            }
          : prev
      );

      setClientData((prev) =>
        prev
          ? {
              ...prev,
              fullName: `${nextFirstName} ${nextLastName}`.trim(),
              isWeddingPlanner: quickEditForm.isWeddingPlanner,
              weddingStyle: quickEditForm.weddingStyle.trim() || "Modern",
              targetWeddingDate: quickEditForm.targetWeddingDate,
              location: quickEditForm.location.trim(),
              averageBudget: Number(quickEditForm.averageBudget || 0),
            }
          : prev
      );

      setQuickEditOpen(false);
    } finally {
      setSavingQuickEdit(false);
    }
  };

  const handleVisibilityChange = async (checked: boolean) => {
    setSavingVisibility(true);
    try {
      const res = await fetchWithAuth("/api/user", {
        method: "PATCH",
        body: JSON.stringify({ profileVisible: checked }),
      });

      if (!res.ok) return;
      setUserData((prev) => (prev ? { ...prev, profileVisible: checked } : prev));
    } finally {
      setSavingVisibility(false);
    }
  };

  if (loading) {
    return <div className="px-4 py-8 text-sm text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-7 px-2 pb-10 sm:px-4">
      <section className="overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#f8fbf9] via-white to-[#edf4f0] shadow-[0_24px_54px_rgba(26,44,35,0.08)]">
        <div className="h-36 bg-[radial-gradient(circle_at_15%_20%,rgba(47,95,74,0.22),transparent_48%),radial-gradient(circle_at_80%_15%,rgba(197,160,89,0.22),transparent_42%),linear-gradient(130deg,#e8f1ec,#f9fbfa)]" />
        <div className="-mt-14 px-6 pb-7 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                <SafeImage
                  src={userData?.profilePicture || "/images/image.png"}
                  alt={displayName}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="pb-2">
                <h1 className="font-headline text-3xl font-medium text-slate-900 sm:text-4xl">{displayName}</h1>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold text-primary-700">
                    {clientData?.isWeddingPlanner ? "Wedding Planner" : "Client"}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{clientData?.location || userData?.city || "Location pending"}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pb-2">
              <button
                type="button"
                onClick={() => setQuickEditOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Quick Edit
              </button>
              <Link
                href="/client/setting"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Edit Profile
              </Link>
              <Link
                href="/client/post-job"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700"
              >
                <EyeIcon className="h-4 w-4" />
                Post New Job
              </Link>
            </div>
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
            <SparklesIcon className="h-4 w-4" />
            {userData?.profileVisible ? "Visible to freelancers" : "Private profile mode"}
          </div>

          <div className="mt-6 rounded-2xl bg-white p-5">
            <h3 className="font-headline text-2xl font-medium text-slate-900">Client Brief</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{clientSummary}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <article className="rounded-2xl bg-white p-5 shadow-[0_14px_32px_rgba(26,44,35,0.08)]">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Profile Strength</p>
              <p className="mt-1 text-sm text-slate-600">Add planning details and post more active gigs</p>
            </div>
            <p className="font-headline text-3xl font-medium text-primary-700">{profileStrength}%</p>
          </div>
          <div className="mt-4 h-2.5 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-primary-700 transition-all" style={{ width: `${profileStrength}%` }} />
          </div>
        </article>

        <article className="rounded-2xl bg-white p-5 text-center shadow-[0_14px_32px_rgba(26,44,35,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Active Jobs</p>
          <p className="mt-2 font-headline text-3xl font-medium text-slate-900">{activeJobs}</p>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Live</p>
        </article>

        <article className="rounded-2xl bg-white p-5 text-center shadow-[0_14px_32px_rgba(26,44,35,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Total Proposals</p>
          <p className="mt-2 font-headline text-3xl font-medium text-slate-900">{totalProposals}</p>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Received</p>
        </article>

        <article className="rounded-2xl bg-white p-5 text-center shadow-[0_14px_32px_rgba(26,44,35,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Rating</p>
          <div className="mt-2 flex items-center justify-center gap-1">
            <p className="font-headline text-3xl font-medium text-slate-900">
              {typeof clientData?.rating === "number" ? clientData.rating.toFixed(1) : "0.0"}
            </p>
            <StarIcon className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Freelancer feedback</p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <article className="rounded-2xl bg-white p-5 shadow-[0_16px_36px_rgba(26,44,35,0.08)]">
            <h3 className="font-headline text-2xl font-medium text-slate-900">Wedding Preferences</h3>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center gap-2 text-slate-700">
                <CalendarDaysIcon className="h-4 w-4 text-primary-700" />
                {formatDate(clientData?.targetWeddingDate)}
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <MapPinIcon className="h-4 w-4 text-primary-700" />
                {clientData?.location || "Location not set"}
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <CurrencyDollarIcon className="h-4 w-4 text-primary-700" />
                {clientData?.averageBudget
                  ? `Rs ${clientData.averageBudget.toLocaleString()}`
                  : "Budget not set"}
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <UserCircleIcon className="h-4 w-4 text-primary-700" />
                {clientData?.weddingStyle || "Style not selected"}
              </p>
            </div>
          </article>

          <article className="rounded-2xl bg-slate-50 p-5 shadow-[0_16px_36px_rgba(26,44,35,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Profile Visibility</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-700">Visible to freelancers</p>
              <button
                type="button"
                onClick={() => handleVisibilityChange(!userData?.profileVisible)}
                disabled={savingVisibility}
                className={`relative h-7 w-14 rounded-full transition ${
                  userData?.profileVisible ? "bg-primary-700" : "bg-slate-300"
                } ${savingVisibility ? "opacity-70" : ""}`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    userData?.profileVisible ? "left-8" : "left-1"
                  }`}
                />
              </button>
            </div>
          </article>
        </aside>

        <div className="space-y-6">
          <article className="rounded-2xl bg-white p-6 shadow-[0_16px_36px_rgba(26,44,35,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline text-2xl font-medium text-slate-900">Recent Job Posts</h3>
              <Link href="/client/post-job" className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
                Create Job
              </Link>
            </div>

            {jobs.length ? (
              <div className="space-y-3">
                {jobs.slice(0, 6).map((job, index) => (
                  <div key={job.jobId || `job-${index}`} className="rounded-xl bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{job.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                          {job.type || "General"} • {job.experience || "Any"}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                        {job.status || "active"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDaysIcon className="h-4 w-4 text-primary-700" />
                        Posted {formatDate(job.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CurrencyDollarIcon className="h-4 w-4 text-primary-700" />
                        Rs {Number(job.budget || 0).toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ChartBarIcon className="h-4 w-4 text-primary-700" />
                        {job.proposalCount || 0} proposals
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No jobs posted yet. Create your first job to start receiving proposals.</p>
            )}
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-[0_16px_36px_rgba(26,44,35,0.08)]">
            <h3 className="font-headline text-2xl font-medium text-slate-900">Top Categories</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {topTags.length ? (
                topTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary-800"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">Your most used categories will appear here once you post tagged jobs.</p>
              )}
            </div>
          </article>
        </div>
      </section>

      {quickEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-[0_26px_56px_rgba(26,44,35,0.24)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-headline text-2xl font-medium text-slate-900">Quick Edit Client Profile</h2>
              <button
                type="button"
                onClick={() => setQuickEditOpen(false)}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-slate-500">First name</span>
                <input
                  value={quickEditForm.firstName}
                  onChange={(e) =>
                    setQuickEditForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 outline-none focus:bg-white"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-500">Last name</span>
                <input
                  value={quickEditForm.lastName}
                  onChange={(e) =>
                    setQuickEditForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 outline-none focus:bg-white"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-slate-500">Wedding style</span>
                <input
                  value={quickEditForm.weddingStyle}
                  onChange={(e) =>
                    setQuickEditForm((prev) => ({ ...prev, weddingStyle: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 outline-none focus:bg-white"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-500">Target wedding date</span>
                <input
                  type="date"
                  value={quickEditForm.targetWeddingDate}
                  onChange={(e) =>
                    setQuickEditForm((prev) => ({ ...prev, targetWeddingDate: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 outline-none focus:bg-white"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-500">Average budget (Rs)</span>
                <input
                  value={quickEditForm.averageBudget}
                  onChange={(e) =>
                    setQuickEditForm((prev) => ({ ...prev, averageBudget: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 outline-none focus:bg-white"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-slate-500">Location</span>
                <input
                  value={quickEditForm.location}
                  onChange={(e) =>
                    setQuickEditForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 outline-none focus:bg-white"
                />
              </label>
              <label className="inline-flex items-center gap-3 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={quickEditForm.isWeddingPlanner}
                  onChange={(e) =>
                    setQuickEditForm((prev) => ({
                      ...prev,
                      isWeddingPlanner: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-primary-700 focus:ring-primary-200"
                />
                <span className="text-slate-700">I am a wedding planner</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setQuickEditOpen(false)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuickEditSave}
                disabled={savingQuickEdit}
                className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingQuickEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

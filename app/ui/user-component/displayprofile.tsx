"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarDaysIcon,
  ChartBarSquareIcon,
  CheckBadgeIcon,
  DocumentIcon,
  EyeIcon,
  MapPinIcon,
  PencilSquareIcon,
  PlusIcon,
  SparklesIcon,
  StarIcon,
  TrashIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import SafeImage from "@/app/ui/shared/SafeImage";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";
import { upload } from "@/app/lib/firebase";

type UserInfo = {
  _id: string;
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  profilePicture?: string;
  profileVisible?: boolean;
  kycVerified?: boolean;
  emailVerified?: boolean;
};

type WorkExperience = {
  jobTitle?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

type PortfolioProject = {
  projectTitle?: string;
  projectDescription?: string;
  technologies?: string[];
  portfolioFiles?: string[];
};

type EducationItem = {
  degree?: string;
  institution?: string;
  startDate?: string;
  endDate?: string;
};

type FreelancerInfo = {
  fullName?: string;
  email?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  languages?: string[];
  rate?: string;
  rating?: number;
  workExperience?: WorkExperience[];
  education?: EducationItem[];
  projectPortfolio?: PortfolioProject[];
};

const imageRegex = /\.(png|jpg|jpeg|webp|gif|svg)(\?|$)/i;

const parseYear = (value?: string): number | null => {
  if (!value) return null;
  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) {
    return directDate.getFullYear();
  }

  const yearMatch = value.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? Number(yearMatch[0]) : null;
};

const formatDateRange = (start?: string, end?: string) => {
  const startYear = parseYear(start);
  const endYear = parseYear(end);

  if (startYear && endYear) return `${startYear} - ${endYear}`;
  if (startYear && !endYear) return `${startYear} - Present`;
  if (!startYear && endYear) return `Until ${endYear}`;
  return "Date not provided";
};

export default function DisplayProfile() {
  const { session } = useAuth();
  const searchParams = useSearchParams();
  const viewingUserId = searchParams.get("userId");
  const isOwnProfile = !viewingUserId && !!session?.user?.id;
  const isClientViewer = !!session?.user?.roles?.client;

  const [userData, setUserData] = useState<UserInfo | null>(null);
  const [freelancerData, setFreelancerData] = useState<FreelancerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const [savingQuickEdit, setSavingQuickEdit] = useState(false);
  const [contentStudioOpen, setContentStudioOpen] = useState(false);
  const [savingContentStudio, setSavingContentStudio] = useState(false);
  const [uploadingProjectIndex, setUploadingProjectIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [quickEditForm, setQuickEditForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    rate: "",
    skills: "",
    languages: "",
  });
  const [workExperienceForm, setWorkExperienceForm] = useState<
    Array<{ jobTitle: string; company: string; startDate: string; endDate: string; description: string }>
  >([]);
  const [projectForm, setProjectForm] = useState<
    Array<{
      projectTitle: string;
      projectDescription: string;
      technologiesText: string;
      filesText: string;
    }>
  >([]);

  const displayName = useMemo(() => {
    const first = userData?.name || "";
    const last = userData?.lastName || "";
    const combined = `${first} ${last}`.trim();
    return combined || freelancerData?.fullName || "Freelancer";
  }, [freelancerData?.fullName, userData?.lastName, userData?.name]);

  const totalWeddings = useMemo(() => {
    const fromWork = freelancerData?.workExperience?.length || 0;
    const fromPortfolio = freelancerData?.projectPortfolio?.length || 0;
    return fromWork + fromPortfolio;
  }, [freelancerData?.projectPortfolio?.length, freelancerData?.workExperience?.length]);

  const experienceYears = useMemo(() => {
    const entries = freelancerData?.workExperience || [];
    if (!entries.length) return 0;

    const years = entries
      .map((work) => parseYear(work.startDate))
      .filter((year): year is number => year !== null);

    if (!years.length) return 0;

    const earliest = Math.min(...years);
    const now = new Date().getFullYear();
    return Math.max(now - earliest, 0);
  }, [freelancerData?.workExperience]);

  const profileStrength = useMemo(() => {
    const checks = [
      Boolean(userData?.profilePicture),
      Boolean(freelancerData?.bio?.trim()),
      Boolean(freelancerData?.location?.trim()),
      Boolean(freelancerData?.skills?.length),
      Boolean(freelancerData?.languages?.length),
      Boolean(freelancerData?.projectPortfolio?.length),
      Boolean(freelancerData?.workExperience?.length),
      Boolean(userData?.phone?.trim()),
      Boolean(userData?.city?.trim()),
      Boolean(userData?.country?.trim()),
    ];

    const complete = checks.filter(Boolean).length;
    return Math.round((complete / checks.length) * 100);
  }, [
    freelancerData?.bio,
    freelancerData?.languages,
    freelancerData?.location,
    freelancerData?.projectPortfolio,
    freelancerData?.skills,
    freelancerData?.workExperience,
    userData?.city,
    userData?.country,
    userData?.phone,
    userData?.profilePicture,
  ]);

  const portfolioImages = useMemo(() => {
    const projects = freelancerData?.projectPortfolio || [];
    return projects
      .flatMap((project) => project.portfolioFiles || [])
      .filter((file) => imageRegex.test(file));
  }, [freelancerData?.projectPortfolio]);

  const documents = useMemo(() => {
    const projects = freelancerData?.projectPortfolio || [];
    return projects
      .flatMap((project) => project.portfolioFiles || [])
      .filter((file) => !imageRegex.test(file));
  }, [freelancerData?.projectPortfolio]);

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = viewingUserId || session?.user?.id;
      const isOwnProfile = !viewingUserId && session?.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        if (isOwnProfile) {
          // Fetching own profile
          const [userRes, freelancerRes] = await Promise.all([
            fetchWithAuth(
              "/api/user?fields=_id,name,lastName,email,phone,city,state,country,profilePicture,profileVisible,kycVerified,emailVerified"
            ),
            fetchWithAuth(`/api/freelancerInfo?userId=${encodeURIComponent(userId)}`),
          ]);

          if (userRes.ok) {
            const user = await userRes.json();
            setUserData(user);
          }

          if (freelancerRes.ok) {
            const data = await freelancerRes.json();
            setFreelancerData(data?.freelancer || null);
          } else {
            setFreelancerData(null);
          }
        } else {
          // Fetching another user's profile
          const [userRes, freelancerRes] = await Promise.all([
            fetchWithAuth(
              `/api/freelancers?userId=${encodeURIComponent(userId)}&s=true`
            ),
            fetchWithAuth(`/api/freelancerInfo?userId=${encodeURIComponent(userId)}`),
          ]);

          if (userRes.ok) {
            const data = await userRes.json();
            const freelancer = data.freelancer;
            if (freelancer) {
              setUserData({
                _id: freelancer.userId,
                name: freelancer.fullName?.split(" ")[0] || "",
                lastName: freelancer.fullName?.split(" ").slice(1).join(" ") || "",
                email: freelancer.email,
                phone: freelancer.phone,
                city: "",
                state: "",
                country: "",
                profilePicture: freelancer.profilePicture,
                profileVisible: freelancer.profileVisible,
                kycVerified: false,
                emailVerified: false,
              });
            }
          }

          if (freelancerRes.ok) {
            const data = await freelancerRes.json();
            setFreelancerData(data?.freelancer || null);
          }
        }
      } catch (error) {
        setUserData(null);
        setFreelancerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.id, viewingUserId]);

  useEffect(() => {
    setQuickEditForm({
      firstName: userData?.name || "",
      lastName: userData?.lastName || "",
      bio: freelancerData?.bio || "",
      location: freelancerData?.location || "",
      rate: freelancerData?.rate ? String(freelancerData.rate) : "",
      skills: (freelancerData?.skills || []).join(", "),
      languages: (freelancerData?.languages || []).join(", "),
    });
  }, [
    freelancerData?.bio,
    freelancerData?.languages,
    freelancerData?.location,
    freelancerData?.rate,
    freelancerData?.skills,
    userData?.lastName,
    userData?.name,
  ]);

  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const createEmptyWork = () => ({
    jobTitle: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const createEmptyProject = () => ({
    projectTitle: "",
    projectDescription: "",
    technologiesText: "",
    filesText: "",
  });

  const handleQuickEditSave = async () => {
    setSavingQuickEdit(true);
    try {
      const nextName = quickEditForm.firstName.trim();
      const nextLastName = quickEditForm.lastName.trim();

      const userRes = await fetchWithAuth("/api/user", {
        method: "PATCH",
        body: JSON.stringify({
          name: nextName,
          lastName: nextLastName,
        }),
      });

      if (!userRes.ok) {
        throw new Error("Failed to update user profile");
      }

      const freelancerRes = await fetchWithAuth("/api/freelancerInfo", {
        method: "PUT",
        body: JSON.stringify({
          location: quickEditForm.location.trim(),
          skills: parseList(quickEditForm.skills),
          bio: quickEditForm.bio.trim(),
          languages: parseList(quickEditForm.languages),
          rate: quickEditForm.rate.trim(),
          workExperience: freelancerData?.workExperience || [],
          projectPortfolio: freelancerData?.projectPortfolio || [],
          education: freelancerData?.education || [],
        }),
      });

      if (!freelancerRes.ok) {
        throw new Error("Failed to update freelancer profile");
      }

      setUserData((prev) =>
        prev
          ? {
              ...prev,
              name: nextName,
              lastName: nextLastName,
            }
          : prev
      );

      setFreelancerData((prev) =>
        prev
          ? {
              ...prev,
              bio: quickEditForm.bio.trim(),
              location: quickEditForm.location.trim(),
              rate: quickEditForm.rate.trim(),
              skills: parseList(quickEditForm.skills),
              languages: parseList(quickEditForm.languages),
            }
          : prev
      );

      setQuickEditOpen(false);
    } finally {
      setSavingQuickEdit(false);
    }
  };

  const openContentStudio = () => {
    const work = freelancerData?.workExperience || [];
    const projects = freelancerData?.projectPortfolio || [];

    setWorkExperienceForm(
      work.length
        ? work.map((item) => ({
            jobTitle: item.jobTitle || "",
            company: item.company || "",
            startDate: item.startDate || "",
            endDate: item.endDate || "",
            description: item.description || "",
          }))
        : [createEmptyWork()]
    );

    setProjectForm(
      projects.length
        ? projects.map((item) => ({
            projectTitle: item.projectTitle || "",
            projectDescription: item.projectDescription || "",
            technologiesText: (item.technologies || []).join(", "),
            filesText: (item.portfolioFiles || []).join("\n"),
          }))
        : [createEmptyProject()]
    );

    setContentStudioOpen(true);
  };

  const handleSaveContentStudio = async () => {
    if (!freelancerData) return;

    setSavingContentStudio(true);
    try {
      const sanitizedWork = workExperienceForm
        .map((item) => ({
          jobTitle: item.jobTitle.trim(),
          company: item.company.trim(),
          startDate: item.startDate.trim(),
          endDate: item.endDate.trim(),
          description: item.description.trim(),
        }))
        .filter((item) => item.jobTitle && item.company && item.startDate);

      const sanitizedProjects = projectForm
        .map((item) => ({
          projectTitle: item.projectTitle.trim(),
          projectDescription: item.projectDescription.trim(),
          technologies: parseList(item.technologiesText),
          portfolioFiles: item.filesText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        }))
        .filter(
          (item) =>
            item.projectTitle &&
            item.projectDescription &&
            Array.isArray(item.technologies) &&
            item.technologies.length > 0
        );

      const res = await fetchWithAuth("/api/freelancerInfo", {
        method: "PUT",
        body: JSON.stringify({
          location: freelancerData.location || "",
          skills: freelancerData.skills || [],
          bio: freelancerData.bio || "",
          languages: freelancerData.languages || [],
          rate: freelancerData.rate || "",
          workExperience: sanitizedWork,
          projectPortfolio: sanitizedProjects,
          education: freelancerData.education || [],
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile content");
      }

      const data = await res.json();
      setFreelancerData((prev) => ({
        ...(prev || {}),
        workExperience: data?.freelancer?.workExperience || sanitizedWork,
        projectPortfolio: data?.freelancer?.projectPortfolio || sanitizedProjects,
      }));

      setContentStudioOpen(false);
    } finally {
      setSavingContentStudio(false);
    }
  };

  const handleProjectFileUpload = async (
    projectIndex: number,
    fileList: FileList | null
  ) => {
    if (!fileList || fileList.length === 0) return;

    setUploadingProjectIndex(projectIndex);
    setUploadError(null);

    try {
      const files = Array.from(fileList);
      const uploadedUrls = await Promise.all(files.map((file) => upload(file)));

      setProjectForm((prev) =>
        prev.map((project, index) => {
          if (index !== projectIndex) return project;

          const merged = [project.filesText.trim(), ...uploadedUrls]
            .filter(Boolean)
            .join("\n");

          return {
            ...project,
            filesText: merged,
          };
        })
      );
    } catch (error) {
      setUploadError("File upload failed. Please try again.");
    } finally {
      setUploadingProjectIndex(null);
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
      <div className="space-y-6">
          <section className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#f8fbf9] via-white to-[#eef5f1] shadow-[0_24px_54px_rgba(26,44,35,0.08)]">
            <div className="h-36 bg-[radial-gradient(circle_at_20%_30%,rgba(47,95,74,0.22),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(197,160,89,0.25),transparent_35%),linear-gradient(120deg,#dce8e1,#f8fbf9)]" />
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
                    <h1 className="font-headline text-3xl font-medium text-slate-900 sm:text-4xl">
                      {displayName}
                    </h1>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-semibold text-primary-700">{freelancerData?.location || "Location pending"}</span>
                      <span className="text-slate-300">•</span>
                      <span>{userData?.email || "No email"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pb-2">
                  {isOwnProfile && (
                    <>
                      <button
                        type="button"
                        onClick={() => setQuickEditOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Quick Edit
                      </button>
                      <Link
                        href="/user/setting"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Edit Profile
                      </Link>
                    </>
                  )}
                  {!isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => setQuickEditOpen(false)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                      disabled
                    >
                      Available Now
                    </button>
                  )}
                  {isOwnProfile || !isClientViewer ? (
                    <Link
                      href="/search/jobs"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Find Jobs
                    </Link>
                  ) : (
                    <Link
                      href="/client/best-matches"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Back to Matches
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
                <SparklesIcon className="h-4 w-4" />
                {userData?.profileVisible ? "Open for new projects" : "Private profile mode"}
              </div>

              <div className="mt-6 rounded-2xl bg-white p-5">
                <h3 className="font-headline text-2xl font-medium text-slate-900">About Me</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {freelancerData?.bio?.trim() ||
                    "Add your professional story, style, and strengths from settings to make your profile stand out to clients."}
                </p>
              </div>
            </div>
          </section>

          <section className={`grid gap-4 ${isOwnProfile ? "md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]" : "md:grid-cols-3"}`}>
            {isOwnProfile && (
              <article className="rounded-2xl bg-white p-5 shadow-[0_14px_32px_rgba(26,44,35,0.08)]">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Profile Strength</p>
                    <p className="mt-1 text-sm text-slate-600">Complete portfolio and resume to improve discoverability</p>
                  </div>
                  <p className="font-headline text-3xl font-medium text-primary-700">{profileStrength}%</p>
                </div>
                <div className="mt-4 h-2.5 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary-700 transition-all" style={{ width: `${profileStrength}%` }} />
                </div>
              </article>
            )}

            <article className="rounded-2xl bg-white p-5 text-center shadow-[0_14px_32px_rgba(26,44,35,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Experience</p>
              <p className="mt-2 font-headline text-3xl font-medium text-slate-900">{experienceYears}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Years</p>
            </article>

            <article className="rounded-2xl bg-white p-5 text-center shadow-[0_14px_32px_rgba(26,44,35,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Projects</p>
              <p className="mt-2 font-headline text-3xl font-medium text-slate-900">{totalWeddings}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Completed</p>
            </article>

            <article className="rounded-2xl bg-white p-5 text-center shadow-[0_14px_32px_rgba(26,44,35,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Rating</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                <p className="font-headline text-3xl font-medium text-slate-900">
                  {typeof freelancerData?.rating === "number" ? freelancerData.rating.toFixed(1) : "0.0"}
                </p>
                <StarIcon className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Client feedback</p>
            </article>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-[0_16px_36px_rgba(26,44,35,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-headline text-2xl font-medium text-slate-900">Featured Portfolio</h3>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={openContentStudio}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700"
                >
                  Add / Edit
                </button>
              )}
            </div>

            {portfolioImages.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {portfolioImages.slice(0, 9).map((image, index) => (
                  <div key={`${image}-${index}`} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-100">
                    <SafeImage src={image} alt={`Portfolio ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No portfolio images yet. Add project files in settings to populate this section automatically.</p>
            )}
          </section>

          {freelancerData?.projectPortfolio?.length ? (
            <section className="rounded-2xl bg-white p-6 shadow-[0_16px_36px_rgba(26,44,35,0.08)]">
              <div className="mb-5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-primary-700" />
                  <h3 className="font-headline text-2xl font-medium text-slate-900">Project Portfolio</h3>
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={openContentStudio}
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {freelancerData.projectPortfolio.map((project, index) => {
                  const firstImage = project.portfolioFiles?.find((file) => imageRegex.test(file));
                  return (
                    <div
                      key={index}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-[0_10px_28px_rgba(26,44,35,0.12)]"
                    >
                      {firstImage ? (
                        <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                          <SafeImage
                            src={firstImage}
                            alt={project.projectTitle || `Project ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-sm text-slate-500">
                          No preview image
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-slate-900">
                          {project.projectTitle || `Project ${index + 1}`}
                        </h4>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {project.projectDescription || "No description provided."}
                        </p>
                        {project.technologies?.length ? (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {project.technologies.slice(0, 3).map((tech, i) => (
                              <span
                                key={i}
                                className="inline-block rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 3 && (
                              <span className="inline-block text-xs text-slate-500">
                                +{project.technologies.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl bg-white p-6 shadow-[0_16px_36px_rgba(26,44,35,0.08)]">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ChartBarSquareIcon className="h-5 w-5 text-primary-700" />
                  <h3 className="font-headline text-2xl font-medium text-slate-900">Work Experience</h3>
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={openContentStudio}
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700"
                  >
                    Edit
                  </button>
                )}
              </div>

              {freelancerData?.workExperience?.length ? (
                <div className="space-y-4">
                  {freelancerData.workExperience.map((work, index) => (
                    <div key={`${work.company}-${index}`} className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">{work.jobTitle || "Role"}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-primary-700">
                        {work.company || "Company"}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {formatDateRange(work.startDate, work.endDate)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{work.description || "No description provided."}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No work experience added yet.</p>
              )}
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-[0_16px_36px_rgba(26,44,35,0.08)]">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <DocumentIcon className="h-5 w-5 text-primary-700" />
                  <h3 className="font-headline text-2xl font-medium text-slate-900">Expertise & Documents</h3>
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={openContentStudio}
                    className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {(freelancerData?.skills || []).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-primary-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {!freelancerData?.skills?.length && (
                      <span className="text-sm text-slate-500">No skills added.</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {(freelancerData?.languages || []).map((lang) => (
                      <span key={lang} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {lang}
                      </span>
                    ))}
                    {!freelancerData?.languages?.length && (
                      <span className="text-sm text-slate-500">No languages added.</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Documents</p>
                  <div className="space-y-2">
                    {documents.slice(0, 6).map((doc, index) => {
                      const filename = doc.split("/").pop() || `Document ${index + 1}`;
                      return (
                        <a
                          key={`${doc}-${index}`}
                          href={doc}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                        >
                          <span className="line-clamp-1">{filename}</span>
                          <CheckBadgeIcon className="h-4 w-4 text-primary-700" />
                        </a>
                      );
                    })}
                    {!documents.length && <p className="text-sm text-slate-500">No documents uploaded.</p>}
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl bg-white p-4 shadow-[0_12px_30px_rgba(26,44,35,0.07)]">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Location</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <MapPinIcon className="h-4 w-4 text-primary-700" />
                {freelancerData?.location || userData?.city || "Not set"}
              </p>
            </article>
            <article className="rounded-2xl bg-white p-4 shadow-[0_12px_30px_rgba(26,44,35,0.07)]">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Rate</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <CalendarDaysIcon className="h-4 w-4 text-primary-700" />
                {freelancerData?.rate ? `Rs ${freelancerData.rate}` : "Not set"}
              </p>
            </article>
            <article className="rounded-2xl bg-white p-4 shadow-[0_12px_30px_rgba(26,44,35,0.07)]">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Verification</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <UserCircleIcon className="h-4 w-4 text-primary-700" />
                {userData?.kycVerified ? "KYC verified" : "KYC pending"}
              </p>
            </article>
          </section>
      </div>

      {quickEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-[0_26px_56px_rgba(26,44,35,0.24)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-headline text-2xl font-medium text-slate-900">Quick Edit Profile</h2>
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
                <span className="mb-1 block text-slate-500">Bio</span>
                <textarea
                  rows={4}
                  value={quickEditForm.bio}
                  onChange={(e) =>
                    setQuickEditForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 outline-none focus:bg-white"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-500">Location</span>
                <input
                  value={quickEditForm.location}
                  onChange={(e) =>
                    setQuickEditForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 outline-none focus:bg-white"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-500">Rate (Rs)</span>
                <input
                  value={quickEditForm.rate}
                  onChange={(e) =>
                    setQuickEditForm((prev) => ({ ...prev, rate: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 outline-none focus:bg-white"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-slate-500">Skills (comma separated)</span>
                <input
                  value={quickEditForm.skills}
                  onChange={(e) =>
                    setQuickEditForm((prev) => ({ ...prev, skills: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 outline-none focus:bg-white"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-slate-500">Languages (comma separated)</span>
                <input
                  value={quickEditForm.languages}
                  onChange={(e) =>
                    setQuickEditForm((prev) => ({ ...prev, languages: e.target.value }))
                  }
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 outline-none focus:bg-white"
                />
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

      {contentStudioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-[0_26px_56px_rgba(26,44,35,0.24)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-headline text-2xl font-medium text-slate-900">Content Studio</h2>
              <button
                type="button"
                onClick={() => setContentStudioOpen(false)}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid max-h-[70vh] gap-6 overflow-y-auto pr-1 lg:grid-cols-2">
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Work Experience</h3>
                  <button
                    type="button"
                    onClick={() => setWorkExperienceForm((prev) => [...prev, createEmptyWork()])}
                    className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add
                  </button>
                </div>

                {workExperienceForm.map((work, index) => (
                  <div key={`work-${index}`} className="rounded-xl bg-slate-50 p-3">
                    <div className="mb-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setWorkExperienceForm((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="text-slate-500 transition hover:text-slate-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={work.jobTitle}
                        onChange={(e) =>
                          setWorkExperienceForm((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, jobTitle: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Job title"
                        className="rounded-lg bg-white px-3 py-2 text-sm outline-none"
                      />
                      <input
                        value={work.company}
                        onChange={(e) =>
                          setWorkExperienceForm((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, company: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Company"
                        className="rounded-lg bg-white px-3 py-2 text-sm outline-none"
                      />
                      <input
                        value={work.startDate}
                        onChange={(e) =>
                          setWorkExperienceForm((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, startDate: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Start date (e.g. 2020 or 2020-05-01)"
                        className="rounded-lg bg-white px-3 py-2 text-sm outline-none"
                      />
                      <input
                        value={work.endDate}
                        onChange={(e) =>
                          setWorkExperienceForm((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, endDate: e.target.value } : item
                            )
                          )
                        }
                        placeholder="End date"
                        className="rounded-lg bg-white px-3 py-2 text-sm outline-none"
                      />
                      <textarea
                        rows={3}
                        value={work.description}
                        onChange={(e) =>
                          setWorkExperienceForm((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, description: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Short description"
                        className="sm:col-span-2 rounded-lg bg-white px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                ))}
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Portfolio Projects & Documents</h3>
                  <button
                    type="button"
                    onClick={() => setProjectForm((prev) => [...prev, createEmptyProject()])}
                    className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add
                  </button>
                </div>

                {projectForm.map((project, index) => (
                  <div key={`project-${index}`} className="rounded-xl bg-slate-50 p-3">
                    <div className="mb-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setProjectForm((prev) => prev.filter((_, i) => i !== index))}
                        className="text-slate-500 transition hover:text-slate-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-2">
                      <input
                        value={project.projectTitle}
                        onChange={(e) =>
                          setProjectForm((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, projectTitle: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Project title"
                        className="rounded-lg bg-white px-3 py-2 text-sm outline-none"
                      />
                      <textarea
                        rows={3}
                        value={project.projectDescription}
                        onChange={(e) =>
                          setProjectForm((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, projectDescription: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Project description"
                        className="rounded-lg bg-white px-3 py-2 text-sm outline-none"
                      />
                      <input
                        value={project.technologiesText}
                        onChange={(e) =>
                          setProjectForm((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, technologiesText: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Technologies / tags (comma separated)"
                        className="rounded-lg bg-white px-3 py-2 text-sm outline-none"
                      />
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-600">Files</label>
                        <div className="space-y-2">
                          {project.filesText
                            .split("\n")
                            .filter((url) => url.trim())
                            .map((url, fileIndex) => {
                              let displayName = url;
                              if (url.includes("firebasestorage")) {
                                const match = url.match(/\/o\/([^?]*)/);
                                if (match) {
                                  displayName = decodeURIComponent(match[1]).split("/").pop() || url;
                                }
                              }
                              return (
                                <div
                                  key={`file-${fileIndex}`}
                                  className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2"
                                >
                                  <span className="truncate text-sm text-slate-700">{displayName}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedFiles = project.filesText
                                        .split("\n")
                                        .filter((_, i) => i !== fileIndex)
                                        .join("\n");
                                      setProjectForm((prev) =>
                                        prev.map((item, i) =>
                                          i === index ? { ...item, filesText: updatedFiles } : item
                                        )
                                      );
                                    }}
                                    className="ml-2 inline-flex items-center justify-center text-slate-500 transition hover:text-red-600"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
                          <PlusIcon className="h-4 w-4" />
                          Upload Files
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => handleProjectFileUpload(index, e.target.files)}
                          />
                        </label>
                        {uploadingProjectIndex === index && (
                          <span className="text-xs text-slate-500">Uploading...</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            </div>

            {uploadError && (
              <p className="mt-4 text-sm text-slate-600">{uploadError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setContentStudioOpen(false)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveContentStudio}
                disabled={savingContentStudio}
                className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingContentStudio ? "Saving..." : "Save Content"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

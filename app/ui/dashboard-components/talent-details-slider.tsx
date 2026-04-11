"use client";

import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  EyeIcon,
  TagIcon,
  SparklesIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import SaveButton from "../saveButton";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useRouter, useSearchParams } from "next/navigation";
import SafeImage from "@/app/ui/shared/SafeImage";

interface Freelancer {
  freelancerId?: string;
  fullName?: string;
  location?: string;
  rate?: string;
  saved?: boolean;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
  workExperience?: {
    _id: string;
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
  }[];
  education?: {
    _id: string;
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
  }[];
  projectPortfolio?: {
    projectTitle: string;
    projectDescription: string;
    technologies: string[];
    portfolioFiles: string[];
  }[];
}

const imageRegex = /\.(png|jpg|jpeg|webp|gif|svg)$/i;

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const TalentDetailsSlider: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const freelancerId = searchParams.get("freelancerId");

  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    if (!freelancerId) {
      setFreelancer(null);
      return;
    }

    const fetchFreelancerData = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(
          `/api/freelancers?userId=${freelancerId}&s=true`,
          {
            next: { revalidate: 60 },
          }
        );
        const { freelancer } = await response.json();

        setFreelancer(freelancer);
      } catch (error) {
        console.error("Error fetching freelancer data:", error);
        setFreelancer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerData();
  }, [freelancerId]);

  const onClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("freelancerId");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleImageClick = (project: any) => {
    setSelectedProject(project);
  };

  const closeProjectPopup = () => {
    setSelectedProject(null);
  };

  const sliderVariants: Variants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" as const },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" as const },
    },
  };

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.3, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const pulseVariants: Variants = {
    pulse: {
      opacity: [0.4, 0.8, 0.4],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
    },
  };

  const popupVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, height: "50%" },
    visible: {
      opacity: 1,
      scale: 1,
      height: "85%",
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      height: "50%",
      transition: { duration: 0.3 },
    },
  };

  if (!freelancerId) return null;

  return (
    <AnimatePresence>
      {freelancerId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-black"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            className="relative h-full w-full max-w-4xl overflow-y-auto rounded-l-2xl bg-slate-50 p-6 shadow-xl"
            variants={sliderVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {loading || !freelancer ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <motion.div
                    className="h-6 w-20 bg-gray-300 rounded"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                  <motion.div
                    className="h-8 w-8 bg-gray-300 rounded-full"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                </div>
                <div className="flex flex-row items-center border-b p-5 gap-10">
                  <motion.div
                    className="w-40 h-40 rounded-full bg-gray-300"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                  <div className="flex flex-col gap-4">
                    <motion.div
                      className="h-6 w-32 bg-gray-300 rounded"
                      variants={pulseVariants}
                      animate="pulse"
                    />
                    <motion.div
                      className="h-4 w-48 bg-gray-300 rounded"
                      variants={pulseVariants}
                      animate="pulse"
                    />
                    <motion.div
                      className="h-4 w-40 bg-gray-300 rounded"
                      variants={pulseVariants}
                      animate="pulse"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-6 shadow-[0_16px_36px_rgba(26,44,35,0.08)]">
                        <div className="flex flex-row items-center gap-8 border-b border-slate-200 pb-5">
                          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                            <SafeImage
                              src={freelancer.profilePicture || "/placeholder.svg"}
                              width={140}
                              height={140}
                              alt="dp"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="flex flex-col gap-3">
                            <h2 className="font-headline text-5xl font-medium leading-tight text-slate-900">
                              {freelancer.fullName || "Freelancer"}
                            </h2>
                            <div className="flex flex-wrap gap-5 text-sm text-slate-600">
                              <div className="flex items-center">
                                <BuildingLibraryIcon className="mr-2 h-4 w-4" />
                                <p>{freelancer.location || "Location not specified"}</p>
                              </div>
                              <div className="flex items-center">
                                <CurrencyDollarIcon className="mr-2 h-5 w-5" />
                                <p>Booking Fee / Rate: {freelancer.rate || "N/A"} $/hr</p>
                              </div>
                            </div>
                          </span>
                        </div>

                        <div className="mt-5 border-b border-slate-200 pb-5">
                          <h3 className="mb-2 font-headline text-3xl font-medium text-slate-900">About Me</h3>
                          <p className="text-slate-700 text-md leading-7">{freelancer.bio || "No bio provided."}</p>
                        </div>

                        <div className="mt-5 border-b border-slate-200 pb-5">
                          <h3 className="mb-3 font-headline text-3xl font-medium text-slate-900">Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {freelancer.skills?.length ? (
                              freelancer.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-800"
                                >
                                  <TagIcon className="mr-1 h-4 w-4" />
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <p className="text-sm text-slate-500">No skills listed.</p>
                            )}
                          </div>
                        </div>

                        {freelancer.workExperience?.length ? (
                          <div className="mt-5 border-b border-slate-200 pb-5">
                            <h3 className="mb-4 flex items-center font-headline text-3xl font-medium text-slate-900">
                              <SparklesIcon className="mr-2 h-6 w-6" /> Wedding Experience
                            </h3>
                            <div className="space-y-4">
                              {freelancer.workExperience.map((job) => (
                                <div key={job._id} className="rounded-xl bg-slate-50 p-4">
                                  <h4 className="text-xl font-semibold text-slate-900">{job.jobTitle}</h4>
                                  <p className="mt-1 text-slate-600">{job.company}</p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    {formatDate(job.startDate)} - {formatDate(job.endDate)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {freelancer.education?.length ? (
                          <div className="mt-5 border-b border-slate-200 pb-5">
                            <h3 className="mb-4 flex items-center font-headline text-3xl font-medium text-slate-900">
                              <AcademicCapIcon className="mr-2 h-6 w-6" /> Education
                            </h3>
                            <div className="space-y-4">
                              {freelancer.education.map((edu) => (
                                <div key={edu._id} className="rounded-xl bg-slate-50 p-4">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <h4 className="text-xl font-semibold text-slate-900">{edu.degree}</h4>
                                    <p className="text-sm text-slate-500">
                                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                                    </p>
                                  </div>
                                  <p className="mt-1 text-slate-600">{edu.institution}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {freelancer.projectPortfolio?.length ? (
                          <div className="mt-5 pb-2">
                            <h3 className="mb-4 font-headline text-3xl font-medium text-slate-900">Project Portfolio</h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {freelancer.projectPortfolio.map((project, index) => {
                                const firstImage = project.portfolioFiles.find((file) => imageRegex.test(file));
                                return (
                                  <button
                                    key={index}
                                    type="button"
                                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:shadow-[0_10px_28px_rgba(26,44,35,0.12)]"
                                    onClick={() => handleImageClick(project)}
                                  >
                                    {firstImage ? (
                                      <SafeImage
                                        src={firstImage}
                                        alt={project.projectTitle || `Project ${index + 1}`}
                                        width={520}
                                        height={300}
                                        className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                      />
                                    ) : (
                                      <div className="flex h-48 w-full items-center justify-center bg-slate-100 text-sm text-slate-500">
                                        No preview image
                                      </div>
                                    )}
                                    <div className="p-4">
                                      <p className="text-base font-semibold text-slate-900">
                                        {project.projectTitle || `Project ${index + 1}`}
                                      </p>
                                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                                        {project.projectDescription || "No description provided."}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
            )}
          </motion.div>

          {selectedProject && (
            <motion.div
              className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProjectPopup}
            >
              <motion.div
                className="relative max-h-[88vh] w-[92%] max-w-screen-xl overflow-y-auto rounded-2xl bg-white p-10 shadow-lg"
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-2 right-2 text-3xl text-gray-500 hover:text-gray-700"
                  onClick={closeProjectPopup}
                >
                  <span className="sr-only">Close</span> ×
                </button>
                <div className="flex flex-row gap-4">
                  <div className="w-1/2 h-full overflow-y-auto">
                    <h3 className="text-4xl font-semibold mb-4">
                      {selectedProject.projectTitle}
                    </h3>
                    <p className="text-gray-600 mb-4 mt-10">
                      Project Description
                    </p>
                    <p className="text-gray-800 mb-4">
                      {selectedProject.projectDescription}
                    </p>
                    <p className="text-gray-600 mb-5 mt-10">
                      Technologies Used
                    </p>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {selectedProject.technologies.map(
                        (tech: string, index: number) => (
                          <span
                            key={index}
                            className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm"
                          >
                            {tech}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="m-auto mt-2 flex w-1/2 flex-col gap-8 justify-center overflow-y-auto items-center">
                    {selectedProject.portfolioFiles
                      .filter((file: string) => imageRegex.test(file))
                      .map((file: string, index: number) => (
                        <SafeImage
                          key={index}
                          src={file || "/placeholder.svg"}
                          alt={`Project image ${index + 1}`}
                          width={800}
                          height={800}
                          className="w-full rounded-lg object-cover"
                        />
                      ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default TalentDetailsSlider;

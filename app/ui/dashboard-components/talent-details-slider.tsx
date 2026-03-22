"use client";

import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  TagIcon,
  SparklesIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import SaveButton from "../saveButton";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useRouter, useSearchParams } from "next/navigation";

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

  const sliderVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.3, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const pulseVariants = {
    pulse: {
      opacity: [0.4, 0.8, 0.4],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const popupVariants = {
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
            className="relative bg-white w-full max-w-4xl h-full p-6 shadow-xl overflow-y-auto rounded-l-lg"
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
                      className="h-12 w-48 bg-gray-300 rounded"
                      variants={pulseVariants}
                      animate="pulse"
                    />
                    <div className="flex gap-5">
                      <motion.div
                        className="h-5 w-24 bg-gray-300 rounded"
                        variants={pulseVariants}
                        animate="pulse"
                      />
                      <motion.div
                        className="h-5 w-24 bg-gray-300 rounded"
                        variants={pulseVariants}
                        animate="pulse"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-b pb-4">
                  <motion.div
                    className="h-6 w-1/3 bg-gray-300 rounded mb-2"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                  <motion.div
                    className="h-4 w-full bg-gray-300 rounded"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                  <motion.div
                    className="h-4 w-5/6 bg-gray-300 rounded"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                </div>
                <div className="mt-4 border-b pb-4">
                  <motion.div
                    className="h-6 w-1/3 bg-gray-300 rounded mb-2"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                  <div className="flex gap-2">
                    <motion.div
                      className="h-8 w-20 bg-gray-300 rounded-full"
                      variants={pulseVariants}
                      animate="pulse"
                    />
                    <motion.div
                      className="h-8 w-20 bg-gray-300 rounded-full"
                      variants={pulseVariants}
                      animate="pulse"
                    />
                  </div>
                </div>
                <div className="mt-4 border-b pb-4">
                  <motion.div
                    className="h-6 w-1/3 bg-gray-300 rounded mb-2"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                  <motion.div
                    className="h-5 w-1/2 bg-gray-300 rounded mb-2"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                  <motion.div
                    className="h-4 w-3/4 bg-gray-300 rounded"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                </div>
                <div className="mt-4 border-b pb-4">
                  <motion.div
                    className="h-6 w-1/3 bg-gray-300 rounded mb-2"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                  <motion.div
                    className="h-5 w-1/2 bg-gray-300 rounded mb-2"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                  <motion.div
                    className="h-4 w-3/4 bg-gray-300 rounded"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                </div>
                <div className="mt-4 border-b pb-4">
                  <motion.div
                    className="h-6 w-1/3 bg-gray-300 rounded mb-2"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                  <motion.div
                    className="w-[200px] h-[200px] bg-gray-300 rounded-lg"
                    variants={pulseVariants}
                    animate="pulse"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <button
                    className="text-gray-500 hover:text-gray-700 flex items-center"
                    onClick={onClose}
                  >
                    <ArrowLeftIcon className="w-6 h-6 mr-1" /> <span>Back</span>
                  </button>
                  <SaveButton
                    itemId={freelancer.freelancerId}
                    saved={freelancer.saved}
                    itemType="freelancer"
                  />
                </div>
                <div className="flex flex-row items-center space-y-10 border-b p-5 gap-10">
                  <span className="flex items-center justify-center w-40 h-40 rounded-full overflow-hidden">
                    <Image
                      src={freelancer.profilePicture || "/placeholder.svg"}
                      width={200}
                      height={200}
                      alt="dp"
                    />
                  </span>
                  <span className="flex flex-col gap-4">
                    <h2 className="text-5xl font-medium mb-2">
                      {freelancer.fullName}
                    </h2>
                    <div className="text-md flex pb-4 gap-5">
                      <div className="flex items-center">
                        <BuildingLibraryIcon className="w-4 h-4 mr-2 text-gray-600" />
                        <p className="text-gray-600">{freelancer.location}</p>
                      </div>
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-5 h-5 mr-2 text-gray-600" />
                        <p className="text-gray-600">Booking Fee / Rate: {freelancer.rate} $/hr</p>
                      </div>
                    </div>
                  </span>
                </div>
                <div className="mt-4 border-b pb-4">
                  <h3 className="text-2xl font-semibold my-3">About Me</h3>
                  <p className="text-gray-800 text-md">{freelancer.bio}</p>
                </div>
                <div className="mt-4 border-b pb-4">
                  <h3 className="text-2xl font-semibold my-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full flex items-center"
                      >
                        <TagIcon className="w-4 h-4 mr-1" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {freelancer.workExperience?.length ? (
                  <div className="mt-4 border-b pb-4">
                    <h3 className="text-2xl font-semibold mb-4 flex items-center">
                      <SparklesIcon className="w-6 h-6 mr-2" /> Wedding
                      Experience
                    </h3>
                    {freelancer.workExperience?.map((job) => (
                      <div key={job._id} className="mb-4 flex flex-col">
                        <h3 className="text-xl font-medium mt-2">
                          {job.jobTitle}
                        </h3>
                        <p className="text-gray-600">{job.company}</p>
                        <p className="text-md text-gray-500">
                          {formatDate(job.startDate)} -{" "}
                          {formatDate(job.endDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {freelancer.education?.length ? (
                  <div className="mt-4 border-b pb-4">
                    <h3 className="text-2xl font-semibold mb-4 flex items-center">
                      <AcademicCapIcon className="w-6 h-6 mr-2" /> Education
                    </h3>
                    {freelancer.education?.map((edu) => (
                      <div key={edu._id} className="mb-4">
                        <span className="flex justify-between items-center">
                          <h3 className="text-xl font-medium">{edu.degree}</h3>
                          <p className="text-md text-gray-500">
                            {formatDate(edu.startDate)} -{" "}
                            {formatDate(edu.endDate)}
                          </p>
                        </span>
                        <p className="text-gray-600">{edu.institution}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {freelancer.projectPortfolio?.length ? (
                  <div className="mt-4 border-b pb-16">
                    <h3 className="text-2xl font-semibold mb-4 flex items-center">
                      Project Portfolio
                    </h3>
                    {freelancer.projectPortfolio?.map((project, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex flex-row flex-wrap">
                          {project.portfolioFiles
                            .slice(0, 1)
                            .map((file, fileIndex) => (
                              <span
                                key={fileIndex}
                                className="w-[200px] h-[200px] my-10 hover:shadow-xl border-neutral-200 border-2 hover:scale-105 rounded-lg transition-all duration-300"
                                onClick={() => handleImageClick(project)}
                              >
                                <Image
                                  src={file || "/placeholder.svg"}
                                  alt={`Project image ${fileIndex + 1}`}
                                  width={150}
                                  height={150}
                                  className="rounded-lg object-cover w-full h-full"
                                />
                                <p className="font-medium mt-5 text-primary-600">
                                  {project.projectTitle}
                                </p>
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
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
                className="bg-white p-10 rounded-lg shadow-lg max-w-screen-xl w-[90%] relative overflow-y-auto"
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
                  <div className="flex flex-col gap-10 justify-center w-1/2 m-auto items-center mt-2 overflow-y-auto">
                    {selectedProject.portfolioFiles.map(
                      (file: string, index: number) => (
                        <Image
                          key={index}
                          src={file || "/placeholder.svg"}
                          alt={`Project image ${index + 1}`}
                          width={800}
                          height={800}
                          className="rounded-lg object-cover w-full"
                        />
                      )
                    )}
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

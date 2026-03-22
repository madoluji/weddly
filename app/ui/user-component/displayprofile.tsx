"use client";

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function DisplayProfile() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [freelancerData, setFreelancerData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(
    null
  );

  // Fetch user data
  useEffect(() => {
    if (session?.user?.id) {
      const fetchUserData = async () => {
        try {
          const res = await fetchWithAuth(
            `/api/user?userId=${session?.user.id}`
          );
          const data = await res.json();
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [session]);

  // Fetch freelancer data
  useEffect(() => {
    if (session?.user?.id) {
      const fetchFreelancerData = async () => {
        try {
          const res = await fetchWithAuth(
            `/api/freelancers?userId=${session?.user.id}`
          );
          const data = await res.json();
          setFreelancerData(data.freelancer); // Extract freelancer object
        } catch (error) {
          console.error("Error fetching freelancer data:", error);
        }
      };
      fetchFreelancerData();
    }
  }, [session]);

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!userData?.name) return "U";
    return `${userData.name.charAt(0)}${userData.lastName ? userData.lastName.charAt(0) : ""}`;
  };

  // Close attachment modal
  const closeAttachmentModal = () => {
    setSelectedAttachment(null);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAttachmentModal();
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedAttachment) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedAttachment]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-md mb-8 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-300"></div>
        <div className="relative pt-0 px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 gap-4">
            <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden">
              {userData?.profilePicture ? (
                <Image
                  width={300}
                  height={300}
                  src={userData.profilePicture || "/placeholder.svg"}
                  alt={userData?.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 text-3xl font-bold">
                  {getInitials()}
                </div>
              )}
            </div>
            <div className="flex-1 pt-4 md:pt-0">
              <h1 className="text-3xl font-bold text-gray-800">
                {userData?.name} {userData?.lastName}
              </h1>
              <div className="flex items-center text-gray-500 mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>{userData?.email}</span>
              </div>
              {freelancerData && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {freelancerData.skills
                    ?.slice(0, 3)
                    .map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  {freelancerData.skills?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{freelancerData.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${userData?.kycVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {userData?.kycVerified ? (
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  ) : (
                    <circle cx="12" cy="12" r="10"></circle>
                  )}
                  {userData?.kycVerified ? (
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  ) : (
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                  )}
                  {!userData?.kycVerified && (
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  )}
                </svg>
                KYC {userData?.kycVerified ? "Verified" : "Pending"}
              </span>
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${userData?.emailVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {userData?.emailVerified ? (
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  ) : (
                    <circle cx="12" cy="12" r="10"></circle>
                  )}
                  {userData?.emailVerified ? (
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  ) : (
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                  )}
                  {!userData?.emailVerified && (
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  )}
                </svg>
                Email {userData?.emailVerified ? "Verified" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="grid grid-cols-2 border-b">
          <button
            onClick={() => setActiveTab("personal")}
            className={`py-3 font-medium text-sm ${activeTab === "personal" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab("professional")}
            disabled={!freelancerData}
            className={`py-3 font-medium text-sm ${activeTab === "professional" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"} ${!freelancerData ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Professional Profile
          </button>
        </div>
      </div>

      {activeTab === "personal" && userData && (
        <div className="space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">
                  Personal Information
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Phone</p>
                    <p className="text-gray-600">
                      {userData?.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Country</p>
                    <p className="text-gray-600">
                      {userData?.country || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">City</p>
                    <p className="text-gray-600">
                      {userData?.city || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Postal Code</p>
                    <p className="text-gray-600">
                      {userData?.zipPostalCode || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "professional" && freelancerData && (
        <div className="space-y-6">
          {/* Skills & Industries Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">
                  Skills & Industries
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancerData?.skills?.length > 0 ? (
                      freelancerData.skills.map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills provided</p>
                    )}
                  </div>
                </div>
                <hr className="my-4" />
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancerData?.industries?.length > 0 ? (
                      freelancerData.industries.map(
                        (industry: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            {industry}
                          </span>
                        )
                      )
                    ) : (
                      <p className="text-gray-500">No industries provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Experience Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">
                  Work Experience
                </h2>
              </div>
            </div>
            <div className="p-6">
              {freelancerData?.workExperience?.length > 0 ? (
                <div className="space-y-6">
                  {freelancerData.workExperience.map(
                    (work: any, index: number) => (
                      <div
                        key={index}
                        className={index > 0 ? "pt-6 border-t" : ""}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-800">
                            {work.jobTitle || work.position}
                          </h3>
                          <span className="mt-1 md:mt-0 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {work.startDate && work.endDate
                              ? `${work.startDate} to ${work.endDate}`
                              : work.duration}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1 inline"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                          </svg>
                          {work.company}
                        </p>
                        <p className="text-sm text-gray-700">
                          {work.description}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No work experience provided.</p>
              )}
            </div>
          </div>

          {/* Project Portfolio Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">
                  Project Portfolio
                </h2>
              </div>
            </div>
            <div className="p-6">
              {freelancerData?.projectPortfolio?.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  {freelancerData.projectPortfolio.map(
                    (project: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white border rounded-lg overflow-hidden shadow-sm"
                      >
                        <div className="h-3 bg-blue-500"></div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 text-gray-800">
                            {project.projectTitle}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {project.projectDescription}
                          </p>

                          {/* Technologies Used */}
                          {project.technologies &&
                            project.technologies.length > 0 && (
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-1">
                                  {project.technologies.map(
                                    (tech: string, techIndex: number) => (
                                      <span
                                        key={techIndex}
                                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                                      >
                                        {tech}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Project Attachment */}
                          {project.portfolioFiles && (
                            <button
                              onClick={() =>
                                setSelectedAttachment(project.portfolioFiles)
                              }
                              className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              View Attachment
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No projects added.</p>
              )}
            </div>
          </div>

          {/* Education Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">
                  Education
                </h2>
              </div>
            </div>
            <div className="p-6">
              {freelancerData?.education?.length > 0 ? (
                <div className="space-y-6">
                  {freelancerData.education.map((edu: any, index: number) => (
                    <div
                      key={index}
                      className={index > 0 ? "pt-6 border-t" : ""}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-800">
                          {edu.degree}
                        </h3>
                        <span className="mt-1 md:mt-0 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {edu.duration}
                        </span>
                      </div>
                      <p className="text-gray-600 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 inline"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        {edu.institution}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No education details provided.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attachment Modal */}
      {selectedAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Project Attachment</h3>
              <button
                onClick={closeAttachmentModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {typeof selectedAttachment === "string" &&
              selectedAttachment.endsWith(".pdf") ? (
                <iframe
                  src={selectedAttachment}
                  className="w-full h-full min-h-[500px]"
                  title="PDF Viewer"
                ></iframe>
              ) : typeof selectedAttachment === "string" &&
                selectedAttachment.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <Image
                  width={300}
                  height={300}
                  src={selectedAttachment || "/placeholder.svg"}
                  alt="Project Attachment"
                  className="max-w-full max-h-[70vh] mx-auto object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-[500px]">
                  <a
                    href={selectedAttachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download File
                  </a>
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <button
                onClick={closeAttachmentModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

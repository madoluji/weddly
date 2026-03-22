"use client";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useState } from "react";
import StarRating from "../starRating";

export default function DisplayClientProfile() {
  const { session, status } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("personal");
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

  // Fetch client data
  useEffect(() => {
    if (session?.user?.id) {
      const fetchClientData = async () => {
        try {
          const res = await fetchWithAuth(
            `/api/clientInfo?userId=${session?.user.id}`
          );
          const data = await res.json();
          setClientData(data.client); // Extract client object
        } catch (error) {
          console.error("Error fetching client data:", error);
        }
      };
      fetchClientData();
    }
  }, [session]);

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!userData?.name) return "U";
    return `${userData.name.charAt(0)}${userData.lastName ? userData.lastName.charAt(0) : ""}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-md mb-8 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-300"></div>
        <div className="relative pt-0 px-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 gap-4">
            <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden">
              {userData?.profilePicture ? (
                <Image
                  width={128}
                  height={128}
                  src={userData.profilePicture || "/placeholder.svg"}
                  alt={userData?.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary-100 text-primary-600 text-3xl font-bold">
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
              {clientData && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {clientData.industry
                    ?.slice(0, 3)
                    .map((industry: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        {industry}
                      </span>
                    ))}
                  {clientData.industry?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{clientData.industry.length - 3} more
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
            className={`py-3 font-medium text-sm ${activeTab === "personal" ? "border-b-2 border-primary-500 text-primary-600" : "text-gray-500"}`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab("client")}
            disabled={!clientData}
            className={`py-3 font-medium text-sm ${activeTab === "client" ? "border-b-2 border-primary-500 text-primary-600" : "text-gray-500"} ${!clientData ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Client Profile
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
                  className="h-5 w-5 text-primary-500"
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
                  <BuildingOffice2Icon className="h-5 w-5 text-gray-400 mt-0.5" />
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

          {/* Account Information Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">
                  Account Information
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <p className="text-gray-600">
                      {userData?.email || "Not provided"}
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">KYC Verified</p>
                    <p className="text-gray-600">
                      {userData?.kycVerified ? "Yes" : "No"}
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
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Email Verified</p>
                    <p className="text-gray-600">
                      {userData?.emailVerified ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "client" && clientData && (
        <div className="space-y-6">
          {/* Company Information Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary-500"
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
                <h2 className="text-xl font-semibold text-gray-800">
                  Company Information
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Full Name</p>
                    <p className="text-gray-600">
                      {clientData?.fullName || "Not provided"}
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
                      y="7"
                      width="20"
                      height="14"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Company</p>
                    <p className="text-gray-600">
                      {clientData?.isCompany ? "Yes" : "No"}
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
                    <p className="font-medium text-gray-800">Location</p>
                    <p className="text-gray-600">
                      {clientData?.location || "Not provided"}
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
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Company Size</p>
                    <p className="text-gray-600">
                      {clientData?.companySize || "Not provided"}
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
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Average Budget</p>
                    <p className="text-gray-600">
                      {clientData?.averageBudget
                        ? `$${clientData.averageBudget}`
                        : "Not provided"}
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
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">Rating</p>
                    <StarRating rating={clientData?.rating} />{" "}
                    {/* 
                    <br />
                    <p className="text-gray-600">
                      {clientData?.rating !== undefined &&
                      clientData?.rating !== null
                        ? `${clientData.rating} / 5`
                        : "Not rated yet"}
                    </p>
                     */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Industry & Skills Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary-500"
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
                  Industry & Skills
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Industry</h3>
                  <div className="flex flex-wrap gap-2">
                    {clientData?.industry?.length > 0 ? (
                      clientData.industry.map((industry: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                        >
                          {industry}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No industry provided</p>
                    )}
                  </div>
                </div>
                <hr className="my-4" />
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">
                    Preferred Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {clientData?.preferredSkills?.length > 0 ? (
                      clientData.preferredSkills.map(
                        (skill: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <p className="text-gray-500">
                        No preferred skills provided
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

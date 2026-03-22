"use client"

import { useEffect, useState } from "react"
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth"
import {
  UsersIcon,
  UserIcon,
  SparklesIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"

const InsightsPage = () => {
  const [insights, setInsights] = useState({
    totalUsers: 0,
    freelancers: 0,
    clients: 0,
    totalKYC: 0,
    verifiedKYC: 0,
    pendingKYC: 0,
    rejectedKYC: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetchWithAuth("/api/admin/stats")
        const datas = await response.json()

        if (response.ok) {
          setInsights((prev) => ({
            ...prev,
            totalUsers: datas.totalUsers,
            freelancers: datas.freelancers,
            clients: datas.clients,
            totalKYC: datas.totalKyc,
            verifiedKYC: datas.approvedKyc,
            rejectedKYC: datas.rejectedKyc,
            pendingKYC: datas.pendingKyc,
          }))
        } else {
          console.error("Failed to fetch user stats:", datas.error)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserStats()
  }, [])

  // Calculate percentages for KYC stats
  const verifiedKYCPercentage = insights.totalKYC > 0 ? Math.round((insights.verifiedKYC / insights.totalKYC) * 100) : 0

  const pendingKYCPercentage = insights.totalKYC > 0 ? Math.round((insights.pendingKYC / insights.totalKYC) * 100) : 0

  const rejectedKYCPercentage = insights.totalKYC > 0 ? Math.round((insights.rejectedKYC / insights.totalKYC) * 100) : 0

  // Calculate freelancer and client percentages
  const freelancerPercentage =
    insights.totalUsers > 0 ? Math.round((insights.freelancers / insights.totalUsers) * 100) : 0

  const clientPercentage = insights.totalUsers > 0 ? Math.round((insights.clients / insights.totalUsers) * 100) : 0

  return (
    <div className="flex flex-col flex-1 p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Header with animation */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 animate-fade-in">Dashboard Insights</h1>
        <p className="text-gray-500 mt-2">Overview of platform statistics and KYC verification status</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* User Statistics Section */}
          <h2 className="text-xl font-semibold text-gray-700 mb-4">User Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Total Users */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{insights.totalUsers}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <UsersIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Platform users</span>
                </div>
              </div>
            </div>

            {/* Wedding Specialists */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Wedding Specialists</p>
                    <p className="text-3xl font-bold text-gray-900">{insights.freelancers}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <UserIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{freelancerPercentage}% of total users</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{ width: `${freelancerPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Venues & Vendors */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Venues & Vendors</p>
                    <p className="text-3xl font-bold text-gray-900">{insights.clients}</p>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <SparklesIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{clientPercentage}% of total users</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${clientPercentage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KYC Verification Section */}
          <h2 className="text-xl font-semibold text-gray-700 mb-4">KYC Verification Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total KYC Submissions */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total KYC</p>
                    <p className="text-3xl font-bold text-gray-900">{insights.totalKYC}</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-full">
                    <DocumentCheckIcon className="h-8 w-8 text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total submissions</span>
                </div>
              </div>
            </div>

            {/* Verified KYC */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Verified KYC</p>
                    <p className="text-3xl font-bold text-green-600">{insights.verifiedKYC}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-green-50 px-6 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">{verifiedKYCPercentage}% of total</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${verifiedKYCPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending KYC */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending KYC</p>
                    <p className="text-3xl font-bold text-yellow-600">{insights.pendingKYC}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 px-6 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-600">{pendingKYCPercentage}% of total</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-yellow-600 h-2.5 rounded-full"
                      style={{ width: `${pendingKYCPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rejected KYC */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rejected KYC</p>
                    <p className="text-3xl font-bold text-red-600">{insights.rejectedKYC}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <XCircleIcon className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-red-50 px-6 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">{rejectedKYCPercentage}% of total</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${rejectedKYCPercentage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default InsightsPage


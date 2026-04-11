"use client";

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AreaChart } from "../../tremorChart-components/area-chart";

interface ChartData {
  date: string;
  count: number;
  totalUsers: number;
  totalFreelancers: number;
  users: number;
  totalClients: number;
}
interface ChartProps {
  timeframe: string;
}

const AccountGrowthChart = ({ timeframe }: ChartProps) => {
  const [userGrowth, setUserGrowth] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const hasData = userGrowth.length > 0;
  const hasTrendData = userGrowth.length > 1;
  const singlePoint = userGrowth[0];

  useEffect(() => {
    async function fetchUserGrowth() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(
          `/api/admin/user-growth?timeframe=${timeframe}`
        );

        if (!res.ok) {
          setUserGrowth([]);
          return;
        }

        const data = await res.json();
        setUserGrowth(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching user growth data:", error);
        setUserGrowth([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserGrowth();
  }, [timeframe]);
  return (
    <>
      {/* Loading Animation */}
      {loading ? (
        <motion.div
          className="h-60 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-8 h-8 border-4 border-primary-500 border-dashed rounded-full animate-spin"></div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!hasData && (
            <div className="h-60 flex items-center justify-center text-sm text-gray-500">
              No account growth data available for this timeframe.
            </div>
          )}
          {hasData && !hasTrendData && (
            <p className="mb-3 text-sm text-amber-600">
              Only one data point found. Switch timeframe to view a trend.
            </p>
          )}
          {hasData && !hasTrendData && singlePoint && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-600 mb-3">Snapshot for {singlePoint.date}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded border border-blue-200 bg-white p-3">
                  <p className="text-gray-500">Users</p>
                  <p className="text-xl font-semibold text-blue-600">{singlePoint.users ?? 0}</p>
                </div>
                <div className="rounded border border-emerald-200 bg-white p-3">
                  <p className="text-gray-500">Freelancers</p>
                  <p className="text-xl font-semibold text-emerald-600">{singlePoint.freelancers ?? 0}</p>
                </div>
                <div className="rounded border border-amber-200 bg-white p-3">
                  <p className="text-gray-500">Clients</p>
                  <p className="text-xl font-semibold text-amber-600">{singlePoint.clients ?? 0}</p>
                </div>
              </div>
            </div>
          )}
          {/* Area Chart */}
          {hasTrendData && (
            <AreaChart
              data={userGrowth}
              categories={["users", "freelancers", "clients"]}
              index="date"
              colors={["blue", "emerald", "amber"]}
              yAxisWidth={50}
              title="User Growth"
              xAxisLabel="Date"
              yAxisLabel="Users"
            />
          )}
          <p className="text-center flex gap-4 mt-6 text-sm">
            <span className="text-blue-500">
              total users: {singlePoint?.totalUsers ?? 0}
            </span>
            <span className="text-sucess-600">
              total freelancers: {singlePoint?.totalFreelancers ?? 0}
            </span>{" "}
            <span className="text-primary-500">
              total clients: {singlePoint?.totalClients ?? 0}
            </span>
          </p>
        </motion.div>
      )}
    </>
  );
};

export default AccountGrowthChart;

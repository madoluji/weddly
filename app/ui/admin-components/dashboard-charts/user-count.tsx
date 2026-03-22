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

  useEffect(() => {
    async function fetchUserGrowth() {
      setLoading(true);
      const res = await fetchWithAuth(
        `/api/admin/user-growth?timeframe=${timeframe}`
      );
      const data: ChartData[] = await res.json();
      setUserGrowth(data);
      setLoading(false);
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
          {/* Area Chart */}
          <AreaChart
            data={userGrowth}
            categories={["users", "freelancers", "clients"]}
            index="date"
            colors={["blue", "emerald", "amber"]}
            yAxisWidth={50}
            // animation={{ duration: 1000 }} // Smooth animation for charts
            title="User Growth"
            xAxisLabel="Date"
            yAxisLabel="Users"
          />
          <p className="text-center flex gap-4 mt-6 text-sm">
            <span className="text-blue-500">
              total users: {userGrowth[0].totalUsers}
            </span>
            <span className="text-sucess-600">
              total freelancers: {userGrowth[0].totalFreelancers}
            </span>{" "}
            <span className="text-primary-500">
              total clients: {userGrowth[0].totalClients}
            </span>
          </p>
        </motion.div>
      )}
    </>
  );
};

export default AccountGrowthChart;

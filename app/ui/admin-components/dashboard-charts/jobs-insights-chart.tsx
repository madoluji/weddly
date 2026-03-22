"use client";

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AreaChart } from "../../tremorChart-components/area-chart";

interface ChartData {
  date: string;
  totalActiveJobs: number;
  totalPendingProposals: number;
  activeJobs: number;
  completedJobs: number;
  canceledJobs: number;
  shortlistedProposals: number;
  acceptedProposals: number;
  totalInProgressJobs: number;
  totalCompletedJobs: number;
}

interface ChartProps {
  timeframe: string;
}

const JobsProposalChart = ({ timeframe }: ChartProps) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchJobsProposals() {
      setLoading(true);
      const res = await fetchWithAuth(
        `/api/admin/jobs-stats-chart?timeframe=${timeframe}`
      );
      const result: ChartData[] = await res.json();
      setData(result);
      setLoading(false);
    }

    fetchJobsProposals();
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
            data={data}
            categories={[
              "activeJobs",
              "inProgressJobs",
              "completedJobs",
              "canceledJobs",
              "submitedProposals",
              "acceptedProposals",
            ]}
            index="date"
            colors={["blue", "emerald", "amber", "pink", "cyan", "lime"]}
            yAxisWidth={50}
            showXAxis={true}
            xAxisLabel="Date"
            yAxisLabel="Jobs & Proposals Count"
            title="Jobs & Proposals Growth"
          />

          {/* Summary Data */}
          <p className="text-center flex gap-4 mt-6 text-sm">
            <span className="text-blue-500">
              Total Active Jobs: {data[0]?.totalActiveJobs || 0}
            </span>

            <span className="text-orange-500">
              Total Pending Proposals: {data[0]?.totalPendingProposals || 0}
            </span>
            <span className="text-sucess-500">
              Total in-progress Jobs: {data[0]?.totalInProgressJobs || 0}
            </span>
            <span className="text-green-700">
              Total Completed Jobs: {data[0]?.totalCompletedJobs || 0}
            </span>
          </p>
        </motion.div>
      )}
    </>
  );
};

export default JobsProposalChart;

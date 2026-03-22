"use client";

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AreaChart } from "../../tremorChart-components/area-chart";

interface ChartData {
  date: string;
  count: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
}
interface ChartProps {
  timeframe: string;
}

const KYCChart = ({ timeframe }: ChartProps) => {
  const [KYC, setKYC] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function KYC() {
      setLoading(true);
      const res = await fetchWithAuth(
        `/api/admin/kyc-growth?timeframe=${timeframe}`
      );
      const data: ChartData[] = await res.json();
      setKYC(data);
      setLoading(false);
    }

    KYC();
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
            data={KYC}
            categories={["submittedKYC", "rejected", "approved"]}
            index="date"
            colors={["blue", "amber", "emerald"]}
            yAxisWidth={50}
            showXAxis={true} // ✅ Ensures X-axis is visible
            // animation={{ duration: 1000 }} // Smooth animation for charts
            xAxisLabel="Date"
            yAxisLabel="KYC Count"
            title="KYC Growth"
          />
          <p className="text-center flex gap-4 mt-6 text-sm">
            <span className="text-blue-500">
              total submittedKYC: {KYC[0].count}{" "}
            </span>
            <span className="text-danger-600">
              rejected docs: {KYC[0].rejectedCount}
            </span>
            <span className="text-sucess-600">
              approved docs: {KYC[0].approvedCount}
            </span>{" "}
            <span className="text-primary-500">
              pending docs: {KYC[0].pendingCount}
            </span>
          </p>
        </motion.div>
      )}
    </>
  );
};

export default KYCChart;

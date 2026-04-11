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
  const hasData = KYC.length > 0;
  const hasTrendData = KYC.length > 1;

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
          {!hasData && (
            <div className="h-60 flex items-center justify-center text-sm text-gray-500">
              No KYC growth data available for this timeframe.
            </div>
          )}
          {hasData && !hasTrendData && (
            <p className="mb-3 text-sm text-amber-600">
              Only one data point found. Switch timeframe to view a trend.
            </p>
          )}
          {/* Area Chart */}
          {hasData && (
            <AreaChart
              data={KYC}
              categories={["submittedKYC", "rejected", "approved"]}
              index="date"
              colors={["blue", "amber", "emerald"]}
              yAxisWidth={50}
              showXAxis={true}
              xAxisLabel="Date"
              yAxisLabel="KYC Count"
              title="KYC Growth"
            />
          )}
          <p className="text-center flex gap-4 mt-6 text-sm">
            <span className="text-blue-500">
              total submittedKYC: {KYC[0]?.count ?? 0}{" "}
            </span>
            <span className="text-danger-600">
              rejected docs: {KYC[0]?.rejectedCount ?? 0}
            </span>
            <span className="text-sucess-600">
              approved docs: {KYC[0]?.approvedCount ?? 0}
            </span>{" "}
            <span className="text-primary-500">
              pending docs: {KYC[0]?.pendingCount ?? 0}
            </span>
          </p>
        </motion.div>
      )}
    </>
  );
};

export default KYCChart;

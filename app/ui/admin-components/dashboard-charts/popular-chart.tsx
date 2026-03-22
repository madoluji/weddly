"use client";

import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AreaChart } from "../../tremorChart-components/area-chart";
import { BarChart } from "../../tremorChart-components/bar-chart";

interface ChartData {
  industry: string;
  count: number;
}

interface ChartProps {
  accountType: string;
}

const PopularIndustriesChart = ({ accountType }: ChartProps) => {
  const [PopularIGrowth, setPopularIGrowth] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchIndustries() {
      setLoading(true);
      const res = await fetchWithAuth(
        `/api/admin/popular-industries?accountType=${accountType}`
      );
      const industryData: ChartData[] = await res.json();
      setPopularIGrowth(industryData);
      setLoading(false);
    }
    fetchIndustries();
  }, [accountType]);
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
          <BarChart
            data={PopularIGrowth}
            categories={["count"]}
            index="industry"
            colors={["emerald"]}
            yAxisWidth={50}
            title="Top Client Industries"
            layout="vertical"
          />
          {/* <p className="text-center flex gap-4 mt-6 text-sm">
            <span className="text-sucess-500">
              {PopularIGrowth[0].industry}: {PopularIGrowth[0].count}
            </span>
            <span className="text-primary-500">
              {PopularIGrowth[1].industry}: {PopularIGrowth[1].count}
            </span>
            <span className="text-danger-500">
              {PopularIGrowth[2].industry}: {PopularIGrowth[2].count}
            </span>
            <span className="text-violet-400">
              {PopularIGrowth[3].industry}: {PopularIGrowth[3].count}
            </span>
            <span className="text-blue-500">
              {PopularIGrowth[4].industry}: {PopularIGrowth[4].count}
            </span>
          </p> */}
        </motion.div>
      )}
    </>
  );
};

export default PopularIndustriesChart;

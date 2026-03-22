"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AreaChart } from "../../tremorChart-components/area-chart";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

interface ChartData {
  _id: string;
  turnOver: number;
  freelancerEarnings: number;
  platformRevenue: number;
  completedTransactions: number;
}

interface ChartProps {
  timeframe: string;
}

const TurnOverChart = ({ timeframe }: ChartProps) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(
          `/api/admin/transcations-chart?type=${timeframe}`
        );
        const jsonResponse = await res.json();

        console.log("API Response:", jsonResponse); // Debugging log

        if (jsonResponse.success && Array.isArray(jsonResponse.data)) {
          interface ApiResponse {
            success: boolean;
            data: ApiResponseData[];
          }

          interface ApiResponseData {
            _id: string;
            turnOver?: number;
            freelancerEarnings?: number;
            platformRevenue?: number;
            completedTransactions?: number;
          }

          const formattedData: ChartData[] = (jsonResponse as ApiResponse).data
            .map((item: ApiResponseData) => ({
              _id: item._id, // Keep _id as a string date
              turnOver: item.turnOver || 0,
              freelancerEarnings: item.freelancerEarnings || 0,
              platformRevenue: item.platformRevenue || 0,
              completedTransactions: item.completedTransactions || 0,
            }))
            .sort(
              (a, b) => new Date(a._id).getTime() - new Date(b._id).getTime()
            ); // Sort by date

          setChartData(formattedData);
        } else {
          setChartData([]); // Handle empty data
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
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
            data={chartData}
            categories={[
              "turnOver",
              "freelancerEarnings",
              "platformRevenue",
              "completedTransactions",
            ]}
            index="_id"
            colors={["blue", "emerald", "amber", "lime"]}
            yAxisWidth={50}
            title="Turn Over Metrics"
            xAxisLabel="Time"
            yAxisLabel="Amount"
          />

          {/* Display Data as Text Below Chart */}
        </motion.div>
      )}
    </>
  );
};

export default TurnOverChart;

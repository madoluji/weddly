"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AreaChart } from "../../tremorChart-components/area-chart";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import {
  ArrowDownCircleIcon,
  ArrowDownTrayIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { set } from "mongoose";
import { ArrowsPointingInIcon, ForwardIcon } from "@heroicons/react/24/solid";

interface ChartProps {
  timeframe: string;
}

const PaymentMethodsChart = ({ timeframe }: ChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [percentageChange, setPercentageChange] = useState<any>({});

  useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(
          `/api/admin/payment-method-stats?type=${timeframe}`
        );
        const jsonResponse = await res.json();
        setPercentageChange(jsonResponse.data.percentageChange);

        console.log("API Response:", jsonResponse);

        if (jsonResponse.success && jsonResponse.data.paymentMethodsStats) {
          const paymentStats = jsonResponse.data.paymentMethodsStats;

          // Get all unique payment methods
          const allMethods = Array.from(
            new Set(
              Object.values(paymentStats).flatMap((day: any) =>
                Object.keys(day)
              )
            )
          );

          // Format data for the chart
          const formattedData = Object.keys(paymentStats).map((date) => {
            const methodsData = paymentStats[date];
            const entry: any = { date: date }; // Changed _id to date for clarity

            // Include all methods, using 0 for missing ones
            allMethods.forEach((method) => {
              entry[method] = methodsData[method] || 0;
            });

            return entry;
          });

          setChartData(formattedData);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error("Error fetching payment methods data:", error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, [timeframe]);

  // Using react-icons for triangle icons
  const ChangeDisplay = ({ change }: any) => {
    return (
      <div className="flex flex-wrap gap-4">
        {Object.keys(change).map((method) => (
          <div
            key={method}
            className="flex items-center p-2 bg-gray-100 rounded-lg shadow-sm"
          >
            <span className="font-semibold text-gray-700">{method}:</span>
            {change[method].map(
              ({
                date,
                percentageChange,
              }: {
                date: string;
                percentageChange: string;
              }) => {
                const isPositive = parseFloat(percentageChange) >= 0;
                return (
                  <div key={date} className="flex items-center ml-2">
                    <div className="flex items-center ml-2">
                      <span
                        className={`ml-1 text-sm ${
                          isPositive ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {percentageChange}%
                      </span>
                      {isPositive ? (
                        <ForwardIcon className="text-green-500 -rotate-90 w-5 h-5" />
                      ) : (
                        <ForwardIcon className="text-red-500 w-5 h-5 rotate-90" />
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ))}
      </div>
    );
  };

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
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Area Chart */}
            <AreaChart
              data={chartData}
              categories={["esewa", "khalti", "paypal"]} // Updated to match your data
              index="date" // Changed from _id to date
              colors={["blue", "amber", "fuchsia"]} // Adjusted colors for better distinction
              yAxisWidth={50}
              title="Payment Methods Statistics"
              xAxisLabel="Date"
              yAxisLabel="Number of Transactions"
              showLegend={true} // Added legend to identify payment methods
              // Smooth curve for better visualization
              valueFormatter={(value) => `${value}`} // Simple integer formatting
            />
          </motion.div>
          <ChangeDisplay change={percentageChange} />
        </>
      )}
    </>
  );
};

export default PaymentMethodsChart;

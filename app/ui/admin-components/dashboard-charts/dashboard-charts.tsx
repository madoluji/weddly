"use client";
import React, { useState } from "react";
import Card from "../../card";
import dynamic from "next/dynamic";
import Link from "next/link";

const AccountGrowthChart = dynamic(() => import("./user-count"), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-md bg-gray-100" />,
});

const KYCChart = dynamic(() => import("./kyc-count"), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-md bg-gray-100" />,
});

const JobsProposalChart = dynamic(() => import("./jobs-insights-chart"), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-md bg-gray-100" />,
});

const Charts = () => {
  const [querySelect, setQuerySelect] = useState<string>("monthly"); // Default to monthly
  const [chartSelected, setChartSelected] = useState<string>("Account-Growth");

  return (
    <div className="flex w-full">
      <Card className="flex flex-col gap-2 p-6 shadow-lg rounded-lg border border-primary-500 bg-white">
        {/* User Growth Chart */}
        <div className="flex justify-between items-center">
          <h1 className="px-8 font-medium text-primary-600 text-lg">
            User Analytics
          </h1>
          {/* Dropdown for Time Frame Selection */}
          <select
            value={querySelect}
            onChange={(e) => setQuerySelect(e.target.value)}
            className={`border border-gray-300 bg-gray-50 rounded-md px-8 py-1 shadow-sm text-gray-700 focus:ring focus:ring-blue-300`}
            name="querySelect"
          >
            <>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </>
          </select>
        </div>
        <div className="flex gap-5 px-8 py-5 ">
          <Link
            onClick={() => setChartSelected("Account-Growth")}
            href={""}
            className={`relative text-gray-700 font-medium transition-colors ${
              chartSelected === "Account-Growth"
                ? "before:absolute before:bottom-0 before:left-0 before:w-full before:h-[2px] before:bg-primary-500 before:rounded-full"
                : "text-gray-500"
            }`}
          >
            Account
          </Link>
          <Link
            onClick={() => setChartSelected("KYC-Growth")}
            href={""}
            className={`relative text-gray-700 font-medium transition-colors ${
              chartSelected === "KYC-Growth"
                ? "before:absolute before:bottom-0 before:left-0 before:w-full before:h-[2px] before:bg-primary-500 before:rounded-full"
                : "text-gray-500"
            }`}
          >
            KYC
          </Link>{" "}
          <Link
            onClick={() => setChartSelected("jobProposal")}
            href={""}
            className={`relative text-gray-700 font-medium transition-colors ${
              chartSelected === "jobProposal"
                ? "before:absolute before:bottom-0 before:left-0 before:w-full before:h-[2px] before:bg-primary-500 before:rounded-full"
                : "text-gray-500"
            }`}
          >
            Jobs & Proposals
          </Link>
        </div>

        {chartSelected === "Account-Growth" && (
          <AccountGrowthChart timeframe={querySelect} />
        )}
        {chartSelected === "KYC-Growth" && <KYCChart timeframe={querySelect} />}
        {chartSelected === "jobProposal" && (
          <JobsProposalChart timeframe={querySelect} />
        )}
      </Card>
    </div>
  );
};

export default Charts;

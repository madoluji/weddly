"use client";
import React, { useState } from "react";
import Card from "../../card";
import TurnOverChart from "./turn-overcharts";

const TurnOverCharts = () => {
  const [querySelect, setQuerySelect] = useState<string>("month"); // Default to month

  return (
    <div className="flex w-full">
      <Card className="flex flex-col gap-2 p-6 shadow-lg rounded-lg border border-primary-500 bg-white">
        {/* Chart Header */}
        <div className="flex justify-between items-center">
          <h1 className="px-8 font-medium text-primary-600 text-lg">
            Financial Analytics
          </h1>
          {/* Dropdown for Time Frame Selection */}
          <select
            value={querySelect}
            onChange={(e) => setQuerySelect(e.target.value)}
            className="border border-gray-300 bg-gray-50 rounded-md px-8 py-1 shadow-sm text-gray-700 focus:ring focus:ring-blue-300"
            name="querySelect"
          >
            <option value="day">Day</option>
            <option value="month">month</option>
            <option value="year">Year</option>
          </select>
        </div>

        {/* Render Selected Chart */}
        <TurnOverChart timeframe={querySelect} />
      </Card>
    </div>
  );
};

export default TurnOverCharts;

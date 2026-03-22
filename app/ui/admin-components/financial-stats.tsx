"use client";

import type React from "react";
import {
  CurrencyDollarIcon,
  TrophyIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

interface FinanceStats {
  topSpenders: {
    _id: string;
    totalSpent: number;
    client: { name: string; lastName: string };
  }[];
  topEarners: {
    _id: string;
    totalEarned: number;
    freelancer: { name: string; lastName: string };
  }[];
}

const FinancialHighlights: React.FC = () => {
  const [financeStats, setFinanceStats] = useState<FinanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString("en-IN")}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWithAuth("/api/admin/finance-stats?type=month");
        const data = await res.json();
        if (data.success) {
          setFinanceStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching finance stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
        {/* Top Spenders Card */}
        <div className="bg-white rounded-lg shadow-md border border-primary-500 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl text-primary-500 font-semibold">
                Top Spenders
              </h3>
              <div className="p-2 bg-green-100 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            ) : financeStats?.topSpenders.length ? (
              <>
                <div className="flex justify-between font-bold mt-5 items-center">
                  <p className="text-xl text-gray-700 truncate max-w-[180px]">
                    Name
                  </p>
                  <p className="text-xl text-gray-900">Amount</p>
                </div>
                {financeStats.topSpenders.map((spender) => (
                  <div
                    key={spender._id}
                    className="mb-2 font-medium flex justify-between items-center"
                  >
                    <p className="text-xl text-gray-700 truncate max-w-[180px]">
                      {spender.client.name + " " + spender.client.lastName}
                    </p>
                    <p className="text-xl text-gray-900">
                      {formatCurrency(spender.totalSpent)}
                    </p>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </div>

        {/* Top Earners Card */}
        <div className="bg-white rounded-lg shadow-md border border-primary-500 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-primary-500">
                Top Earners
              </h3>
              <div className="p-2 bg-yellow-100 rounded-full">
                <TrophyIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            ) : financeStats?.topEarners.length ? (
              <>
                <div className="flex justify-between font-bold mt-5 items-center">
                  <p className="text-xl text-gray-700 truncate max-w-[180px]">
                    Name
                  </p>
                  <p className="text-xl text-gray-900">Amount</p>
                </div>
                {financeStats.topEarners.map((earner) => (
                  <div
                    key={earner._id}
                    className="mb-2 font-medium flex justify-between items-center"
                  >
                    <p className="text-xl text-gray-700 truncate max-w-[180px]">
                      {earner.freelancer.name +
                        " " +
                        earner.freelancer.lastName}
                    </p>
                    <p className="text-xl text-gray-900">
                      {formatCurrency(earner.totalEarned)}
                    </p>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHighlights;

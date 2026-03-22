"use client";

import { CalendarIcon, TagIcon } from "@heroicons/react/24/outline";
interface ContractId {
  _id: string;
  status: string;
  paymentType: string;
  price: number;
  deadline: string;
}

interface ContractDetailsProps {
  contractDetails: ContractId | undefined;
  projectStatus?: "ongoing" | "completed" | "revisions" | "canceled";
}

export default function ContractDetails({
  contractDetails,
  projectStatus,
}: ContractDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Contract Details</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {projectStatus === "completed" && (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(contractDetails?.status || "N/A")}`}
            >
              {contractDetails?.status !== "completed"
                ? "Pending Payment"
                : contractDetails?.status === "completed"
                  ? "Completed"
                  : "Cancelled"}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <TagIcon className="h-5 w-5 mr-2 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Payment</p>
            <p className="font-medium">
              {formatCurrency(contractDetails?.price || 0)}
              <span className="text-gray-500">
                ({capitalizeFirstLetter(contractDetails?.paymentType || "N/A")})
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">Deadline</p>
            <p className="font-medium">
              {formatDate(contractDetails?.deadline || "N/A")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

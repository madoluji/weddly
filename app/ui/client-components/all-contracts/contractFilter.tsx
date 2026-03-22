"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ContractsFilter = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    contractType: searchParams.get("contractType") || "",
    status: searchParams.get("status") || "",
  });

  // Update URL when filter values change
  const updateURLParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    setFilters({
      search: searchParams.get("search") || "",
      contractType: searchParams.get("contractType") || "",
      status: searchParams.get("status") || "",
    });
  }, [searchParams]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const params = new URLSearchParams(searchParams);

      if (key === "status") {
        const currentStatuses = new Set(prev.status.split(",").filter(Boolean));
        currentStatuses.has(value)
          ? currentStatuses.delete(value)
          : currentStatuses.add(value);

        const statusValue = Array.from(currentStatuses).join(",");
        statusValue
          ? params.set("status", statusValue)
          : params.delete("status");
        return { ...prev, status: statusValue };
      } else if (key === "contractType") {
        const currentTypes = new Set(
          prev.contractType.split(",").filter(Boolean)
        );
        currentTypes.has(value)
          ? currentTypes.delete(value)
          : currentTypes.add(value);

        const typeValue = Array.from(currentTypes).join(",");
        typeValue
          ? params.set("contractType", typeValue)
          : params.delete("contractType");
        return { ...prev, contractType: typeValue };
      }
      return prev;
    });
  };

  const handleApplyFilters = () => {
    const queryString = Object.entries(filters)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    replace(`${pathname}${queryString ? `?${queryString}` : ""}`);
    setIsFilterOpen(false);
  };

  const handleRemoveFilter = (key: keyof typeof filters) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, [key]: "" };
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      replace(`${pathname}?${params.toString()}`);
      return updatedFilters;
    });
  };

  const handleClearAllFilters = () => {
    setFilters({
      search: "",
      contractType: "",
      status: "",
    });
    replace(pathname);
  };

  const hasActiveFilters = filters.status || filters.contractType;

  return (
    <div className="w-full space-y-4">
      {/* Header with Search and Filter Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto flex-1 max-w-md">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              id="search"
              type="text"
              value={filters.search}
              onChange={(e) => updateURLParams("search", e.target.value)}
              className="pl-10 w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search contracts..."
            />
            {filters.search && (
              <button
                onClick={() => updateURLParams("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md border ${isFilterOpen ? "bg-gray-100 border-gray-300" : "bg-white border-gray-300"} hover:bg-gray-50 transition-colors`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>{isFilterOpen ? "Hide Filters" : "Show Filters"}</span>
        </button>
      </div>

      {/* Filter Panel */}
      <div
        className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${
          isFilterOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-gray-50 rounded-lg p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleApplyFilters();
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Contract Type */}
            <fieldset>
              <legend className="font-medium text-sm mb-3">
                Contract Type
              </legend>
              <div className="space-y-3">
                {["fixed", "hourly", "milestone"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`type-${type}`}
                      checked={filters.contractType.split(",").includes(type)}
                      onChange={() => handleFilterChange("contractType", type)}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm font-medium text-gray-700 capitalize"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Contract Status */}
            <fieldset>
              <legend className="font-medium text-sm mb-3">
                Contract Status
              </legend>
              <div className="space-y-3">
                {["pending", "active", "completed", "canceled", "declined"].map(
                  (status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`status-${status}`}
                        checked={filters.status.split(",").includes(status)}
                        onChange={() => handleFilterChange("status", status)}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label
                        htmlFor={`status-${status}`}
                        className="text-sm font-medium text-gray-700 capitalize"
                      >
                        {status}
                      </label>
                    </div>
                  )
                )}
              </div>
            </fieldset>

            {/* Apply Filters Button */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                Clear All
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Applied Filters Section */}
      {hasActiveFilters && (
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Applied Filters:
            </h4>
            <button
              onClick={handleClearAllFilters}
              className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 hover:bg-gray-100 rounded"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.status
              .split(",")
              .filter(Boolean)
              .map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                >
                  Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                  <button
                    onClick={() => handleRemoveFilter("status")}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            {filters.contractType
              .split(",")
              .filter(Boolean)
              .map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                >
                  Type: {type.charAt(0).toUpperCase() + type.slice(1)}
                  <button
                    onClick={() => handleRemoveFilter("contractType")}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractsFilter;

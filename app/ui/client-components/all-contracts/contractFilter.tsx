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
    <div className="w-full space-y-5">
      {/* Header with Search and Filter Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto flex-1 max-w-md">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
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
              className="pl-10 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              placeholder="Search contracts..."
            />
            {filters.search && (
              <button
                onClick={() => updateURLParams("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            isFilterOpen
              ? "bg-primary-50 border-primary-200 text-primary-700"
              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
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
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleApplyFilters();
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Contract Type */}
            <fieldset>
              <legend className="font-label text-xs uppercase tracking-[0.18em] text-slate-400 mb-3">
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
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm font-medium text-slate-700 capitalize"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Contract Status */}
            <fieldset>
              <legend className="font-label text-xs uppercase tracking-[0.18em] text-slate-400 mb-3">
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
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label
                        htmlFor={`status-${status}`}
                        className="text-sm font-medium text-slate-700 capitalize"
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
                className="rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              >
                Clear All
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Applied Filters Section */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-700">
              Applied Filters:
            </h4>
            <button
              onClick={handleClearAllFilters}
              className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 hover:bg-slate-100 rounded"
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
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700 border border-primary-100"
                >
                  Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                  <button
                    onClick={() => handleRemoveFilter("status")}
                    className="ml-1 text-primary-500 hover:text-primary-700"
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
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700 border border-primary-100"
                >
                  Type: {type.charAt(0).toUpperCase() + type.slice(1)}
                  <button
                    onClick={() => handleRemoveFilter("contractType")}
                    className="ml-1 text-primary-500 hover:text-primary-700"
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

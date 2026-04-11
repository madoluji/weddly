"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

type AuditLog = {
  _id: string;
  actorAdminId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  status: "success" | "failed";
  errorMessage?: string;
  ipAddress?: string;
  createdAt: string;
};

const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actorEmailFilter, setActorEmailFilter] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

  const applyDatePreset = (days: number) => {
    const now = new Date();
    const from = new Date();
    from.setDate(now.getDate() - days);

    setFromDateFilter(toInputDate(from));
    setToDateFilter(toInputDate(now));
    setPage(1);
  };

  const clearDatePreset = () => {
    setFromDateFilter("");
    setToDateFilter("");
    setPage(1);
  };

  const compactValue = (value: string, max = 24) =>
    value.length > max ? `${value.slice(0, max - 1)}...` : value;

  const buildQueryParams = () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
      sortBy,
    });
    if (actionFilter.trim()) {
      params.set("action", actionFilter.trim());
    }
    if (statusFilter) {
      params.set("status", statusFilter);
    }
    if (actorEmailFilter.trim()) {
      params.set("actorEmail", actorEmailFilter.trim());
    }
    if (fromDateFilter) {
      params.set("from", fromDateFilter);
    }
    if (toDateFilter) {
      params.set("to", toDateFilter);
    }
    return params;
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = buildQueryParams();

        const response = await fetchWithAuth(
          `/api/admin/super-admin/audit-logs?${params.toString()}`
        );
        const payload = await response.json();

        if (!response.ok || !payload?.success) {
          setError(payload?.error || "Failed to load audit logs.");
          return;
        }

        setLogs(payload.data.logs || []);
        setPages(Math.max(1, payload.data.pagination?.pages || 1));
      } catch (err) {
        setError("Failed to load audit logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, actionFilter, statusFilter, actorEmailFilter, fromDateFilter, toDateFilter, sortBy]);

  const handleDownloadCsv = async () => {
    try {
      const params = buildQueryParams();
      params.delete("page");
      params.delete("limit");
      params.set("format", "csv");

      const response = await fetchWithAuth(
        `/api/admin/super-admin/audit-logs?${params.toString()}`
      );

      if (!response.ok) {
        setError("Failed to export CSV.");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-audit-logs-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export CSV.");
    }
  };

  const handleResetFilters = () => {
    setActionFilter("");
    setStatusFilter("");
    setActorEmailFilter("");
    setFromDateFilter("");
    setToDateFilter("");
    setSortBy("newest");
    setPage(1);
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
        <p className="text-gray-500 mt-1">Recent sensitive admin actions</p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4 bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Filter by action"
          className="border rounded px-3 py-2"
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="border rounded px-3 py-2"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <input
          type="text"
          placeholder="Filter by actor email"
          className="border rounded px-3 py-2"
          value={actorEmailFilter}
          onChange={(e) => {
            setActorEmailFilter(e.target.value);
            setPage(1);
          }}
        />
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={fromDateFilter}
          onChange={(e) => {
            setFromDateFilter(e.target.value);
            setPage(1);
          }}
        />
        <div className="flex gap-2">
          <input
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={toDateFilter}
            onChange={(e) => {
              setToDateFilter(e.target.value);
              setPage(1);
            }}
          />
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-2 rounded border bg-white whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 mr-1">Quick range:</span>
        <button
          type="button"
          className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 text-sm"
          onClick={() => applyDatePreset(1)}
        >
          Last 24h
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 text-sm"
          onClick={() => applyDatePreset(7)}
        >
          Last 7d
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 text-sm"
          onClick={() => applyDatePreset(30)}
        >
          Last 30d
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 text-sm"
          onClick={clearDatePreset}
        >
          Clear dates
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <select
          className="border rounded px-3 py-2 bg-white"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
        >
          <option value="newest">Sort: Newest first</option>
          <option value="oldest">Sort: Oldest first</option>
          <option value="action_asc">Sort: Action A-Z</option>
          <option value="action_desc">Sort: Action Z-A</option>
          <option value="status_asc">Sort: Status A-Z</option>
          <option value="status_desc">Sort: Status Z-A</option>
        </select>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="px-3 py-2 rounded border bg-white hover:bg-gray-50"
        >
          Download CSV
        </button>
      </div>

      {(actionFilter || statusFilter || actorEmailFilter || fromDateFilter || toDateFilter || sortBy !== "newest") && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Active filters:</div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">

          {actionFilter && (
            <button
              type="button"
              onClick={() => {
                setActionFilter("");
                setPage(1);
              }}
              className="inline-flex shrink-0 items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs"
              title={`Action: ${actionFilter}`}
            >
              Action: {compactValue(actionFilter)} x
            </button>
          )}

          {statusFilter && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("");
                setPage(1);
              }}
              className="inline-flex shrink-0 items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs"
            >
              Status: {statusFilter} x
            </button>
          )}

          {actorEmailFilter && (
            <button
              type="button"
              onClick={() => {
                setActorEmailFilter("");
                setPage(1);
              }}
              className="inline-flex shrink-0 items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs"
              title={`Actor: ${actorEmailFilter}`}
            >
              Actor: {compactValue(actorEmailFilter)} x
            </button>
          )}

          {fromDateFilter && (
            <button
              type="button"
              onClick={() => {
                setFromDateFilter("");
                setPage(1);
              }}
              className="inline-flex shrink-0 items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs"
            >
              From: {fromDateFilter} x
            </button>
          )}

          {toDateFilter && (
            <button
              type="button"
              onClick={() => {
                setToDateFilter("");
                setPage(1);
              }}
              className="inline-flex shrink-0 items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs"
            >
              To: {toDateFilter} x
            </button>
          )}

          {sortBy !== "newest" && (
            <button
              type="button"
              onClick={() => {
                setSortBy("newest");
                setPage(1);
              }}
              className="inline-flex shrink-0 items-center gap-1 px-2 py-1 rounded-full bg-slate-200 text-slate-700 text-xs"
            >
              Sort: {sortBy} x
            </button>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="shrink-0 text-xs text-gray-600 underline"
          >
            Clear all
          </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Actor</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Resource</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Error</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={6}>
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="border-t">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{log.actorEmail || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{log.actorRole || "-"}</div>
                  </td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3">
                    <div>{log.resourceType}</div>
                    <div className="text-xs text-gray-500">{log.resourceId || "-"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        log.status === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-red-600">{log.errorMessage || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          className="px-3 py-2 rounded border bg-white disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {pages}
        </span>
        <button
          className="px-3 py-2 rounded border bg-white disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page >= pages || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AuditLogsPage;
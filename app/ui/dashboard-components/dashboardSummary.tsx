"use client";

import useDashboardSummary from "@/app/hooks/useDashboardSummary";

type ReviewItem = {
  comment?: string;
  rating?: number;
  createdAt?: string;
};

type DashboardSummaryData = {
  roles: Record<string, unknown>;
  unreadNotifications: number;
  latestReviews: ReviewItem[];
};

const DashboardSummary = () => {
  const { data, loading, error } = useDashboardSummary();
  const reviews = Array.isArray(data?.latestReviews) ? (data.latestReviews as ReviewItem[]) : [];
  const roles = data?.roles ? Object.entries(data.roles) : [];

  if (loading) {
    return (
      <div className="rounded-3xl bg-white dark:bg-dark-surface p-6 shadow-sm">
        <p className="text-sm text-gray-500 dark:text-dark-on-surface-variant">Loading dashboard summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-white dark:bg-dark-surface p-6 shadow-sm">
        <p className="text-sm text-red-600">Unable to load dashboard summary.</p>
      </div>
    );
  }

  return (
    <div className="min-w-[260px] rounded-3xl bg-white dark:bg-dark-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-on-surface">Dashboard Summary</h2>
          <p className="text-sm text-slate-500 dark:text-dark-on-surface-variant">Quick access to your roles, notifications, and recent reviews.</p>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          {data?.unreadNotifications ?? 0} unread
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 dark:border-dark-outline-variant p-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-dark-on-surface">Your roles</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-dark-on-surface-variant">
            {roles.length > 0 ? (
              roles.map(([role, value]) => (
                <div key={role} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-dark-surface-container px-3 py-2">
                  <span className="font-medium text-slate-700 dark:text-dark-on-surface capitalize">{role}</span>
                  <span className="text-slate-500 dark:text-dark-on-surface-variant">{value ? "Yes" : "No"}</span>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-slate-50 dark:bg-dark-surface-container px-3 py-2 text-slate-500 dark:text-dark-on-surface-variant">No roles available</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-dark-outline-variant p-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-dark-on-surface">Recent reviews</h3>
          <div className="mt-3 space-y-3">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="rounded-xl bg-slate-50 dark:bg-dark-surface-container p-3 text-sm text-slate-700 dark:text-dark-on-surface-variant">
                  <p className="font-medium text-slate-800 dark:text-dark-on-surface">{String(review.comment ?? "No comment")}</p>
                  <div className="mt-1 flex items-center justify-between text-slate-500 dark:text-dark-on-surface-variant">
                    <span>Rating: {review.rating ?? "N/A"}</span>
                    <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-slate-50 dark:bg-dark-surface-container px-3 py-4 text-slate-500 dark:text-dark-on-surface-variant">No recent reviews yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;

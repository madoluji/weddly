import useFetch from "./useFetch";

type DashboardSummary = {
  roles: Record<string, unknown>;
  unreadNotifications: number;
  latestReviews: Array<Record<string, unknown>>;
};

const useDashboardSummary = (enabled = true) => {
  return useFetch<DashboardSummary>("/dashboard-summary", { enabled });
};

export type { DashboardSummary };
export default useDashboardSummary;

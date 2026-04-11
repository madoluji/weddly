export type SortBy = "newest" | "budget";

export interface FindJobFilters {
  search: string;
  location: string;
  category: string;
  minBudget: string;
  maxBudget: string;
  eventDate: string;
  sortBy: SortBy;
}

export interface FindJobInitialParams {
  search?: string;
  title?: string;
  location?: string;
  category?: string;
  minBudget?: string;
  maxBudget?: string;
  eventDate?: string;
  sortBy?: string;
}

export const defaultFindJobFilters: FindJobFilters = {
  search: "",
  location: "",
  category: "All Categories",
  minBudget: "",
  maxBudget: "",
  eventDate: "",
  sortBy: "newest",
};

const normalizeSortBy = (sortBy?: string): SortBy => {
  if (sortBy === "budget") {
    return "budget";
  }

  return "newest";
};

export const toInitialFindJobFilters = (
  params?: FindJobInitialParams
): FindJobFilters => ({
  search: (params?.search || params?.title || "").trim(),
  location: (params?.location || "").trim(),
  category: (params?.category || "All Categories").trim() || "All Categories",
  minBudget: (params?.minBudget || "").trim(),
  maxBudget: (params?.maxBudget || "").trim(),
  eventDate: (params?.eventDate || "").trim(),
  sortBy: normalizeSortBy(params?.sortBy),
});

export const buildFindJobQueryParams = (filters: FindJobFilters): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.search.trim().length > 0) {
    params.set("search", filters.search.trim());
  }

  if (filters.location.trim().length > 0) {
    params.set("location", filters.location.trim());
  }

  if (filters.category !== "All Categories") {
    params.set("category", filters.category);
  }

  if (filters.minBudget.trim().length > 0) {
    params.set("minBudget", filters.minBudget.trim());
  }

  if (filters.maxBudget.trim().length > 0) {
    params.set("maxBudget", filters.maxBudget.trim());
  }

  if (filters.eventDate) {
    params.set("eventDate", filters.eventDate);
  }

  if (filters.sortBy !== "newest") {
    params.set("sortBy", filters.sortBy);
  }

  return params;
};

export const getApplyAction = (options: {
  jobStatus: string;
  hasApplied?: boolean;
  jobId: string;
}) => {
  if (options.hasApplied) {
    return {
      label: "Applied",
      href: `/user/proposal/${options.jobId}`,
      disabled: true,
    };
  }

  if (options.jobStatus !== "active") {
    return {
      label: "Unavailable",
      href: "",
      disabled: true,
    };
  }

  return {
    label: "Apply",
    href: `/user/proposal/${options.jobId}`,
    disabled: false,
  };
};

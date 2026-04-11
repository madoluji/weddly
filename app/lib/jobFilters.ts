type FilterableJob = {
  title?: string;
  description?: string;
  fullName?: string;
  type?: string;
  location?: string;
  tags?: unknown[];
  budget?: unknown;
  eventDate?: unknown;
  createdAt?: string | Date;
};

export interface JobFilterOptions {
  search?: string | null;
  location?: string | null;
  category?: string | null;
  minBudget: number | null;
  maxBudget: number | null;
  eventDate?: string | null;
  sortBy?: string | null;
}

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export const parseBudgetRange = (budget: unknown): [number, number] | null => {
  if (typeof budget !== "string" && typeof budget !== "number") {
    return null;
  }

  const raw = `${budget}`;
  const matches = raw.match(/\d+(?:\.\d+)?/g);

  if (!matches || matches.length === 0) {
    return null;
  }

  const values = matches.map((value) => Number(value)).filter(Number.isFinite);

  if (values.length === 0) {
    return null;
  }

  if (values.length === 1) {
    return [values[0], values[0]];
  }

  return [Math.min(...values), Math.max(...values)];
};

export const getDateKey = (value: unknown) => {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

export const applyServerFilters = <T extends FilterableJob>(
  jobs: T[],
  options: JobFilterOptions
): T[] => {
  let filtered = [...jobs];

  const trimmedSearch = options.search?.trim().toLowerCase();
  if (trimmedSearch) {
    filtered = filtered.filter((job) => {
      const searchableFields = [
        job.title,
        job.description,
        job.fullName,
        job.type,
        job.location,
      ]
        .filter((field) => typeof field === "string")
        .map((field) => (field as string).toLowerCase());

      const hasTextMatch = searchableFields.some((field) =>
        field.includes(trimmedSearch)
      );

      const hasTagMatch =
        Array.isArray(job.tags) &&
        job.tags.some(
          (tag) => typeof tag === "string" && tag.toLowerCase().includes(trimmedSearch)
        );

      return hasTextMatch || hasTagMatch;
    });
  }

  const trimmedLocation = options.location?.trim().toLowerCase();
  if (trimmedLocation) {
    filtered = filtered.filter(
      (job) =>
        typeof job.location === "string" &&
        job.location.toLowerCase().includes(trimmedLocation)
    );
  }

  const trimmedCategory = options.category?.trim();
  if (trimmedCategory && trimmedCategory !== "All Categories") {
    filtered = filtered.filter((job) => job.type === trimmedCategory);
  }

  if (options.eventDate) {
    filtered = filtered.filter((job) => getDateKey(job.eventDate) === options.eventDate);
  }

  if (options.minBudget !== null || options.maxBudget !== null) {
    filtered = filtered.filter((job) => {
      const range = parseBudgetRange(job.budget);
      // Jobs with unparsable budgets are excluded when range filters are active.
      if (!range) {
        return false;
      }

      const [minValue, maxValue] = range;

      if (options.minBudget !== null && maxValue < options.minBudget) {
        return false;
      }

      if (options.maxBudget !== null && minValue > options.maxBudget) {
        return false;
      }

      return true;
    });
  }

  filtered.sort((a, b) => {
    if (options.sortBy === "budget") {
      const aMax = parseBudgetRange(a.budget)?.[1] ?? 0;
      const bMax = parseBudgetRange(b.budget)?.[1] ?? 0;
      return bMax - aMax;
    }

    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bDate - aDate;
  });

  return filtered;
};

export const paginateItems = <T>(
  items: T[],
  page: number,
  limit: number
): PaginationResult<T> => {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;

  const total = items.length;
  const pages = total === 0 ? 0 : Math.ceil(total / safeLimit);
  const start = (safePage - 1) * safeLimit;
  const paginated = items.slice(start, start + safeLimit);

  return {
    items: paginated,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages,
      hasMore: safePage < pages,
    },
  };
};

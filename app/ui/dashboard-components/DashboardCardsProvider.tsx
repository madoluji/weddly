"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";

export type DashboardCardsData = {
  profile: {
    name: string;
    lastName: string;
    profilePicture: string | null;
  };
  counts: {
    activeCount: number;
    completeCount: number;
  };
  finances: {
    totalFreelancerAmount: number;
    totalClientAmount: number;
    totalSpent: number;
    pendingBalance: number;
  };
  ratings: {
    client: number;
    freelancer: number;
  };
  recentReviews: Array<{
    reviewerId: {
      name: string;
      lastName: string;
      profilePicture?: string;
    };
    comment: string;
    rating: number;
    createdAt?: string;
  }>;
};

type DashboardCardsContextValue = {
  data: DashboardCardsData | null;
  loading: boolean;
  error: string | null;
};

const DashboardCardsContext = createContext<DashboardCardsContextValue | null>(
  null
);

export const DashboardCardsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { session, status } = useAuth();
  const [data, setData] = useState<DashboardCardsData | null>(null);
  const [loading, setLoading] = useState(status === "authenticated");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (status !== "authenticated" || !session?.user?.id) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchDashboardCards = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchWithAuth("/api/dashboard-cards");
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard cards (${response.status})`);
        }

        const payload = (await response.json()) as DashboardCardsData;
        if (!mounted) {
          return;
        }

        setData(payload);
      } catch (fetchError) {
        if (!mounted) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load dashboard cards.";
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchDashboardCards();

    return () => {
      mounted = false;
    };
  }, [session?.user?.id, status]);

  const value = useMemo(
    () => ({
      data,
      loading,
      error,
    }),
    [data, loading, error]
  );

  return (
    <DashboardCardsContext.Provider value={value}>
      {children}
    </DashboardCardsContext.Provider>
  );
};

export const useDashboardCards = () => {
  const context = useContext(DashboardCardsContext);

  if (!context) {
    throw new Error(
      "useDashboardCards must be used within DashboardCardsProvider"
    );
  }

  return context;
};

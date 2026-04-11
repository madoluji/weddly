"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { useAuth } from "@/app/providers";

type UserRoles = {
  client?: boolean;
  freelancer?: boolean;
  venue?: boolean;
};

type UserAccessData = {
  roles: UserRoles | null;
  isFirstLogin?: boolean;
};

type UserAccessContextValue = {
  data: UserAccessData | null;
  loading: boolean;
};

const UserAccessContext = createContext<UserAccessContextValue | null>(null);
const USER_ACCESS_TTL_MS = 60 * 1000;

let cachedUserAccess:
  | {
      userId: string;
      value: UserAccessData;
      expiresAt: number;
    }
  | null = null;

export const UserAccessProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { session, status } = useAuth();
  const pathname = usePathname();
  const [data, setData] = useState<UserAccessData | null>(null);
  const [loading, setLoading] = useState(status === "authenticated");
  const shouldSkipUserAccess =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (shouldSkipUserAccess) {
      setData(null);
      setLoading(false);
      return;
    }

    if (status !== "authenticated" || !session?.user?.id) {
      setData(null);
      setLoading(false);
      return;
    }

    if (
      cachedUserAccess &&
      cachedUserAccess.userId === session.user.id &&
      cachedUserAccess.expiresAt > Date.now()
    ) {
      setData(cachedUserAccess.value);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchUserAccess = async () => {
      setLoading(true);

      try {
        const response = await fetchWithAuth("/api/user?fields=roles,isFirstLogin");
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          roles?: UserRoles;
          isFirstLogin?: boolean;
        };

        if (!mounted) {
          return;
        }

        const nextData = {
          roles: payload.roles ?? null,
          isFirstLogin: payload.isFirstLogin,
        };

        cachedUserAccess = {
          userId: session.user.id,
          value: nextData,
          expiresAt: Date.now() + USER_ACCESS_TTL_MS,
        };

        setData(nextData);
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch user access data:", error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchUserAccess();

    return () => {
      mounted = false;
    };
  }, [pathname, session?.user?.id, shouldSkipUserAccess, status]);

  const value = useMemo(
    () => ({
      data,
      loading,
    }),
    [data, loading]
  );

  return (
    <UserAccessContext.Provider value={value}>
      {children}
    </UserAccessContext.Provider>
  );
};

export const useUserAccess = () => {
  const context = useContext(UserAccessContext);

  if (!context) {
    throw new Error("useUserAccess must be used within UserAccessProvider");
  }

  return context;
};

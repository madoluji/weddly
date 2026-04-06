"use client";

import { type ReactNode, createContext, useContext, useEffect, useMemo } from "react";
import { useLayoutEffect } from "react";
import type { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";
type SessionUpdate = ReturnType<typeof useSession>["update"];

interface AuthContextType {
  session: Session | null;
  status: AuthStatus;
  update: SessionUpdate;
}

const AuthContext = createContext<AuthContextType | null>(null);

let sessionSnapshot: Session | null = null;

export const getAuthSessionSnapshot = () => sessionSnapshot;

const AuthBridge = ({ children }: { children: ReactNode }) => {
  const { data: session, status, update } = useSession();

  useLayoutEffect(() => {
    sessionSnapshot = session ?? null;
  }, [session]);

  useEffect(() => {
    return () => {
      sessionSnapshot = null;
    };
  }, []);

  const value = useMemo(
    () => ({
      session: session ?? null,
      status,
      update,
    }),
    [session, status, update]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const AuthProvider = ({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) => {
  return (
    <SessionProvider
      session={session}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <AuthBridge>{children}</AuthBridge>
    </SessionProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export default AuthProvider;

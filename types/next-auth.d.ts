import NextAuth from "next-auth";

import { NextRequest } from "next/server";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      name: string;
      lastName: string;
      email: string;
      id: string;
      role?: string;
      profilePicture?: string;
      accessToken?: string;
      roles?: {
        client?: boolean;
        freelancer?: boolean;
        venue?: boolean;
      };
    };
  }
}

// Extend the NextRequest type
declare global {
  namespace NodeJS {
    interface Global {
      user: any;
    }
  }
}

declare module "next/server" {
  interface NextRequest {
    user?: any; // Add `user` property to NextRequest
  }
}

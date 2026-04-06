"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-lg w-full rounded-3xl bg-white p-10 shadow-lg shadow-slate-200/70 text-center">
        <h1 className="text-4xl font-bold text-slate-900">Unauthorized</h1>
        <p className="mt-4 text-slate-600">
          You do not have permission to access this page.
          If you believe this is a mistake, please sign in with the correct account.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
          >
            Go to Home
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Sign In
          </button>
        </div>
      </div>
    </main>
  );
}

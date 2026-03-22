"use client";

import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "../button";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import clsx from "clsx";

const SignupForm = () => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
    setIsSubmitting(true);

    if (!name || !lastName || !email || !password) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          lastName,
          password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || "Registration failed");
        setIsSubmitting(false);
        return;
      }

      const { userId } = await res.json(); // ✅ Extract `userId` from API response
      console.log("✅ Retrieved User ID:", userId);

      // Sign in the user after registration
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (response?.error) {
        setError(response.error);
        setIsSubmitting(false);
        return;
      }

      // ✅ Redirect user to profile upload page with `userId`
      router.push(`/signup/profile-upload`);
      console.log("✅ Registration & Login Successful, Redirecting...");
    } catch (error) {
      console.error("Error during registration:", error);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label className="text-[15px] font-medium text-slate-700" htmlFor="email">
          Email Address
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-xl border border-slate-200 bg-[#f1f4f8] py-3.5 pl-11 pr-4 text-[15px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
            id="email"
            type="email"
            name="email"
            placeholder="name@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        <label className="text-[15px] font-medium text-slate-700" htmlFor="firstname">
          First Name
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-xl border border-slate-200 bg-[#f1f4f8] py-3.5 pl-11 pr-4 text-[15px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
            id="firstname"
            type="text"
            name="firstname"
            placeholder="Jane"
            onChange={(e) => setName(e.target.value)}
          />
          <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        <label className="text-[15px] font-medium text-slate-700" htmlFor="lastname">
          Last Name
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-xl border border-slate-200 bg-[#f1f4f8] py-3.5 pl-11 pr-4 text-[15px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
            id="lastname"
            type="text"
            name="lastname"
            placeholder="Doe"
            onChange={(e) => setLastName(e.target.value)}
          />
          <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        <label className="text-[15px] font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-xl border border-slate-200 bg-[#f1f4f8] py-3.5 pl-11 pr-4 text-[15px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />
          <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="mt-5 space-y-1.5">
        <label
          className="text-[15px] font-medium text-slate-700"
          htmlFor="passwordConfirm"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            className="peer block w-full rounded-xl border border-slate-200 bg-[#f1f4f8] py-3.5 pl-11 pr-4 text-[15px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300"
            id="passwordConfirm"
            type="password"
            name="passwordConfirm"
            placeholder="••••••••"
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
          <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <Button
        type="submit"
        className={clsx("mt-6 w-full rounded-xl py-3.5 text-[15px] text-white shadow-sm", {
          "bg-[#2f5f4a] text-slate-400 cursor-not-allowed border-none":
            isSubmitting == true,
        })}
        disabled={isSubmitting}
      >
        {isSubmitting ? "please wait..." : "Sign up"}
      </Button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-[15px]">
          <span className="bg-white px-3 text-slate-500">Or sign up with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => signIn("google")}
          className="w-full justify-center rounded-xl border border-slate-300 bg-white p-3 text-center font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign in with Google
        </button>
        <button
          onClick={() => signIn("github")}
          className="w-full justify-center rounded-xl border border-slate-300 bg-white p-3 text-center font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign in with Github
        </button>
      </div>
      {error && (
        <div className="my-5 rounded-xl bg-red-500 p-4">
          <p className="text-sm text-white">{error}</p>
        </div>
      )}
    </form>
  );
};

export default SignupForm;

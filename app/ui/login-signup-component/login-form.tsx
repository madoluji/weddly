"use client";

import {
  AtSymbolIcon,
  KeyIcon,
  GlobeAltIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (email === "" || password === "") {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid Credentials");
        setIsSubmitting(false);
        return;
      }

      router.push("/");
    } catch (err) {
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 ml-1">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <AtSymbolIcon className="h-5 w-5 text-slate-400 group-focus-within:text-success-500 transition-colors" />
          </div>
          <input
            type="email"
            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-success-500/20 focus:border-success-500 transition-all"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <button
            type="button"
            className="text-sm font-medium text-success-500 hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <KeyIcon className="h-5 w-5 text-slate-400 group-focus-within:text-success-500 transition-colors" />
          </div>
          <input
            type="password"
            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-success-500/20 focus:border-success-500 transition-all"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 py-1 ml-1">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="size-4 rounded border-slate-300 text-success-500 focus:ring-success-500"
        />
        <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
          Remember me for 30 days
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className={clsx(
          "w-full py-3.5 px-4 bg-success-500 hover:bg-success-600 text-white font-semibold rounded-xl shadow-lg shadow-success-500/20 transform active:scale-[0.98] transition-all duration-200",
          {
            "bg-slate-300 hover:bg-slate-300 shadow-none cursor-not-allowed":
              isSubmitting,
          }
        )}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing In..." : "Sign In"}
      </button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-slate-500 font-medium">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <GlobeAltIcon className="h-5 w-5 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">Google</span>
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin("github")}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <CommandLineIcon className="h-5 w-5 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">GitHub</span>
        </button>
      </div>
    </form>
  );
};

export default LoginForm;

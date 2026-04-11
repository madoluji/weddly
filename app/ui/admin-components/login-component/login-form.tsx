"use client";

import { AtSymbolIcon, KeyIcon } from "@heroicons/react/24/outline";
import { Button } from "../../button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const LoginForm = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (userName === "" || password === "") {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signIn("credentials", {
        email: userName,
        password,
        redirect: false, // Prevents automatic redirection
      });

      if (res?.error) {
        setError(
          res.error || "We couldn’t sign you in. Please check your username and password and try again."
        );
        setIsSubmitting(false);
        return;
      }

      router.replace("/admin");
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <AtSymbolIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="userName"
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
          placeholder="UserName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
      <div className="relative">
        <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="password"
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button
        type="submit"
        className={clsx("w-full text-white", {
          "bg-slate-100  border-2 border-primary-600 cursor-not-allowed":
            isSubmitting == true,
        })}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in..." : "Log In"}
      </Button>
    </form>
  );
};

export default LoginForm;

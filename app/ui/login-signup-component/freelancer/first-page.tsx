"use client";

import {
  BanknotesIcon,
  DocumentCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/app/providers";
import { Button } from "../../button";

// import { useRouter } from "next/router";
import { useRouter } from "next/navigation";
import TypingAnimation from "../../typingAnimation";
import { useEffect } from "react";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

const WelcomeText = () => {
  const router = useRouter();
  const { session, status } = useAuth();
  const userName = session?.user.name;

  const id = session?.user.id;

  useEffect(() => {
    if (status !== "authenticated") return;

    fetchWithAuth("/api/user?fields=roles") // ✅ Fetch only roles from API
      .then((res) => res.json())
      .then((data) => {
        if (data.roles.freelancer) router.push(`/`);
      })
      .catch((err) => console.error("Error fetching roles:", err));
  }, [status, session, router]);

  return (
    <div className="flex flex-col items-center top-2/3 justify-center h-screen">
      <div className="text-4xl">
        Hey <span>{userName}. </span>
        {/* <TextTyper text=" Are you ready for your next big" />{" "}
         */}
        Are you ready for your next big
        <TypingAnimation
          text=" Endeavour?"
          startDelay={0}
          className="text-primary-600"
          interval={134}
        />
      </div>
      <div className="text-2xl mt-10">
        Let&apos;s get started by filling out some basic information.
      </div>
      <div className="text-xl mt-10 flex  ">
        <UserIcon className="h-7 w-7 p-1 text-primary-600 " /> Answer few
        questions and start building your profile. {"  "}|{" "}
        <DocumentCheckIcon className="h-7 w-7 p-1 text-primary-600" /> Apply for
        wedding gigs or list services for venues & vendors to book |{" "}
        <BanknotesIcon className="h-7 w-7 p-1 text-primary-600" /> Get paid for
        your work.
      </div>

      <Button
        className="mt-10 text-white p-5 "
        onClick={() => {
          router.push(`/signup/freelancer/${id}`);
        }}
      >
        Get Started
      </Button>
    </div>
  );
};

export default WelcomeText;

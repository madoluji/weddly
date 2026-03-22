"use client";

import Image from "next/image";
import React from "react";
import { useAuth } from "@/app/providers";
import SkeletonProfileCard from "./skeletons/skeletonProfileCard";

interface Props {
  mode: string;
}

const ProfileCard = ({ mode }: Props) => {
  // Use the useSession hook to get session data and status
  const { session, status } = useAuth();
  // const { data: user } = useFetch<User>(`user/${session?.user.id}`);

  // If the session status is loading, return a skeleton component
  if (status === "loading") {
    return <SkeletonProfileCard />;
  }

  // Render the profile card with user data
  return (
    <div className="flex min-w-[280px] w-[15%] flex-col relative rounded-3xl h-[250px] overflow-hidden shadow-[0_10px_20px_rgba(228,228,228,_0.7)]">
      {/* Cover image section */}
      <div className="h-[40%] bg-gray-500 overflow-hidden"></div>

      {/* Profile image section */}
      <div className="bg-400 rounded-full bg-white absolute translate-y-[50%] overflow-hidden translate-x-1/2 right-[50%] h-24 w-24">
        <Image
          src={session?.user?.profilePicture || "/images/image.png"}
          alt="profile"
          width={150}
          height={150}
          className=""
        />
      </div>

      {/* User information section */}
      <div className="px-3 items-center justify-center h-2/3 flex flex-col">
        <div className="text-center pt-10">
          {/* Display user's name and last name */}
          <h2 className="text-3xl font-medium">
            {session?.user?.name} {session?.user?.lastName}
          </h2>
          {/* Display mode */}
          <p className="text-base text-gray-400">{mode}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;

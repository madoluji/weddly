"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import SkeletonProfileCard from "./skeletons/skeletonProfileCard";
import SafeImage from "@/app/ui/shared/SafeImage";
import { useDashboardCards } from "./DashboardCardsProvider";

interface Props {
  mode: string;
}

const ProfileCard = ({ mode }: Props) => {
  // Use the useSession hook to get session data and status
  const { session, status } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [displayPicture, setDisplayPicture] = useState("");
  const { data, loading } = useDashboardCards();

  useEffect(() => {
    const fallbackName = `${session?.user?.name || ""} ${session?.user?.lastName || ""}`.trim();
    if (fallbackName) setDisplayName(fallbackName);
    if (session?.user?.profilePicture) setDisplayPicture(session.user.profilePicture);

    if (data?.profile) {
      const nextName = `${data.profile.name || ""} ${data.profile.lastName || ""}`.trim();
      if (nextName) setDisplayName(nextName);
      if (data.profile.profilePicture) setDisplayPicture(data.profile.profilePicture);
    }
  }, [
    data?.profile,
    session?.user?.id,
    session?.user?.lastName,
    session?.user?.name,
    session?.user?.profilePicture,
  ]);
  // const { data: user } = useFetch<User>(`user/${session?.user.id}`);

  // If the session status is loading, return a skeleton component
  if (status === "loading" || loading) {
    return <SkeletonProfileCard />;
  }

  // Render the profile card with user data
  return (
    <div className="relative flex h-[250px] w-full flex-col overflow-hidden rounded-3xl border border-primary-100/70 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      {/* Cover image section */}
      <div className="h-[40%] overflow-hidden bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600" />

      {/* Profile image section */}
      <div className="absolute left-1/2 h-20 w-20 -translate-x-1/2 translate-y-[50%] overflow-hidden rounded-full border-4 border-white bg-white shadow-sm">
        <SafeImage
          src={displayPicture || session?.user?.profilePicture || "/images/image.png"}
          alt="profile"
          width={80}
          height={80}
          loading="eager"
          className="object-cover w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* User information section */}
      <div className="flex h-2/3 flex-col items-center justify-center px-4">
        <div className="text-center pt-10">
          {/* Display user's name and last name */}
          <h2 className="font-headline text-2xl font-medium leading-none text-slate-900 xl:text-[1.65rem]">
            {displayName || `${session?.user?.name || ""}${session?.user?.lastName ? ` ${session.user.lastName}` : ""}`}
          </h2>
          {/* Display mode */}
          <p className="mt-2 text-base font-medium text-slate-500">{mode}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;

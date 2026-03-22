"use client";

import React, { Suspense } from "react";
import DisplayProfile from "@/app/ui/user-component/displayprofile";

const UserProfile: React.FC = () => {
  return (
    <div>
      <h1 className="font-black text-center text-5xl">User Profile</h1>
      <Suspense fallback={<div>Loading...</div>}>
      <DisplayProfile />
      </Suspense>
    </div>
  );
};

export default UserProfile;

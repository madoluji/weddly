"use client";

import React, { Suspense } from "react";
import DisplayProfile from "@/app/ui/user-component/displayprofile";
import PageShell from "@/app/ui/layout/PageShell";

const UserProfile: React.FC = () => {
  return (
    <PageShell
      title="User Profile"
      description="Review and update your personal account information"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <DisplayProfile />
      </Suspense>
    </PageShell>
  );
};

export default UserProfile;

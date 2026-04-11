"use client";

import React, { Suspense } from "react";
import DisplayProfile from "@/app/ui/user-component/displayprofile";
import PageShell from "@/app/ui/layout/PageShell";

const FreelancerProfileForClient: React.FC = () => {
  return (
    <PageShell
      title="Freelancer Profile"
      description="Review freelancer profile details before hiring"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <DisplayProfile />
      </Suspense>
    </PageShell>
  );
};

export default FreelancerProfileForClient;

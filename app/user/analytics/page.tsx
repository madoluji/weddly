import { FreelancerAnalytics } from "@/app/ui/analytics";
import React from "react";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

const Analytics = () => {
  return (
    <PageShell
      title="Analytics"
      description="Track project completion trends and earnings performance over time"
    >
      <PageCard>
        <FreelancerAnalytics />
      </PageCard>
    </PageShell>
  );
};

export default Analytics;

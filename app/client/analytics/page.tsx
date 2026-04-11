import { ClientAnalytics } from "@/app/ui/analytics";
import React from "react";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

const Analytics = () => {
  return (
    <PageShell
      title="Analytics"
      description="Monitor job posting trends and spending insights over time"
    >
      <PageCard>
        <ClientAnalytics />
      </PageCard>
    </PageShell>
  );
};

export default Analytics;

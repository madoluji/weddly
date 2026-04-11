import DetailsForm from "@/app/ui/post-job/DetailsForm";
import React from "react";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

const JobDetails = () => {
  return (
    <PageShell
      title="Job Details"
      description="Complete your listing details before publishing your job"
    >
      <PageCard>
        <DetailsForm />
      </PageCard>
    </PageShell>
  );
};

export default JobDetails;

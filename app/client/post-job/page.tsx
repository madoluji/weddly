import WelcomeText from "@/app/ui/post-job/WelcomeText";
import React from "react";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

const PostJob = () => {
  return (
    <PageShell
      title="Post a Job"
      description="Create a detailed job listing to attract the right freelancers"
    >
      <PageCard>
        <WelcomeText />
      </PageCard>
    </PageShell>
  );
};

export default PostJob;

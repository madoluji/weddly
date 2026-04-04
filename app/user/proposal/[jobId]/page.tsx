import ProposalForm from "@/app/ui/proposal/proposal-form";

import React from "react";

const page = async ({ params }: { params: Promise<{ jobId: string }> }) => {
  const { jobId } = await params;
  return (
    <div className="mx-auto flex w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <ProposalForm jobId={jobId} />
    </div>
  );
};

export default page;

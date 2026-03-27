import ProposalForm from "@/app/ui/proposal/proposal-form";

import React from "react";

const page = async ({ params }: { params: Promise<{ jobId: string }> }) => {
  const { jobId } = await params;
  return (
    <div className="flex max-w-screen-xl w-full py-14 mx-auto">
      <ProposalForm jobId={jobId} />
    </div>
  );
};

export default page;

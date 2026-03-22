import ProposalForm from "@/app/ui/proposal/proposal-form";

import React from "react";

const page = ({ params }: { params: { jobId: string } }) => {
  const { jobId } = params;
  return (
    <div className="flex max-w-screen-xl w-full py-14 mx-auto">
      <ProposalForm jobId={jobId} />
    </div>
  );
};

export default page;

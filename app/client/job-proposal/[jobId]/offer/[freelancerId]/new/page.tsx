import OfferForm from "@/app/ui/offer-form/offer-form";

import React from "react";

const page = ({
  params,
}: {
  params: { jobId: string; freelancerId: string };
}) => {
  const { jobId, freelancerId } = params;
  return (
    <div className="flex max-w-screen-xl w-full py-14 mx-auto">
      <OfferForm jobId={jobId} freelancerId={freelancerId} />
    </div>
  );
};

export default page;

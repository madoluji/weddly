import React, { Suspense } from "react";
import ContractList from "./contractList";
// import ProposalList from "./proposalList";

const page = () => {
  return (
    <div className="max-w-screen-xl mx-auto mt-20">
      <h1 className="text-4xl font-medium mb-10">My contracts</h1>
      <Suspense>
        <ContractList />
      </Suspense>
    </div>
  );
};

export default page;

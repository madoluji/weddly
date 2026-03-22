import React from "react";
import ProposalList from "./proposalList";

const page = () => {
  return (
    <div className="max-w-screen-xl mx-auto mt-20">
      <h1 className="text-4xl font-medium mb-10">My proposals</h1>
      <ProposalList />
    </div>
  );
};

export default page;

import React from "react";

const FinanceSkeletonCard = () => {
  return (
    <div
      className="flex min-w-[250px] animate-pulse flex-col  
    justify-end items-center relative rounded-3xl h-[250px]  px-6 py-12 overflow-hidden shadow-[0_10px_20px_rgba(228,228,228,_0.7)]"
    >
      <div className="w-full flex gap-3 flex-col ">
        <div className="bg-slate-200 m-auto mb-5 h-6 w-[80%] relative rounded-3xl p-1 pl-10" />
        <div className="bg-slate-200 h-3 w-16 relative rounded-3xl p-1 pl-10" />
        <div className="bg-slate-200 m-auto h-6 w-5/6 relative rounded-3xl p-1 pl-10" />

        <div className="bg-slate-200 h-3 w-16 relative rounded-3xl p-1 pl-10" />
        <div className="bg-slate-200 m-auto h-6 w-5/6 relative rounded-3xl p-1 pl-10" />
      </div>
    </div>
  );
};

export default FinanceSkeletonCard;

import React from "react";

const OrderSkeletonCard = () => {
  return (
    <div className="flex min-w-[250px] animate-pulse flex-col  justify-end items-center relative rounded-3xl h-[250px] pb-16 px-8 overflow-hidden shadow-[0_10px_20px_rgba(228,228,228,_0.7)]">
      <div className="bg-slate-200 h-8 w-1/2 mb-5 relative rounded-3xl p-1 pl-10"></div>
      <div className="w-full flex gap-3 flex-col ">
        <div className="bg-slate-200 h-6 relative rounded-3xl p-1 pl-10"></div>
        <div className="bg-slate-200 h-6 relative rounded-3xl p-1 pl-10"></div>
      </div>
    </div>
  );
};

export default OrderSkeletonCard;

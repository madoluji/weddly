import React from "react";

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

const CardSkeleton = () => {
  return (
    <div className="flex animate-pulse min-w-[280px] flex-col relative rounded-3xl h-[200px] overflow-hidden shadow-[0_10px_20px_rgba(228,228,228,_0.7)] p-4 bg-white">
      {/* Title Section */}
      <div className="h-6 w-3/4 bg-slate-200 rounded mb-5"></div>

      {/* Content Section */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="h-5 w-full bg-slate-200 rounded"></div>

        <div className="h-5 w-[80%] bg-slate-200 rounded"></div>
      </div>

      {/* Footer Section */}
      <div className="flex justify-between items-center mt-auto">
        <div className="h-5 w-1/3 bg-slate-200 rounded-md"></div>
        <div className="h-8 w-1/3 bg-slate-200 rounded-md"></div>
      </div>
    </div>
  );
};

export default CardSkeleton;

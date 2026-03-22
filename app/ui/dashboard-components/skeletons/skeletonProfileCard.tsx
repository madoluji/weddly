import React from "react";
const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

const SkeletonProfileCard = () => {
  return (
    <>
      <div className="flex animate-pulse  min-w-[280px] flex-col relative rounded-3xl h-[250px] overflow-hidden shadow-[0_10px_20px_rgba(228,228,228,_0.7)] ">
        <div className=" h-[40%] bg-slate-300 overflow-hidden"></div>
        <div
          className="bg-gray-200  rounded-full
              absolute translate-y-[50%]  translate-x-1/2 right-[50%]
           h-24 w-24"
        />
        <div className=" px-3 gap-3 font-semibold items-center justify-center h-2/3  flex flex-col">
          {/* <Image src="/" alt="profile" className="rounded-full" width={150} height={150} /> */}

          <div className="h-5 w-[60%] bg-slate-200 rounded col-span-2"></div>
          <div className="h-3 w-20 bg-slate-200 rounded col-span-1"></div>
        </div>
      </div>
    </>
  );
};

export default SkeletonProfileCard;

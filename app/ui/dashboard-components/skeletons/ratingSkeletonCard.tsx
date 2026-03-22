const RatingSkeletonCard = () => {
  return (
    <div
      className=" min-w-[250px] animate-pulse flex flex-col gap-5 justify-end items-center relative rounded-3xl
     h-[250px] pb-14 px-8 overflow-hidden shadow-[0_10px_20px_rgba(228,228,228,_0.7)]"
    >
      <div className="w-full flex gap-8 flex-col ">
        <div className="bg-slate-200 h-16 w-16 m-auto relative rounded-xl p-1 pl-10" />
        <div className="bg-slate-200 h-6 relative rounded-3xl p-1 pl-10" />
      </div>
    </div>
  );
};

export default RatingSkeletonCard;

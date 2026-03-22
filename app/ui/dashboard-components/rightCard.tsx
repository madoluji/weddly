import { ClockIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import React from "react";
import ProfileCard from "./profileCard";

const RightCard = () => {
  return (
    <div className=" sticky top-[75px] w-full ">
      <div className="flex  flex-col items-center align-middle">
        
        <h1 className="text-3xl font-semibold my-5"> Orders</h1>
        <div className="w-full flex gap-2  flex-col ">
          <div className="bg-primary-400 text-primary-700 relative rounded-3xl p-1 pl-10">
            <p>2 Pending</p>
            <ClockIcon className="h-5 w-5 absolute   -translate-y-[50%] left-3 top-1/2 " />
          </div>
          <div className="bg-sucess-400 text-sucess-600 relative rounded-3xl p-1 pl-10">
            <p>2 Completed</p>
            <CheckBadgeIcon className="h-5 w-5 absolute -translate-y-[50%]  left-3 top-1/2 " />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightCard;

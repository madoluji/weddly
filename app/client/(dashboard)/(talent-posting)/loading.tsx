import PostingSkeleton from "@/app/ui/dashboard-components/skeletons/postingSkeleton";
import React from "react";

const Loading = () => {
  return (
    <div className="py-5">
      <PostingSkeleton />
    </div>
  );
};

export default Loading;

import SkeletonProfileCard from "./skeletons/skeletonProfileCard"; // Importing SkeletonProfileCard component
import ReviewSkeletonCard from "./skeletons/reviewSkeletonCard"; // Importing ReviewSkeletonCard component
import OrderSkeletonCard from "./skeletons/orderSkeletonCard"; // Importing OrderSkeletonCard component
import RatingSkeletonCard from "./skeletons/ratingSkeletonCard"; // Importing RatingSkeletonCard component
import FinanceSkeletonCard from "./skeletons/financeSkeletonCard"; // Importing FinanceSkeletonCard component
import JobPostingSkeleton from "./skeletons/postingSkeleton"; // Importing JobPostingSkeleton component
import ChatListSkeleton from "./skeletons/chatListSkeleton"; // Importing ChatListSkeleton component

// Functional component definition
const DashboardSkeleton = () => {
  return (
    <>
      {/* Main grid container with 4 rows and gap between elements */}
      <div className="grid grid-rows-4 overflow-hidden gap-10">
        {/* First row: flex container with evenly spaced items */}
        <div className="flex flex-wrap justify-evenly row-span-1 items-center gap-x-3 gap-y-10 p-10 py-4 w-full">
          <SkeletonProfileCard /> {/* Rendering SkeletonProfileCard */}
          <OrderSkeletonCard /> {/* Rendering OrderSkeletonCard */}
          <RatingSkeletonCard /> {/* Rendering RatingSkeletonCard */}
          <FinanceSkeletonCard /> {/* Rendering FinanceSkeletonCard */}
          <ReviewSkeletonCard /> {/* Rendering ReviewSkeletonCard */}
        </div>
        {/* Second to fourth rows: grid container with 5 columns and gap between elements */}
        <div className="w-full row-span-3 px-12 grid grid-cols-5 gap-10">
          <ChatListSkeleton /> {/* Rendering ChatListSkeleton */}
          <JobPostingSkeleton /> {/* Rendering JobPostingSkeleton */}
        </div>
      </div>
    </>
  );
};

export default DashboardSkeleton; // Exporting the DashboardSkeleton component as default

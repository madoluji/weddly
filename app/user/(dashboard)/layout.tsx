import ChatList from "../../ui/chat-component/chatList";
import ProfileCard from "../../ui/dashboard-components/profileCard";
import OrderCard from "../../ui/dashboard-components/orderCard";
import RatingCard from "../../ui/dashboard-components/rating-card/ratingCard";
import FinanceCard from "../../ui/dashboard-components/financeCard";
import ReviewsCard from "../../ui/dashboard-components/reviews-card/reviewsCard";
import JobNavBar from "../../ui/dashboard-components/job-list/jobNavBar";
import SearchInput from "../../ui/dashboard-components/job-list/searchBar";
import { ReactNode, Suspense } from "react";
import UserProfileLoader from "@/app/lib/userProfileLoader";
import PostingSkeleton from "@/app/ui/dashboard-components/skeletons/postingSkeleton";
import JobDetailsSlider from "@/app/ui/dashboard-components/job-details-slider";
import RatingSkeletonCard from "@/app/ui/dashboard-components/skeletons/ratingSkeletonCard";
interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <>
      <div className="grid px-5 py-10 md:px-10 gap-16  dashboard:grid-rows-2  ">
        <UserProfileLoader />
        <div className="   hidden xl:flex xl:justify-between   sm:gap-x-5 gap-y-10  w-full ">
          <ProfileCard mode={"Freelancer"} />
          <OrderCard mode="Freelancer" />
          <Suspense>
            <RatingCard />
          </Suspense>
          <FinanceCard />
          <ReviewsCard />
        </div>
        <div
          className="w-full
        bg-white
         gap-12
         2xl:grid
         2xl:grid-cols-5 "
        >
          <div
            className="  h-[770px] PB-5 hidden sticky top-28 2xl:block rounded-3xl
      "
          >
            <Suspense>
              <ChatList />
            </Suspense>
          </div>
          <div className="w-full col-span-4 ">
            <div className="sticky z-[2]  top-[75px] pt-5  bg-white">
              <Suspense>
                <SearchInput />
              </Suspense>
              <h1 className="text-2xl font-medium mt-5 text-success-600">
                Wedding gigs you might love
              </h1>
              <JobNavBar />
            </div>
            <div className="2xl:w-[75%] w-[90%]">
              <Suspense fallback={<PostingSkeleton />}>{children}</Suspense>
            </div>
          </div>
        </div>
      </div>
      <JobDetailsSlider />
    </>
  );
}

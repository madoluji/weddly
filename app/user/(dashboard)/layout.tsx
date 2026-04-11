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
import ScheduleBox from "@/app/ui/dashboard-components/scheduleBox";
interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <>
      <div className="grid px-5 py-10 md:px-10 gap-16  dashboard:grid-rows-2  ">
        <UserProfileLoader />
        <div className="hidden w-full gap-5 xl:grid xl:grid-cols-2 2xl:grid-cols-5">
          <div className="h-full">
            <ProfileCard mode={"Freelancer"} />
          </div>
          <div className="h-full">
            <OrderCard mode="Freelancer" />
          </div>
          <div className="h-full">
            <Suspense>
              <RatingCard />
            </Suspense>
          </div>
          <div className="h-full">
            <FinanceCard />
          </div>
          <div className="h-full">
            <ReviewsCard />
          </div>
        </div>
        <div
          className="w-full
        bg-white
         gap-12
         2xl:grid
         2xl:grid-cols-5 "
        >
          <div
            className="  h-[770px] PB-5 hidden sticky top-[70px] 2xl:block rounded-3xl
      "
          >
            <Suspense>
              <ChatList />
            </Suspense>
          </div>
          <div className="w-full col-span-4">
            <div className="2xl:grid 2xl:grid-cols-[minmax(0,1fr)_340px] 2xl:items-start 2xl:gap-12">
              <div className="min-w-0">
                <div className="sticky z-[2]  top-[75px] pt-5  bg-white">
                  <Suspense>
                    <SearchInput />
                  </Suspense>
                  <h1 className="text-2xl font-medium mt-5 text-success-600">
                    Wedding gigs you might love
                  </h1>
                  <JobNavBar />
                </div>
                <div className="w-full 2xl:pr-2">
                  <Suspense fallback={<PostingSkeleton />}>{children}</Suspense>
                </div>
              </div>

              <aside className="hidden 2xl:block self-start pt-0">
                <div className="sticky top-[70px] max-h-[calc(100vh-88px)] overflow-hidden">
                  <ScheduleBox />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
      <JobDetailsSlider />
    </>
  );
}

import ChatList from "../../ui/chat-component/chatList";
import ProfileCard from "../../ui/dashboard-components/profileCard";
import OrderCard from "../../ui/dashboard-components/orderCard";
import RatingCard from "../../ui/dashboard-components/rating-card/ratingCard";
import FinanceCard from "../../ui/dashboard-components/financeCard";
import ReviewsCard from "../../ui/dashboard-components/reviews-card/reviewsCard";
import { Suspense } from "react";
import ProjectCarousel from "@/app/ui/dashboard-components/talent-posting/projectCarousel";
import SearchBar from "@/app/ui/dashboard-components/talent-posting/searchBar";

import { InformationCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import TalentNavBar from "@/app/ui/dashboard-components/talent-posting/navBar";
import UserProfileLoader from "@/app/lib/userProfileLoader";
import TalentDetailsSlider from "@/app/ui/dashboard-components/talent-details-slider";
import CardSkeleton from "@/app/ui/dashboard-components/skeletons/cardSkeleton";
import { DashboardCardsProvider } from "@/app/ui/dashboard-components/DashboardCardsProvider";

// root layout for client dashboard pages

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // body of the page
    <>
      <div className="grid px-5 py-10 md:px-10 gap-16  dashboard:grid-rows-2  ">
        <UserProfileLoader />
        <DashboardCardsProvider>
          {/* profile card, order card, rating card, finance card, reviews card components */}
          <div className="   hidden xl:flex xl:justify-between   sm:gap-x-5 gap-y-10  w-full ">
            <ProfileCard mode={"Client"} />
            <OrderCard mode={"Client"} />
            <Suspense fallback={<CardSkeleton />}>
              <RatingCard />
            </Suspense>
            <FinanceCard />
            <ReviewsCard />
          </div>
        </DashboardCardsProvider>
        <div
          className="w-full
        bg-white
         gap-12
         2xl:grid
         2xl:grid-cols-5 "
        >
          {/* body section below the cards section */}
          <div className="  h-[770px] PB-5 hidden sticky top-28 2xl:block rounded-3xl">
            <Suspense>
              <ChatList />
            </Suspense>
          </div>
          <div className="wedding-gigs-panel mt-5 w-full col-span-4">
            <div className="flex justify-between">
              <span className="text-2xl flex w-full flex-wrap items-center hid ">
                {" "}
                Your Wedding Gigs
                <span className="h-5 w-5 mx-1 info relative">
                  <InformationCircleIcon />
                  <p className="hide absolute rounded-xl  p-3 bg-white text-sm  shadow-[0_0px_20px_rgba(228,228,228,1)] before:absolute before:top-10 before:-left-1 before:translateX-1/2 before:rotate-[135deg] before:z-10  before:bg-white before:border-white before:border-8 after:right-0  z-10 -top-9 w-64  h-24  left-7 text-slate-500    ">
                    {" "}
                    Manage your wedding gigs and contracts efficiently: items
                    needing urgent attention are displayed first
                  </p>
                </span>
              </span>{" "}
              <Link href={"/client/post-job"}>
                <div className="btn btn-primary text-white flex p-3 text-nowrap items-center bg-primary-700 rounded-xl ">
                  <PlusIcon className="h-6 w-6 m-1" />
                  Post a Wedding Gig
                </div>
              </Link>
            </div>
            <Suspense fallback={<CardSkeleton />}>
              <ProjectCarousel />
            </Suspense>
            <div>
              <div className="sticky top-[75px] z-[2]  pt-5  bg-white">
                <Suspense>
                  <SearchBar />
                </Suspense>
                <TalentNavBar />
              </div>
              {/* wedding gig listing space */}
              <div className="w-full col-span-4 ">
                <div className="2xl:w-[75%] w-[90%]">{children}</div>
              </div>
            </div>{" "}
          </div>
        </div>
      </div>
      <Suspense>
        <TalentDetailsSlider />
      </Suspense>
    </>
  );
}

"use client";

import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useAuth } from "@/app/providers";
import NotificationsPage from "../dashboard-components/job-list/notification";

interface Props {
  isDropdownVisible?: Number;
  isOpen?: Boolean;
  currentMode?: String;
}

const LinksDropdown = ({ isDropdownVisible, isOpen, currentMode }: Props) => {
  const { session, status } = useAuth();
  return (
    <>
      {isDropdownVisible === 1 && (
        <div className="absolute text-black  z-20 left-0 shadow-[0_0px_20px_rgba(228,228,228,1)] rounded-xl before:absolute before:-top-2 before:left-7 before:translateX-1/2 before:rotate-[135deg] before:z-10  before:bg-white before:border-white before:border-8 bg-white top-8 after:w-full after:h-6 after:absolute after:-top-5">
          <ul className="flex flex-col  py-5 w-72">
            {(currentMode?.startsWith("/user") ||
              currentMode?.startsWith("/search/jobs")) && (
              <>
                <li>
                  <Link href={"/user/best-matches"}>
                    <p className=" p-3 hover:bg-slate-100">Wedding Gigs</p>
                  </Link>
                </li>

                <li>
                  <Link href={"/user/saved-jobs"}>
                    <p className=" p-3 hover:bg-slate-100">
                      {" "}
                      Saved Wedding Gigs
                    </p>
                  </Link>
                </li>
              </>
            )}
            {(currentMode?.startsWith("/client") ||
              currentMode?.startsWith("/search/talent")) && (
              <>
                <Link href={"/client/post-job"}>
                  <li>
                    <p className=" p-3 hover:bg-slate-100">
                      Post Wedding Gig
                    </p>
                  </li>
                </Link>

                <Link href={"/client/your-contracts"}>
                  <li>
                    <p className=" p-3 hover:bg-slate-100">All Contracts</p>
                  </li>
                </Link>

                <Link href={`/client/your-jobs/${session?.user.id}`}>
                  <li>
                    <p className=" p-3 hover:bg-slate-100">
                      All Wedding Gig Posts
                    </p>
                  </li>
                </Link>
              </>
            )}
          </ul>
        </div>
      )}
      {isDropdownVisible === 2 && (
        <div className="absolute text-black  left-0 shadow-[0_0px_20px_rgba(228,228,228,1)] rounded-xl before:absolute before:-top-2 before:left-7 before:translateX-1/2 before:rotate-[135deg] before:z-10  before:bg-white before:border-white before:border-8 bg-white top-8 z-20 after:w-full after:h-6 after:absolute after:-top-5">
          <ul className="flex flex-col gap-3 py-5 w-72">
            {(currentMode?.startsWith("/user") ||
              currentMode?.startsWith("/search/jobs")) && (
              <>
                <li>
                  <Link href={"/user/your-contracts?tab=active-contracts"}>
                    <p className=" ml-2 p-2 hover:bg-slate-100">Your Contracts</p>
                  </Link>
                </li>
                
                <li>
                  <Link href={"/user/business/transaction"}>
                    <p className=" ml-2 p-2 hover:bg-slate-100">Transactions</p>
                  </Link>
                </li>
              </>
            )}
  
            {(currentMode?.startsWith("/client") ||
              currentMode?.startsWith("/search/talent")) && (
              <>
                <Link href={"/search/talent"}>
                  <li className=" p-3 hover:bg-slate-100">
                    Discover Venues & Vendors
                  </li>
                </Link>
                <Link href={"/client/your-contracts"}>
                  <li className=" p-3 hover:bg-slate-100">Your Hires </li>
                </Link>
                <Link href={"/client/saved-talents"}>
                  <li className=" p-3 hover:bg-slate-100">
                    Saved Wedding Planners
                  </li>
                </Link>
              </>
            )}
          </ul>
        </div>
      )}
      {isDropdownVisible === 3 && (
        <div className="absolute rounded-xl  p-2 bg-white text-xm right-0 top-10 shadow-[0_0px_20px_rgba(228,228,228,1)] before:absolute before:-top-1 before:right-2 before:translateX-1/2 before:rotate-[135deg] before:z-10  before:bg-white before:border-white before:border-8  z-20 after:right-0 after:h-6 after:absolute after:-top-5">
          Help
        </div>
      )}
      {isDropdownVisible === 4 && (
        <div className="absolute rounded-xl  p-2 bg-white text-xm right-0 top-10 shadow-[0_0px_20px_rgba(228,228,228,1)] before:absolute before:-top-1 before:right-2 before:translateX-1/2 before:rotate-[135deg] before:z-10  before:bg-white before:border-white before:border-8 after:right-0  z-20  after:h-6 after:absolute after:-top-5">
          <NotificationsPage />
        </div>
      )}
      {isDropdownVisible === 6 && !isOpen && (
        <div className="absolute rounded-xl w-[160px] p-2 bg-white text-xm right-0 top-10 shadow-[0_0px_20px_rgba(228,228,228,1)] before:absolute before:-top-1 before:right-2 before:translateX-1/2 before:rotate-[135deg] before:z-10  before:bg-white before:border-white before:border-8  z-20 after:w-full after:h-6 after:absolute after:-top-5">
          Account Settings
        </div>
      )}
      {isOpen && (
        <>
          <div className="p-3 flex   flex-col relative overflow-hidden  align-middle items-center ">
            <div
              className="  rounded-full
                            
                     h-24 w-24"
            >
              <Image
              src={session?.user?.profilePicture || "/images/image.png"}
              alt="profile"
              width={96}
              height={96}
              className="object-cover rounded-full h-full w-full"
               
              />
            </div>

            <div className=" text-center pt-1 ">
              <h2 className="text-2xl  font-medium ">
                {" "}
                {session?.user?.name} {session?.user?.lastName}
              </h2>
              <p className="text-xs  text-gray-400">
                {(currentMode?.startsWith("/user") ||
                  currentMode?.startsWith("/search/jobs")) && <>Freelancer</>}
                {(currentMode?.startsWith("/client") ||
                  currentMode?.startsWith("/search/talent")) && <>Client</>}
              </p>
            </div>
          </div>
          <div className="hover:bg-slate-200 p-1">
            {(currentMode?.startsWith("/user") ||
              currentMode?.startsWith("/search/jobs")) && (
              // href={session?.user?.roles?.client === true ? "/client/best-matches" : "/signup/client"}>

              <Link href={"/client/best-matches"}>
                <span className="flex items-center gap-1">
                  <UserCircleIcon className="size-8" />
                  <span className="flex flex-col ">
                    {session?.user?.name} {session?.user?.lastName}
                    <p className="text-xs text-gray-400">Client</p>
                  </span>
                </span>
              </Link>
            )}
            {(currentMode?.startsWith("/client") ||
              currentMode?.startsWith("/search/talent")) && (
              <Link href={"/user/best-matches"}>
                <span className="flex items-center gap-1">
                  <UserCircleIcon className="size-8" />
                  <span className="flex flex-col ">
                    {session?.user?.name} {session?.user?.lastName}
                    <p className="text-xs text-gray-400">Freelancer</p>
                  </span>
                </span>
              </Link>
            )}
          </div>
          <div className="hover:bg-slate-200 p-1">
            {currentMode?.startsWith("/client") ||
            currentMode?.startsWith("/search/talent") ? (
              <Link href={"/client/profile"}>
                <span className="flex items-center gap-1">
                  <UserCircleIcon className="size-8" />
                  <span className="flex flex-col ">
                    <p>Profile</p>
                  </span>
                </span>
              </Link>
            ) : (
              <Link href={"/user/profile"}>
                <span className="flex items-center gap-1">
                  <UserCircleIcon className="size-8" />
                  <span className="flex flex-col ">
                    <p>Profile</p>
                  </span>
                </span>
              </Link>
            )}
          </div>

          <div className="hover:bg-slate-200 p-1">
            {currentMode?.startsWith("/client") ||
            currentMode?.startsWith("/search/talent") ? (
              <Link href={"/user/setting"}>
                <span className="flex items-center gap-1">
                  <Cog6ToothIcon className="size-8" />
                  <span className="flex flex-col ">
                    <p>Settings</p>
                  </span>
                </span>
              </Link>
            ) : (
              <Link href={"/user/setting"}>
                <span className="flex items-center gap-1">
                  <Cog6ToothIcon className="size-8" />
                  <span className="flex flex-col ">
                    <p>Settings</p>
                  </span>
                </span>
              </Link>
            )}
          </div>
          <button
            onClick={() => signOut()}
            className="hover:bg-slate-200 p-1 w-full flex items-center gap-1 text-left"
          >
            <ArrowLeftStartOnRectangleIcon className="size-8" />
            <span className="flex flex-col">
              <p>Log out</p>
            </span>
          </button>
        </>
      )}
    </>
  );
};

export default LinksDropdown;

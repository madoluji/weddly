"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import LinksDropdown from "./linksDropdown";
import { useAuth } from "@/app/providers";

const Links = () => {
  const { session, status } = useAuth();
  const currentPath = usePathname();
  const [isDropdownVisible, setDropdownVisible] = useState(0);
  return (
    <>
      <ul className="xl:flex mx-5 p-2 hidden font-medium text-sm gap-5 content-center items-center">
        <li>
          <div
            className=" flex flex-row align-items-center justify-center relative"
            onMouseEnter={() => setDropdownVisible(1)}
            onMouseLeave={() => setDropdownVisible(0)}
          >
            {(currentPath.startsWith("/user") ||
              currentPath.startsWith("/search/jobs")) && (
              <Link
                href="/user/best-matches"
                className={clsx("hover:text-primary-600", {
                  "text-primary-600":
                    currentPath == "/user/best-matches" ||
                    currentPath == "/user/most-recent" ||
                    currentPath == "/user/saved-jobs",
                })}
              >
                Dashboard
              </Link>
            )}
            {(currentPath.startsWith("/client") ||
              currentPath.startsWith("/search/talent")) && (
              <Link
                href="/client/best-matches"
                className={clsx("hover:text-primary-600", {
                  "text-primary-600":
                    currentPath == "/user/best-matches" ||
                    currentPath == "/user/most-recent" ||
                    currentPath == "/user/saved-jobs",
                })}
              >
                Dashboard
              </Link>
            )}
            <ChevronDownIcon className="h-5 w-5 ml-1" />
            {isDropdownVisible === 1 && (
              <LinksDropdown
                isDropdownVisible={isDropdownVisible}
                currentMode={currentPath}
              />
            )}
          </div>
        </li>
        <li className=" flex align-items-center justify-center">
          <div
            className=" flex flex-row align-items-center justify-center relative"
            onMouseEnter={() => setDropdownVisible(2)}
            onMouseLeave={() => setDropdownVisible(0)}
          >
            {(currentPath.startsWith("/user") ||
              currentPath.startsWith("/search/jobs")) && (
              <Link
                href="/user/your-proposals"
                className={clsx("hover:text-primary-600", {
                  "text-primary-600": currentPath == "/user/your-proposals",
                })}
              >
                My Business
              </Link>
            )}

            {(currentPath.startsWith("/client") ||
              currentPath.startsWith("/search/talent")) && (
              <Link
                href="/client/best-matches"
                className={clsx("hover:text-primary-600", {
                  "text-primary-600": currentPath == "/client",
                })}
              >
                Venues & Vendors
              </Link>
            )}
            {isDropdownVisible === 2 && (
              <LinksDropdown
                isDropdownVisible={isDropdownVisible}
                currentMode={currentPath}
              />
            )}
            <ChevronDownIcon className="h-5 w-5" />
          </div>
        </li>
        <li className="flex align-items-center justify-center">
          {(currentPath.startsWith("/user") ||
            currentPath.startsWith("/search/jobs")) && (
            <Link
              href={`/user/chatroom/${session?.user?.id}`}
              className={clsx("hover:text-primary-600", {
                "text-primary-600": currentPath == "/user/chatroom",
              })}
            >
              Messages
            </Link>
          )}
          {(currentPath.startsWith("/client") ||
            currentPath.startsWith("/search/talent")) && (
            <Link
              href={`/client/chatroom/${session?.user?.id}`}
              className={clsx("hover:text-primary-600", {
                "text-primary-600": currentPath == "/user/chatroom",
              })}
            >
              Messages
            </Link>
          )}
        </li>
        <li className=" flex align-items-center justify-center">
            {(currentPath.startsWith("/user") ||
            currentPath.startsWith("/search/jobs")) && (
            <Link
              href="/user/analytics"
              className={clsx("hover:text-primary-600", {
              "text-primary-600": currentPath == "/user/analytics",
              })}
            >
              Analytics
            </Link>
            )}
            {(currentPath.startsWith("/client") ||
            currentPath.startsWith("/search/talent")) && (
            <Link
              href="/client/analytics"
              className={clsx("hover:text-primary-600", {
              "text-primary-600": currentPath == "/client/analytics",
              })}
            >
              Analytics
            </Link>
            )}
        </li>
        {(currentPath.startsWith("/client") ||
          currentPath.startsWith("/search/talent")) && (
          <li>
            <Link
              href="/client/post-job/job-details"
              className="border-2 border-emerald-600 text-emerald-700 px-6 py-2 rounded-full font-bold hover:bg-emerald-50 transition-all shadow-sm whitespace-nowrap"
            >
              Post a Job
            </Link>
          </li>
        )}
      </ul>
    </>
  );
};

export default Links;

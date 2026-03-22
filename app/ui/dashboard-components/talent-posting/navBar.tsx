"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TalentNavBar = () => {
  const currentPath = usePathname();
  return (
    <ul className="flex border-b-4 mt-2 py-2 text-slate-600  flex-row gap-5 ">
      <li className="relative">
        <Link
          className={
            (clsx("hover:text-primary-600  "),
            currentPath == "/client/best-matches" ? "text-primary-600" : "")
          }
          href={"/client/best-matches"}
        >
          Best Matches
        </Link>
        <div
          className={clsx(
            "h-1  border-r-[5px] bg-primary-600 transition-all duration-80 ease-in-out   absolute -bottom-3",
            currentPath == "/client/best-matches"
              ? "w-full  opacity-100 border-white"
              : "w-0 opacity-0"
          )}
        />
      </li>

      <li className="relative">
        <Link
          className={
            (clsx("hover:text-primary-600 "),
            currentPath == "/client/saved-talents" ? "text-primary-600" : "")
          }
          href={"/client/saved-talents"}
        >
          Saved Wedding Planners
        </Link>
        <div
          className={clsx(
            "h-1  -left-1 border-x-[5px]  transition-all duration-80 ease-in-out bg-primary-600 absolute -bottom-3",
            currentPath == "/client/saved-jobs"
              ? "w-[100px] opacity-100 border-white"
              : "w-0 opacity-0"
          )}
        />
      </li>
    </ul>
  );
};

export default TalentNavBar;

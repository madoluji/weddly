"use client";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MenuBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = usePathname();

  return (
    <div className="flex-col ">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 border rounded text-primary-700 border-primary-700 hover:-primary-600 hover:-primary-600"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 z-50 top-[75px] " aria-hidden="true" />
        ) : (
          <Bars3Icon className="h-6 w-6 " aria-hidden="true" />
        )}
      </button>

      <div
        className={clsx(
          " top-0 -left-0 w-screen  transition-all duration-800 ease-in-out h-screen flex flex-col gap-10 p-5 bg-white z-40",
          { hidden: !isOpen },
          { block: isOpen },
          { "translate-x-0": isOpen }
        )}
      >
        <ul className=" flex  mx-5 p-2 flex-col  font-medium text-xl gap-16 content-center ">
          <li className="hover:text-primary-600 flex flex-row align-items-center justify-center">
            <Link
              href="/user/best-matches"
              className={clsx({
                "text-primary-600":
                  currentPath == "/user/best-matches" ||
                  currentPath == "/user/most-recent" ||
                  currentPath == "/user/saved-jobs",
              })}
              onClick={() => setIsOpen(!isOpen)}
            >
              Dashboard
            </Link>
          </li>
          <li className="hover:text-primary-600 flex align-items-center justify-center">
            <Link
              href="/user/your-proposals"
              className={clsx({
                "text-primary-600": currentPath == "/user/your-proposals",
              })}
              onClick={() => setIsOpen(!isOpen)}
            >
              My Business
            </Link>
          </li>
          <li className="hover:text-primary-600 flex align-items-center justify-center">
            <Link
              href="/user/chatroom"
              className={clsx({
                "text-primary-600": currentPath == "/user/chatroom",
              })}
              onClick={() => setIsOpen(!isOpen)}
            >
              Messages
            </Link>
          </li>
          <li className="hover:text-primary-600 flex align-items-center justify-center">
            <Link
              href="/user/analytics" // Assuming this is the correct path for Analytics
              className={clsx({
                "text-primary-600": currentPath == "/user/analytics",
              })}
              onClick={() => setIsOpen(!isOpen)}
            >
              Analytics
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MenuBar;

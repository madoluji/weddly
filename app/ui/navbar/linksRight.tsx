"use client";
import {
  QuestionMarkCircleIcon,
  RectangleGroupIcon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LinksDropdown from "./linksDropdown";

const LinksRight = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentPath = usePathname();

  /// effects dropdown
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
    };
    // Step 1: Query for elements with the 'body-container' class
    const elements = document.querySelectorAll(".body-container");

    // Step 2: Add the event listener to each of these elements
    elements.forEach((element) => {
      element.addEventListener("mousedown", handleClickOutside);
    });

    // Step 3: Remove the event listener from each element on cleanup
    return () => {
      elements.forEach((element) => {
        element.removeEventListener("mousedown", handleClickOutside);
      });
    };
  }, []);

  return (
    <ul className="xl:flex gap-5 hidden  ml-2 items-center">
      <li className="relative">
        <QuestionMarkCircleIcon
          onMouseEnter={() => setDropdownVisible(3)}
          onMouseLeave={() => setDropdownVisible(0)}
          className="size-8 "
        />
        {isDropdownVisible === 3 && (
          <LinksDropdown isDropdownVisible={isDropdownVisible} />
        )}
      </li>

      
      <li className="relative">
        <BellIcon
          className="size-8"
          onMouseEnter={() => setDropdownVisible(4)}
          onMouseLeave={() => setDropdownVisible(0)}
        />
        {isDropdownVisible === 4 && (
          <LinksDropdown isDropdownVisible={isDropdownVisible} />
        )}
      </li>
      <li>
        <div
          className="relative"
          onMouseEnter={() => setDropdownVisible(6)}
          onMouseLeave={() => setDropdownVisible(0)}
          onClick={() => setIsOpen(!isOpen)}
        >
          <UserCircleIcon className="size-8" />
          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute w-[250px] py-2 text-black right-0 shadow-[0_0px_20px_rgba(228,228,228,1)] rounded-xl before:absolute before:-top-1 before:right-2 before:translateX-1/2 before:rotate-[135deg] before:z-10  before:bg-white before:border-white before:border-8 bg-white top-11 z-10 after:w-full after:h-6 after:absolute after:-top-5"
            >
              <LinksDropdown isOpen={isOpen} currentMode={currentPath} />
            </div>
          )}
          {isDropdownVisible === 6 && !isOpen && (
            <LinksDropdown
              isDropdownVisible={isDropdownVisible}
              isOpen={isOpen}
              currentMode={currentPath}
            />
          )}
        </div>
      </li>
    </ul>
  );
};

export default LinksRight;

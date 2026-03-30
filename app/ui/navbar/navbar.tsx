"use client";
import React, { Suspense } from "react";
import Link from "next/link";
import Links from "./links";
import MenuBar from "./menuBar";
import LinksRight from "./linksRight";
import SearchInput from "./navSearchBar";
import AppLogo from "../shared/AppLogo";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const pathname = usePathname();

  const logoHref = pathname.startsWith("/client")
    ? "/client/best-matches"
    : pathname.startsWith("/user")
    ? "/user/best-matches"
    : "/";

  return (
    <nav className="border-b-2 ">
      <div className="flex  max-w-[1980px] m-auto justify-between items-center  py-3 px-10">
        <div className="flex lg:hidden flex-col">
          <Suspense>
            <MenuBar />
          </Suspense>
        </div>
        <div className="flex">
          <AppLogo
            width={50}
            height={50}
            alt="logo"
            href={logoHref}
            style={{ minBlockSize: "50px", width: "auto", height: "auto" }}
          />
          {
            <Suspense>
              <Links />
            </Suspense>
          }
        </div>
        <div className="flex items-center justify-end lg:w-[40%]">
          <Suspense>
            <SearchInput />
          </Suspense>
          <LinksRight />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

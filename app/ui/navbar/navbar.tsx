import Image from "next/image";
import React, { Suspense } from "react";
import Link from "next/link";
import Links from "./links";
import MenuBar from "./menuBar";
import LinksRight from "./linksRight";
import SearchInput from "./navSearchBar";

const NavBar = () => {
  return (
    <nav className="border-b-2 ">
      <div className="flex  max-w-[1980px] m-auto justify-between items-center  py-3 px-10">
        <div className="flex lg:hidden flex-col">
          <Suspense>
            <MenuBar />
          </Suspense>
        </div>
        <div className="flex">
          <Link href={"/"}>
            <Image
              src="/logo/weddlylogo.png"
              alt="logo"
              width={50}
              height={50}
              style={{ minBlockSize: "50px" }}
            />
          </Link>
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

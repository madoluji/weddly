"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";
import {
  AdjustmentsHorizontalIcon,
  HomeIcon,
  ServerIcon,
  BoltIcon,
  CurrencyRupeeIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useAuth } from "@/app/providers";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive }) => (
  <li>
    <Link
      href={href}
      className={`flex items-center space-x-4 p-3 rounded-lg transition ${
        isActive
          ? "bg-yellow-400 text-black"
          : "hover:bg-yellow-400 hover:text-black"
      }`}
    >
      <span className="w-6 h-6">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  </li>
);

const Sidebar: React.FC = () => {
  const pathname = usePathname(); // Get current route
  const { session, status } = useAuth();
  return (
    <div className="left-0 top-0 h-screen px-5 w-1/6 bg-white shadow-md text-black">
      <nav className="flex flex-col h-full py-6">
        {/* Logo */}
        <div className="flex items-center justify-center px-4 mb-6">
          <Image
            src="/logo/weddlylogo-v2.png"
            alt="logo"
            className="w-20 h-20 p-1"
            width={50}
            height={50}
          />
        </div>

        {/* Admin Profile Section */}
        <div className="flex flex-col items-center px-4 py-4 border-b">
          {/* <Image
            src="/images/placeholder-614" // Change this to the admin's actual avatar URL
            alt="Admin Avatar"
            className="w-14 h-14 rounded-full border-2 border-gray-300"
            width={50}
            height={50}
          /> */}
          <Image
            src="/images/image.png"
            alt="Admin Avatar"
            width={50}
            height={50}
            className="w-14 h-14 rounded-full border-2 border-gray-300"
          />

          <span className="mt-2 font-semibold text-sm">
            {session?.user.name} {session?.user.lastName}
          </span>
        </div>

        {/* Navigation Menu */}
        <ul className="mt-8 space-y-3">
          <NavItem
            href="/admin"
            icon={<HomeIcon className="w-6 h-6" />}
            label="Dashboard"
            isActive={pathname === "/admin"}
          />
          <NavItem
            href="/admin/kyc"
            icon={<AdjustmentsHorizontalIcon className="w-6 h-6" />}
            label="KYC Verification"
            isActive={pathname === "/admin/kyc"}
          />
          <NavItem
            href="/admin/insights"
            icon={<ServerIcon className="w-6 h-6" />}
            label="Insights"
            isActive={pathname === "/admin/insights"}
          />
          <NavItem
            href="/admin/transaction"
            icon={<CurrencyRupeeIcon className="w-6 h-6" />}
            label="Transactions"
            isActive={pathname === "/admin/transaction"}
          />
          <NavItem
            href="/admin/settings"
            icon={<BoltIcon className="w-6 h-6" />}
            label="Settings"
            isActive={pathname === "/admin/settings"}
          />
        </ul>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={() => signOut()}
            className={`flex items-center space-x-4 p-3 w-full rounded-lg transition
              hover:bg-yellow-400 hover:text-black`}
          >
            <ArrowLeftStartOnRectangleIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;

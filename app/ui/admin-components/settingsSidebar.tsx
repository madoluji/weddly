"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  ServerIcon,
  BoltIcon,
  CurrencyRupeeIcon,
  UserIcon,
  KeyIcon,
  ClipboardDocumentListIcon,
  ArrowLeftStartOnRectangleIcon,
  BackwardIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { signOut } from "next-auth/react";
import { useAuth } from "@/app/providers";
import SafeImage from "@/app/ui/shared/SafeImage";
import DarkModeToggle from "@/app/ui/navbar/DarkModeToggle";

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
          ? "bg-primary text-white"
          : "hover:bg-primary hover:text-white"
      }`}
    >
      <span className="w-6 h-6">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  </li>
);

const SettingsSidebar: React.FC = () => {
  const { session, status } = useAuth();
  const pathname = usePathname(); // Get current route
  const [adminRole, setAdminRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await fetchWithAuth(
          "/api/admin/fetch-admin?currentUser=true"
        );
        const data = await res.json();
        if (data && data.role) {
          setAdminRole(data.role);
        }
      } catch (error) {
        console.error("Error fetching admin info:", error);
      }
    };

    fetchAdminInfo();
  }, []);

  const handleDeleteAccount = async () => {
    try {
      const res = await fetchWithAuth("/api/admin/delete-account", {
        method: "DELETE",
      });
      if (res.ok) {
        signOut();
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <div className="left-0 top-0 h-screen px-5 w-1/6 bg-white dark:bg-dark-surface shadow-md text-black dark:text-dark-on-surface">
      <nav className="flex flex-col h-full py-6">
        {/* Logo */}
        <div className="flex items-center justify-center px-4 mb-6">
          <Image
            src="/logo/weddlylogo.png"
            alt="logo"
            className="w-20 h-20 p-1"
            width={50}
            height={50}
          />
        </div>

        {/* Admin Profile Section */}
        <div className="flex flex-col items-center px-4 py-4 border-b">
          <SafeImage
            src={session?.user?.profilePicture || "/images/image.png"}
            alt="Admin Avatar"
            className="w-14 h-14 rounded-full border-2 border-gray-300"
            width={50}
            height={50}
          />
          <span className="mt-2 font-semibold text-sm">
            {session?.user.name} {session?.user.lastName}
          </span>
        </div>

        {/* Navigation Menu */}
        <ul className="mt-8 space-y-3">
          <NavItem
            href="/admin/settings/account"
            icon={<UserIcon className="w-6 h-6" />}
            label="Account Settings"
            isActive={pathname === "/admin/settings/account"}
          />
          {adminRole === "superadmin" && (
            <NavItem
              href="/admin/settings/manage-admins"
              icon={<KeyIcon className="w-6 h-6" />}
              label="Manage Admins"
              isActive={pathname === "/admin/settings/manage-admins"}
            />
          )}
          {adminRole === "superadmin" && (
            <NavItem
              href="/admin/settings/audit-logs"
              icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
              label="Audit Logs"
              isActive={pathname === "/admin/settings/audit-logs"}
            />
          )}

          <NavItem
            href="/admin/settings/#"
            icon={<BoltIcon className="w-6 h-6" />}
            label="Admin Settings"
            isActive={pathname === ""}
          />
          <NavItem
            href="/admin"
            icon={<BackwardIcon className="w-6 h-6" />}
            label="Back"
            isActive={pathname === ""}
          />
        </ul>

        {/* Logout Button */}

        <div className="mt-auto space-y-3">
          <div className="flex items-center space-x-4 p-3">
            <DarkModeToggle />
            <span className="text-sm font-medium">Toggle Theme</span>
          </div>
          <button
            onClick={() => signOut()}
            className={`flex items-center space-x-4 p-3 w-full rounded-lg transition
              hover:bg-primary hover:text-white`}
          >
            <ArrowLeftStartOnRectangleIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Logout</span>
          </button>
          <button
            onClick={() => handleDeleteAccount()}
            className={`flex items-center text-red-600 space-x-4 p-3 w-full rounded-lg transition
              hover:bg-red-600 hover:text-white`}
          >
            <span className="text-sm font-medium ">Delete Account</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default SettingsSidebar;

"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/providers";
import {
  PencilIcon,
  SunIcon,
  MoonIcon,
  TrashIcon,
  LockClosedIcon,
} from "@heroicons/react/20/solid";

export default function SettingsPage() {
  const { session, status } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState(session?.user?.email || "");

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleUpdateEmail = () => {
    console.log("Updating email to:", email);
  };

  const handleChangePassword = () => {
    console.log("Changing password");
  };

  const handleDeleteAccount = () => {
    console.log("Deleting account");
  };

  return (
    <div
      className={`container mx-auto p-6 min-h-screen ${darkMode ? "bg-gray-900 text-white" : " text-black"}`}
    >
      <div className="bg-white p-6 rounded-md shadow-md mb-6 ">
        <h2 className="text-2xl font-semibold mb-4">Profile Settings</h2>
        <div className="mb-4">
          <label className="block font-semibold">Email Address</label>
          <div className="flex items-center border p-2 rounded-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 p-2 outline-none bg-transparent"
            />
            <PencilIcon
              className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={handleUpdateEmail}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-md shadow-md mb-6 ">
        <h2 className="text-2xl font-semibold mb-4">Preferences</h2>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Dark Mode</span>
          <button
            onClick={handleToggleDarkMode}
            className="p-2 bg-gray-200 rounded-full dark:bg-gray-700"
          >
            {darkMode ? (
              <SunIcon className="w-6 h-6 text-yellow-500" />
            ) : (
              <MoonIcon className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-md shadow-md mb-6 ">
        <h2 className="text-2xl font-semibold mb-4">Security</h2>
        <button
          onClick={handleChangePassword}
          className="w-full flex items-center justify-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          <LockClosedIcon className="w-5 h-5 mr-2" /> Change Password
        </button>
      </div>

      <div className="bg-white p-6 rounded-md shadow-md ">
        <h2 className="text-2xl font-semibold mb-4 text-red-500">
          Danger Zone
        </h2>
        <button
          onClick={handleDeleteAccount}
          className="w-full flex items-center justify-center bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
        >
          <TrashIcon className="w-5 h-5 mr-2" /> Delete Account
        </button>
      </div>
    </div>
  );
}

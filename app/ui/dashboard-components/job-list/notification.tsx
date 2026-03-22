"use client";

import React, { useState } from "react";
import Sidebar from "../../../ui/admin-components/sidebar";
import NavBar from "../../../ui/navbar/navbar";
import {
  BellIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftEllipsisIcon,
  UserIcon,
} from "@heroicons/react/24/solid";

interface Notification {
  id: number;
  type: "Job" | "Payment" | "Message" | "Profile";
  message: string;
  timestamp: string;
  read: boolean;
}

const dummyNotifications: Notification[] = [
  { id: 1, type: "Job", message: "New job posted: React Developer Needed!", timestamp: "2 mins ago", read: false },
  { id: 2, type: "Payment", message: "Your payment of $500 has been processed.", timestamp: "1 hour ago", read: true },
  { id: 3, type: "Message", message: "You received a new message from John Doe.", timestamp: "Just now", read: false },
  { id: 4, type: "Profile", message: "Your profile was updated successfully.", timestamp: "Yesterday", read: true },
  { id: 5, type: "Job", message: "Client approved your proposal.", timestamp: "5 hours ago", read: false },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  // Get Icon Based on Type
  const getIcon = (type: string) => {
    switch (type) {
      case "Job":
        return <SparklesIcon className="w-6 h-6 text-primary-600" />;
      case "Payment":
        return <CurrencyDollarIcon className="w-6 h-6 text-green-500" />;
      case "Message":
        return <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-yellow-500" />;
      case "Profile":
        return <UserIcon className="w-6 h-6 text-gray-500" />;
      default:
        return <BellIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
        <div className="p-6 ">
          <h1 className="text-2xl font-bold text-gray-700">Notifications</h1>
          
              
         
              <p className="text-gray-500 text-center">No new notifications</p>
            
          </div>
  );
};

export default NotificationsPage;

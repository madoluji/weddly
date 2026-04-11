"use client";

import { useContext, useEffect, useState } from "react";
import SafeImage from "@/app/ui/shared/SafeImage";
import { usePathname, useRouter } from "next/navigation";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Appcontext } from "@/app/context/appContext";

interface ChatListProps {
  density?: "comfortable" | "compact";
}

const ChatList: React.FC<ChatListProps> = ({ density = "comfortable" }) => {
  type ChatDataItem = {
    messageId: string;
    lastMessage: string;
    rId: string;
    updateDoc: number;
    messageSeen: boolean;
    userData: UserData;
    user: UserData;
    lastMessageSender?: string;
  };

  interface UserData {
    id: string;
    name?: string;
    avatar?: string;
    [key: string]: any; // Additional properties for user data
  }

  interface AppContextValue {
    userData: UserData | null;
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
    chatData: ChatDataItem[] | null;
    setChatData: React.Dispatch<React.SetStateAction<ChatDataItem[] | null>>;
    loadUserData: (uid: string) => Promise<void>;
    messages: any; // Replace `any` with a specific type if possible
    setMessages: React.Dispatch<React.SetStateAction<any>>;
    messagesId: string | null;
    setMessagesId: React.Dispatch<React.SetStateAction<string | null>>;
    chatUser: UserData | null;
    setChatUser: React.Dispatch<React.SetStateAction<UserData | null>>;
    chatVisual: boolean;
    setChatVisual: React.Dispatch<React.SetStateAction<boolean>>;
  }

  const context = useContext(Appcontext) as AppContextValue;
  const {
    userData,
    chatData,
    chatUser,
    setChatUser,
    setMessagesId,
    setChatVisual,
  } = context;
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<UserData | null>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<ChatDataItem[]>([]);

  const getAvatar = (user: UserData | null | undefined) =>
    user?.avatar || user?.profilePicture || "/images/image.png";
  const getDisplayName = (user: UserData | null | undefined) =>
    user?.username || user?.name || "User";

  const inputHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const input = e.target.value.trim().toLowerCase();

      if (!input) {
        setShowSearch(false);
        setSearchResults([]); // Clear search results when input is empty
        return;
      }

      setShowSearch(true);

      if (!chatData || chatData.length === 0) {
        console.warn("Chat data is empty or not loaded yet.");
        return;
      }

      const filteredChats = chatData.filter((chat) => {
        const userName = chat.userData?.username?.toLowerCase() || ""; // Ensure property access
        return userName.includes(input) && chat.userData.id !== userData?.id;
      });

      setSearchResults(filteredChats.length ? filteredChats : []);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const setChat = async (item: ChatDataItem) => {
    try {
      setMessagesId(item.messageId);
      setChatUser(item.userData);
      console.log("setChatUser", chatUser);
      // console.log("setUser", item);
      if (!userData?.id) {
        throw new Error("User ID is undefined");
      }
      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapshot.data();

      if (userChatsData) {
        const chatsData = userChatsData.chatsData as ChatDataItem[];
        const chatIndex = chatsData.findIndex(
          (c) => c.messageId === item.messageId
        );

        if (chatIndex > -1) {
          chatsData[chatIndex].messageSeen = true;
          await updateDoc(userChatsRef, { chatsData });
        }
      }

      setChatVisual(true);

      const basePath = pathname.startsWith("/client")
        ? "/client/chatroom"
        : "/user/chatroom";
      const ownerId = userData?.id || "0";

      // Ensure chat rows always open the dedicated chatroom view.
      router.push(
        `${basePath}/${ownerId}?messageId=${encodeURIComponent(item.messageId)}&recipientId=${encodeURIComponent(item.rId)}`
      );
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <div className="relative h-full overflow-hidden rounded-2xl bg-white dark:bg-dark-surface">
      {/* Search component */}
      <div className={`border-b border-slate-200 dark:border-dark-outline-variant bg-slate-50 dark:bg-dark-surface-container ${density === "compact" ? "px-2.5 py-2.5" : "px-3 py-3"}`}>
        <input
          onChange={inputHandler}
          type="text"
          placeholder="Search conversations"
          className={`w-full rounded-xl border border-slate-200 dark:border-dark-outline-variant bg-white dark:bg-dark-surface text-sm text-slate-700 dark:text-dark-on-surface placeholder:text-slate-400 dark:placeholder:text-dark-on-surface-variant outline-none transition focus:border-primary-300 ${density === "compact" ? "px-2.5 py-2" : "px-3 py-2.5"}`}
        />
      </div>

      {/* User list */}
      <div className="h-full overflow-y-auto pb-16">
        <div className="flex flex-col">
          {showSearch && searchResults.length > 0
            ? searchResults.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setChat(item)}
                  className={`flex items-center gap-3 border-b border-slate-100 dark:border-dark-outline-variant transition hover:bg-slate-50 dark:hover:bg-dark-surface-container ${density === "compact" ? "px-2.5 py-2.5" : "px-3 py-3"}`}
                >
                  <SafeImage
                    src={getAvatar(item.userData)}
                    className={`${density === "compact" ? "h-10 w-10" : "h-12 w-12"} rounded-full object-cover`}
                    alt={getDisplayName(item.userData)}
                    width={density === "compact" ? 40 : 48}
                    height={density === "compact" ? 40 : 48}
                  />
                  <div className="relative min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-dark-on-surface">
                      {getDisplayName(item.userData)}
                    </div>
                  </div>
                </div>
              ))
            : chatData?.map((item: ChatDataItem, index: number) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 border-b border-slate-100 dark:border-dark-outline-variant transition hover:bg-slate-50 dark:hover:bg-dark-surface-container ${density === "compact" ? "px-2.5 py-2.5" : "px-3 py-3"}`}
                  onClick={() => setChat(item)}
                >
                  <SafeImage
                    src={getAvatar(item.userData)}
                    className={`${density === "compact" ? "h-10 w-10" : "h-12 w-12"} rounded-full object-cover`}
                    alt={getDisplayName(item.userData)}
                    width={density === "compact" ? 40 : 48}
                    height={density === "compact" ? 40 : 48}
                  />
                  <div className="relative min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-dark-on-surface">
                      {getDisplayName(item.userData)}
                      {!item.messageSeen &&
                        item.rId === item.lastMessageSender && (
                          <span className="absolute top-0 right-0 h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2f5f4a]"></span>
                          </span>
                        )}
                    </div>
                    <div
                      className={`truncate text-xs text-slate-500 dark:text-dark-on-surface-variant ${!item.messageSeen ? "font-semibold text-slate-700 dark:text-dark-on-surface" : ""}`}
                    >
                      {item.rId === item.lastMessageSender ? "" : "You: "}
                      {item.lastMessage}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default ChatList;

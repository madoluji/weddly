"use client";
import { createContext, useEffect, useState, ReactNode, useMemo, useCallback } from "react";
import { db, auth } from "../lib/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { Job } from "../ui/dashboard-components/job-list/jobList";
import useFirebaseAuth from "../hooks/useFirebaseAuth";

// --- Types ---
interface UserData {
  id: string;
  name?: string;
  avatar?: string;
  [key: string]: any;
}

const defaultChatUser: UserData = {
  id: "0",
  key: 0,
};

interface ChatItem {
  rId: string;
  updatedAt: number;
  userData: UserData;
  lastMessage?: string;
  lastMessageSender?: string;
  [key: string]: any;
}

interface AppContextValue {
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  chatData: ChatItem[] | null;
  setChatData: React.Dispatch<React.SetStateAction<ChatItem[] | null>>;
  loadUserData: (uid: string) => Promise<void>;
  messages: any;
  setMessages: React.Dispatch<React.SetStateAction<any>>;
  messagesId: string | null;
  setMessagesId: React.Dispatch<React.SetStateAction<string | null>>;
  chatUser: UserData;
  setChatUser: React.Dispatch<React.SetStateAction<UserData>>;
  chatVisual: boolean;
  setChatVisual: React.Dispatch<React.SetStateAction<boolean>>;
  jobData: Job | null;
  setJobData: React.Dispatch<React.SetStateAction<Job | null>>;
  jobDetailsVisible: boolean;
  setJobDetailsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  talentData: any;
  setTalentData: React.Dispatch<React.SetStateAction<any>>;
  talentDetailsVisible: boolean;
  setTalentDetailsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

// --- Context Definition ---
export const Appcontext = createContext<AppContextValue>({} as AppContextValue);

interface Props {
  children: ReactNode;
}

const Appcontextprovider: React.FC<Props> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [chatData, setChatData] = useState<ChatItem[] | null>(null);
  const [messagesId, setMessagesId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any>(null);
  const [chatUser, setChatUser] = useState<UserData>(defaultChatUser);
  const [chatVisual, setChatVisual] = useState<boolean>(false);
  const [jobData, setJobData] = useState<Job | null>(null);
  const [jobDetailsVisible, setJobDetailsVisible] = useState(false);
  const [talentData, setTalentData] = useState<any>(null);
  const [talentDetailsVisible, setTalentDetailsVisible] = useState(false);

  useFirebaseAuth();

  // 1. Fixed loadUserData (Removed the internal interval conflict)
  const loadUserData = useCallback(async (uid: string): Promise<void> => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserData;
        setUserData({ ...data, id: uid });
        await updateDoc(userRef, { lastSeen: Date.now() });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  // 2. Fixed Heartbeat: Runs independently every 60 seconds
  useEffect(() => {
    if (!userData?.id) return;

    const userRef = doc(db, "users", userData.id);
    const intervalId = setInterval(async () => {
      if (auth.currentUser) {
        await updateDoc(userRef, { lastSeen: Date.now() });
      }
    }, 60000); // Increased to 60s to prevent network spam

    return () => clearInterval(intervalId);
  }, [userData?.id]);

  // 3. Optimized Chat Listener (Promise.all prevents the "keep on going" loop)
  useEffect(() => {
    if (!userData?.id) return;

    const chatRef = doc(db, "chats", userData.id);
    const unSub = onSnapshot(chatRef, async (res) => {
      const chatItems = res.data()?.chatsData || [];
      
      try {
        const tempData = await Promise.all(
          chatItems.map(async (item: any) => {
            const userRef = doc(db, "users", item.rId);
            const messageRef = doc(db, "messages", item.messageId);

            // Fetch both receiver data and messages in parallel
            const [userSnap, messageSnap] = await Promise.all([
              getDoc(userRef),
              getDoc(messageRef)
            ]);

            const userData = {
              ...(userSnap.data() as UserData),
              id: item.rId,
            };
            const messagesList = messageSnap.data()?.messages || [];
            const lastMsg = messagesList.length > 0 ? messagesList[messagesList.length - 1] : null;

            return {
              ...item,
              userData,
              lastMessageSender: lastMsg?.sId || "",
            };
          })
        );

        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (err) {
        console.error("Error fetching related chat docs:", err);
      }
    });

    return () => unSub();
  }, [userData?.id]);

  // 4. Memoize value to prevent re-render loops in consuming components
  const value = useMemo(() => ({
    userData, setUserData,
    chatData, setChatData,
    loadUserData,
    messages, setMessages,
    messagesId, setMessagesId,
    chatUser, setChatUser,
    chatVisual, setChatVisual,
    jobData, setJobData,
    jobDetailsVisible, setJobDetailsVisible,
    talentData, setTalentData,
    talentDetailsVisible, setTalentDetailsVisible,
  }), [
    userData, chatData, messages, messagesId, chatUser, 
    chatVisual, jobData, jobDetailsVisible, talentData, talentDetailsVisible, loadUserData
  ]);

  return <Appcontext.Provider value={value}>{children}</Appcontext.Provider>;
};

export default Appcontextprovider;
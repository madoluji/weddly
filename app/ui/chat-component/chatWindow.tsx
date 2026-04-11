"use client";

import { Suspense, use, useContext, useEffect, useState } from "react";
import ChatList from "./chatList";
import Image from "next/image";
import SafeImage from "@/app/ui/shared/SafeImage";
import { Appcontext } from "@/app/context/appContext";
import { db, upload } from "@/app/lib/firebase";
import {
  updateDoc,
  doc,
  arrayUnion,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  IdentificationIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  TagIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import UserProfileLoader from "@/app/lib/userProfileLoader";
import Link from "next/link";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";

interface Message {
  sId: string;
  text?: string;
  image?: string;
  createdAt: any;
  attachment?: {
    type: "proposalDetails" | "contractOffer" | "activeContract";
    data: any;
  };
}

const ChatWindow: React.FC = () => {
  const { userData, messagesId, chatUser, messages, setMessages, chatVisual } =
    useContext(Appcontext);

  const getAvatar = (user: any) =>
    user?.avatar || user?.profilePicture || "/images/image.png";
  const getDisplayName = (user: any) => user?.username || user?.name || "User";

  const [input, setInput] = useState("");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);

  useEffect(() => {
    if (!userData?.id || !chatUser?.id) return;

    // Reference to the user's chat document
    const userChatsRef = doc(db, "chats", userData.id);

    // Real-time listener
    const unsubscribe = onSnapshot(userChatsRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userChatData = docSnapshot.data();
        const chat = userChatData.chatsData.find(
          (c: { rId: string }) => c.rId === chatUser.id
        );

        setIsChatOpen(chat?.chatStatus === "open");
      }
    });

    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, [userData, chatUser]);

  const notifyNewMessage = async (textPreview: string) => {
    if (!userData?.id || !chatUser?.id || !messagesId) {
      return;
    }

    if (userData.id === chatUser.id) {
      return;
    }

    try {
      await fetchWithAuth("/api/notifications/new-message", {
        method: "POST",
        body: JSON.stringify({
          recipientId: chatUser.id,
          messageId: messagesId,
          textPreview,
          senderName: userData.username || userData.name || "Someone",
          senderAvatar: getAvatar(userData),
        }),
      });
    } catch (error) {
      console.warn("Failed to emit chat notification:", error);
    }
  };

  const sendMessage = async () => {
    try {
      if (input && messagesId && userData) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.id, userData.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c: { messageId: string }) => c.messageId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }

            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });

        await notifyNewMessage(input);
      }
    } catch (error) {
      console.error((error as any).message);
    }
    setInput("");
  };

  const sendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!userData) return;
      if (!e.target.files) return;
      const fileUrl = await upload(e.target.files[0]);
      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.id, userData.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c: { messageId: string }) => c.messageId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage = "Image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }

            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });

        await notifyNewMessage("Sent an image");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const convertTimestamp = (timestamp: any) => {
    let date;
    if (!timestamp) {
      console.log(timestamp);
      return;
    }
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === "number") {
      date = new Date(timestamp);
    } else if (timestamp && typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else {
      console.log(timestamp);
      throw new Error("Invalid timestamp", timestamp);
    }

    const hour = date.getHours();
    const minute = date.getMinutes();

    if (hour > 12) {
      return hour - 12 + ":" + minute + " PM";
    } else {
      return hour + ":" + minute + " AM";
    }
  };

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        const data = res.data();

        if (setMessages) {
          setMessages(data?.messages.reverse());
        }
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId, chatUser, setMessages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      sendMessage();
    }
  };

  const ProposalDetailsComponent = ({
    data,
    msg,
  }: {
    data: any;
    msg: Message;
  }) => (
    <div className="mt-3 w-full rounded-xl border border-yellow-300 overflow-hidden shadow-sm">
      <div className="bg-yellow-50 flex items-center justify-between border-b p-3 px-5 border-yellow-300">
        <div className=" flex items-start align-top gap-2  ">
          <DocumentTextIcon className="w-6 h-6 text-primary-700" />{" "}
          <p className="text-gray-700 font-medium text-lg">
            {msg.sId === userData?.id ? "" : "your "} Proposal
          </p>
        </div>
        <div className="text-xs text-gray-500">
          {convertTimestamp(msg?.createdAt)} •
        </div>
      </div>
      <div className="p-4 px-6 bg-white border-b border-yellow-200">
        <p className="text-xl mb-1 font-semibold text-gray-700 line-clamp-3">
          {data.jobId.title}
        </p>
        <div className="flex gap-4 mb-3">
          <p className="text-gray-500 text-sm items-center flex gap-1">
            <IdentificationIcon className="w-4 h-4" />
            {msg.sId === userData?.id
              ? `${userData?.username}`
              : `${chatUser.username}`}
          </p>
          <p className="text-gray-500 text-sm items-center flex gap-1">
            <TrophyIcon className="w-4 h-4" />
            {data.jobId.experience}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-primary-400 p-3 px-4 rounded-lg w-1/2">
            <p className="text-sm mb-1 flex items-center gap-2 text-gray-500">
              <span className="text-lg text-green-600">
                <CurrencyDollarIcon className="w-6 h-6" />
              </span>{" "}
              Booking Fee / Rate
            </p>
            <p className="text-green-700 text-xl ml-2"> $ {data.bidAmount}</p>
          </div>
          <div className="bg-gray-100 p-3 px-4 rounded-lg w-1/2">
            <p className="text-sm mb-1 flex items-center gap-2 text-gray-500">
              <span className="text-lg text-primary-700">
                <ClockIcon className="w-6 h-6" />
              </span>{" "}
              Gig Posted
            </p>
            <p className="text-green-700 text-xl ml-2">
              {" "}
              {new Date(data.jobId.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 px-6 bg-gray-50">
        <h4 className="font-semibold text-gray-700">Proposal Details</h4>

        <div className="mt-2">
          <p className="text-xs text-gray-500 font-medium mb-1">
            Cover Letter:
          </p>
          <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200 max-h-20 overflow-y-auto">
            {data.coverLetter}
          </p>
        </div>
        <div className="flex mt-5 gap-3 items-center justify-between mb-2">
          <div className="bg-green-100 p-3 px-4 rounded-lg w-1/2">
            <p className="text-sm mb-1 flex items-center gap-2 text-gray-500">
              <span className="text-lg text-green-600">
                <TagIcon className="w-6 h-6" />
              </span>{" "}
              Bid Amount
            </p>
            <p className="text-green-700 text-xl ml-2"> $ {data.bidAmount}</p>
          </div>
          <div className="bg-gray-100 p-3 px-4 rounded-lg w-1/2">
            <p className="text-sm mb-1 flex items-center gap-2 text-gray-500">
              <span className="text-lg text-primary-700">
                <ClockIcon className="w-6 h-6" />
              </span>{" "}
              Gig Posted
            </p>
            <p className="text-green-700 text-xl ml-2">
              {" "}
              {new Date(data.jobId.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="mt-5  text-right">
          <Link
            className="text-primary-500 underline font-medium mx-auto mb-1"
            href={
              userData?.id === msg.sId
                ? `/client/job-proposal/${data.jobId._id}`
                : `/user/your-proposals`
            }
          >
            View proposal
          </Link>
        </div>
      </div>
    </div>
  );

  const ContractOfferComponent = ({
    data,
    msg,
  }: {
    data: any;
    msg: Message;
  }) => (
    <div className="mt-3 w-full rounded-xl border border-blue-300 overflow-hidden shadow-sm">
      <div className="bg-blue-50 flex items-center justify-between border-b p-3 px-5 border-blue-300">
        <div className=" flex items-start align-top gap-2  ">
          <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-500" />{" "}
          <p className="text-gray-700 font-medium text-lg">
            {msg.sId === userData?.id
              ? "You send an contract offer"
              : "Congratulations! You just got an contract offer!"}
          </p>
        </div>
        <div className="text-xs text-gray-500">
          {convertTimestamp(msg?.createdAt)} •
        </div>
      </div>
      <div className="p-4 px-6 bg-white border-b border-blue-200">
        <div className="flex gap-4 mb-3">
          <div className="text-gray-500 text-2xl flex">
            <SafeImage
              src={
                msg.sId === userData?.id
                  ? userData.avatar || "/images/image.png"
                  : chatUser.avatar || "/images/image.png"
              }
              className={`object-cover h-16 w-16 mr-4 rounded-full`}
              alt="User avatar"
              width={100}
              height={100}
            />
            <div>
              {msg.sId === userData?.id
                ? `${userData?.username}`
                : `${chatUser.username}`}{" "}
              <br />
              <span className="text-sm">
                Offer send at: {convertTimestamp(msg.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-green-100 p-3 px-4 rounded-lg w-1/2">
            <p className="text-sm mb-1 flex items-center gap-2 text-gray-500">
              <span className="text-lg text-green-600">
                <CurrencyDollarIcon className="w-6 h-6" />
              </span>{" "}
              Offered Amount
            </p>
            <p className="text-green-700 text-xl ml-2"> $ {data.price}</p>
          </div>
          <div className="bg-danger-400 p-3 px-4 rounded-lg w-1/2">
            <p className="text-sm mb-1 flex items-center gap-2 text-gray-500">
              <span className="text-lg text-red-700">
                <ClockIcon className="w-6 h-6" />
              </span>{" "}
              Offer Expires in
            </p>
            <p className="text-red-700 text-xl ml-2">
              {new Date(data.expiration).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="bg-blue-100 mt-5 p-3 w-full px-4 rounded-lg">
          <p className="text-sm mb-1 flex items-center gap-2 text-gray-500">
            <span className="text-lg text-blue-700">
              <ClockIcon className="w-6 h-6" />
            </span>{" "}
            Project Deadline
          </p>
          <p className="text-blue-700 text-xl ml-2">
            {" "}
            {new Date(data.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}{" "}
          </p>
        </div>
        <div className="mt-5  text-right">
          <Link
            className="text-blue-500 underline font-medium mx-auto mb-1"
            href={
              userData?.id === msg.sId
                ? `/client/job-proposal/${data.jobId._id}`
                : `/user/offer/${data._id}/${data.jobId}`
            }
          >
            View offer
          </Link>
        </div>
      </div>
    </div>
  );

  const ActiveContractComponent = ({
    data,
    msg,
  }: {
    data: any;
    msg: Message;
  }) => (
    <div className="p-4 border rounded-lg shadow-sm bg-green-100">
      <h3 className="text-lg font-bold text-green-800">Active Contract</h3>
      <p className="text-sm text-gray-700">Project: {data.jobId.title}</p>
      <p className="text-sm text-gray-700">
        Status:{" "}
        <span className="text-green-700 font-semibold">{data.status}</span>
      </p>
      <div className="bg-danger-500 p-2 w-1/2 mt-5 gap-2 rounded-lg flex">
        <ClockIcon className="w-6 h-6" />
        Deadline: {new Date(data.deadline).toString()}
      </div>
      <div className="mt-2  text-right">
        <Link
          className="text-green-500 underline font-medium mx-auto mb-1"
          href={
            userData?.id === msg.sId
              ? `/user/your-contracts/${data._id}/${data.jobId._id}`
              : `/client/your-contracts/${data._id}/${data.jobId._id}`
          }
        >
          View Project
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <UserProfileLoader />
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Display Density
          </p>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                density === "compact"
                  ? "bg-primary-700 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => setDensity("comfortable")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                density === "comfortable"
                  ? "bg-primary-700 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Comfortable
            </button>
          </div>
        </div>

        <div className={`grid rounded-2xl border border-slate-200 bg-slate-50 lg:grid-cols-[300px_minmax(0,1fr)] ${density === "compact" ? "gap-2 p-2" : "gap-3 p-2 sm:p-3"}`}>
          <div className={`h-[calc(100vh-220px)] overflow-hidden rounded-2xl border border-slate-200 bg-white ${density === "compact" ? "min-h-[520px]" : "min-h-[560px]"}`}>
            <Suspense>
              <ChatList density={density} />
            </Suspense>
          </div>

          {chatUser?.id !== "0" ? (
            <div className={`flex h-[calc(100vh-220px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white ${density === "compact" ? "min-h-[520px]" : "min-h-[560px]"}`}>
              <div className={`flex items-center justify-between border-b border-slate-200 bg-white ${density === "compact" ? "px-3 py-2.5" : "px-4 py-3 sm:px-5"}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <SafeImage
                    src={getAvatar(chatUser)}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200"
                    alt="Chat user avatar"
                    width={40}
                    height={40}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                      {getDisplayName(chatUser)}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      Last seen {convertTimestamp(chatUser.lastSeen)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
                  {isChatOpen ? "Active" : "Closed"}
                </span>
              </div>

              <div className={`flex-1 overflow-y-auto ${density === "compact" ? "px-2.5 py-3" : "px-3 py-4 sm:px-4"}`}>
                <div className={`flex flex-col-reverse break-words ${density === "compact" ? "gap-2" : "gap-3"}`}>
                  {messages?.map((msg: Message, index: number) => (
                    <div
                      key={index}
                      className={`flex items-end gap-2 ${
                        msg.attachment
                          ? "justify-center"
                          : msg.sId === userData?.id
                            ? "justify-end"
                            : "justify-start"
                      }`}
                    >
                      {msg.sId !== userData?.id && !msg.attachment && (
                        <SafeImage
                          src={getAvatar(chatUser)}
                          className="h-8 w-8 rounded-full object-cover"
                          alt="User avatar"
                          width={32}
                          height={32}
                        />
                      )}

                      <div
                        className={`${density === "compact" ? "px-3 py-2" : "px-4 py-2.5"} ${
                          msg.attachment
                            ? "w-[92%]"
                            : msg.sId === userData?.id
                              ? "max-w-[75%] rounded-2xl rounded-br-md bg-primary-700 text-white"
                              : "max-w-[75%] rounded-2xl rounded-bl-md bg-slate-100 text-slate-800"
                        }`}
                      >
                        {msg.image ? (
                          <SafeImage
                            width={220}
                            height={220}
                            src={msg.image}
                            alt={"msg-image"}
                            className="rounded-lg"
                          />
                        ) : msg.attachment ? (
                          msg.attachment.type === "proposalDetails" ? (
                            <ProposalDetailsComponent data={msg.attachment.data} msg={msg} />
                          ) : msg.attachment.type === "contractOffer" ? (
                            <ContractOfferComponent data={msg.attachment.data} msg={msg} />
                          ) : msg.attachment.type === "activeContract" ? (
                            <ActiveContractComponent data={msg.attachment.data} msg={msg} />
                          ) : null
                        ) : (
                          <p className="break-words text-sm leading-6">{msg.text}</p>
                        )}
                      </div>

                      {msg.sId === userData?.id && !msg.attachment && (
                        <SafeImage
                          src={getAvatar(userData)}
                          className="h-8 w-8 rounded-full object-cover"
                          alt="User avatar"
                          width={32}
                          height={32}
                        />
                      )}

                      {!msg.attachment && (
                        <p className="text-[11px] text-slate-500">{convertTimestamp(msg.createdAt)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {isChatOpen ? (
                <div className={`border-t border-slate-200 bg-white ${density === "compact" ? "p-2.5" : "p-3 sm:p-4"}`}>
                  <div className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 ${density === "compact" ? "px-2.5 py-1.5" : "px-3 py-2"}`}>
                    <input
                      className={`w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 ${density === "compact" ? "h-9" : "h-10"}`}
                      onChange={(e) => setInput(e.target.value)}
                      value={input}
                      onKeyDown={handleKeyDown}
                      type="text"
                      placeholder="Type your message..."
                    />
                    <input
                      onChange={sendImage}
                      type="file"
                      id="image"
                      accept="image/png, image/jpeg"
                      hidden
                    />
                    <label htmlFor="image" className="cursor-pointer rounded-lg p-1.5 transition hover:bg-slate-200">
                      <PhotoIcon className="h-6 w-6 text-primary-700" />
                    </label>
                    <button
                      type="button"
                      onClick={sendMessage}
                      className="rounded-lg p-1.5 transition hover:bg-slate-200"
                      aria-label="Send message"
                    >
                      <PaperAirplaneIcon className="h-6 w-6 text-primary-700" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-200 bg-white px-4 py-5 text-center text-sm font-medium text-slate-600">
                  This chat is no longer available for you to send messages.
                </div>
              )}
            </div>
          ) : (
            <div className={`chat-welcome rounded-2xl border border-slate-200 bg-white ${chatVisual ? "" : "hidden"}`}>
              <Image
                src={"/logo/weddlylogo-v2.png"}
                width={32}
                height={32}
                alt={"logo"}
              />
              <p>Chat anytime, anywhere</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatWindow;

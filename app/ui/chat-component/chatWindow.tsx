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

  const [input, setInput] = useState("");

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
          senderAvatar: userData.avatar || null,
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
      <div className="w-full p-5">
        <div className="flex flex-row gap-5 justify-between bg-white">
          <div className="w-1/3 h-[calc(100vh-120px)] relative rounded-3xl shadow-[0_10px_20px_rgba(228,228,228,_0.7)] overflow-hidden">
            <Suspense>
              <ChatList />
            </Suspense>
          </div>

          {chatUser.id !== "0" ? (
            <>
              <div className=" w-full rounded-3xl overflow-scroll h-[calc(100vh-120px)] shadow-[0_10px_20px_rgba(228,228,228,_0.7)] flex flex-col justify-between">
                <div className="flex break-words flex-col-reverse mt-5">
                  {messages?.map((msg: Message, index: number) => (
                    <div
                      key={index}
                      className={`flex mb-4 items-center ${
                        msg.attachment
                          ? "justify-center"
                          : msg.sId === userData?.id
                            ? "justify-end"
                            : "justify-end flex-row-reverse"
                      } `}
                    >
                      <div
                        className={`py-3 px-4 text-white ${
                          msg.attachment
                            ? "w-5/6"
                            : msg.sId === userData?.id
                              ? "bg-primary-500 mr-2 rounded-bl-3xl max-w-md rounded-tl-3xl rounded-tr-xl"
                              : "bg-gray-300 ml-2 rounded-br-3xl rounded-tr-3xl max-w-md rounded-tl-xl"
                        }`}
                      >
                        {msg.image ? (
                          <SafeImage
                            width={200}
                            height={200}
                            src={msg.image}
                            alt={"msg-image"}
                          />
                        ) : msg.attachment ? (
                          msg.attachment.type === "proposalDetails" ? (
                            <ProposalDetailsComponent
                              data={msg.attachment.data}
                              msg={msg}
                            />
                          ) : msg.attachment.type === "contractOffer" ? (
                            <ContractOfferComponent
                              data={msg.attachment.data}
                              msg={msg}
                            />
                          ) : msg.attachment.type === "activeContract" ? (
                            <ActiveContractComponent
                              data={msg.attachment.data}
                              msg={msg}
                            />
                          ) : null
                        ) : (
                          <p className="msg break-words">{msg.text}</p>
                        )}
                      </div>
                      <SafeImage
                        src={
                          msg.sId === userData?.id
                            ? userData.avatar || "/images/image.png"
                            : chatUser.avatar || "/images/image.png"
                        }
                        className={`${msg.attachment ? "hidden" : ""} object-cover h-8 w-8 rounded-full`}
                        alt="User avatar"
                        width={32}
                        height={32}
                      />
                      <p
                        className={`text-sm mx-2 ${msg.attachment ? "hidden" : ""}`}
                      >
                        {convertTimestamp(msg.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>

                {isChatOpen === true ? (
                  <div className="py-5  flex items-center bottom-0 sticky bg-white w-full px-5">
                    <input
                      className="w-full bg-gray-200 py-5 px-3 rounded-xl"
                      onChange={(e) => setInput(e.target.value)}
                      value={input}
                      onKeyDown={handleKeyDown}
                      type="text"
                      placeholder="Type your message here..."
                    />
                    <input
                      onChange={sendImage}
                      type="file"
                      id="image"
                      accept="image/png, image/jpeg"
                      hidden
                    />
                    <label htmlFor="image">
                      <PhotoIcon className="w-8 h-8 top-0 " />
                    </label>
                    <span onClick={sendMessage}>
                      <PaperAirplaneIcon className="w-8 h-8 top-0 " />
                    </span>
                  </div>
                ) : (
                  <div className="py-5 flex items-center justify-center bottom-0 sticky text-center text-primary-500 bg-white w-full px-5">
                    This chat is no longer available for you to send messages.
                  </div>
                )}
              </div>

              <div className="w-2/5 border-l-2 px-5">
                <div className="flex flex-col">
                  <div className="font-semibold text-xl py-4 ">
                    {chatUser.username}
                  </div>
                  <SafeImage
                    src={chatUser.avatar || "/images/image.png"}
                    className="object-cover rounded-full"
                    alt="Group image"
                    width={200}
                    height={200}
                  />
                  <div className="font-semibold py-4  text-neutral-400">
                    Last seen {convertTimestamp(chatUser.lastSeen)}
                  </div>
                  <div className="font-light"></div>
                </div>
              </div>
            </>
          ) : (
            <div className={`chat-welcome ${chatVisual ? "" : "hidden"}`}>
              <Image
                src={"/logo/weddlylogo-v2.png"}
                width={32}
                height={32}
                alt={"logo"}
              />
              <p>chat anytime, anywhere</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatWindow;

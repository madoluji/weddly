"use client";

import React, { useContext, useState } from "react";
import JobDetails from "./job-details";
import Terms from "./term";
import Expiration from "./expiration";
import Deadline from "./deadline";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Button } from "../button";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import FreelancerDetail from "./freelancer-details";
import Alert from "../alert";
import { Appcontext } from "@/app/context/appContext";
import proposal from "@/models/proposal";
import { log } from "console";
import UserProfileLoader from "@/app/lib/userProfileLoader";

interface OfferFormProps {
  jobId: string;
  freelancerId: string;
}

const OfferForm = ({ jobId, freelancerId }: OfferFormProps) => {
  const [pricingType, setPricingType] = useState<string>(""); // Pricing Model
  const [bidAmount, setBidAmount] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [expiration, setExpiration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  interface UserData {
    id: string;
  }

  const { userData, chatData } = useContext(Appcontext);

  const sendContractToChat = async (proposal: any) => {
    try {
      const { freelancerId, paymentType, deadline } = proposal;

      const messagesRef = collection(db, "messages");
      const chatsRef = collection(db, "chats");

      // Check if chat exists
      const chatExists = chatData?.find((chat) => chat.rId === freelancerId);

      let chatId = chatExists?.messageId;

      const initialMessage = `New contract offer: ${paymentType}, Deadline: ${deadline}`;

      if (!chatExists) {
        // Create new chat
        const newMessageRef = doc(messagesRef);

        await setDoc(newMessageRef, {
          createdAt: serverTimestamp(),
          messages: [
            {
              sId: userData?.id,
              text: initialMessage,
              createdAt: Date.now(),
            },
            {
              sId: userData?.id,
              attachment: {
                type: "contractOffer",
                data: proposal,
              },
              createdAt: Date.now(),
            },
          ],
        });

        chatId = newMessageRef.id;
        await updateDoc(doc(chatsRef, userData?.id), {
          chatsData: arrayUnion({
            messageId: chatId,
            lastMessage: initialMessage,
            rId: freelancerId,
            updateDoc: Date.now(),
            messageSeen: false,
            // contractArray: [proposal._id],
            chatStatus: "open",
          }),
        });

        await updateDoc(doc(chatsRef, freelancerId), {
          chatsData: arrayUnion({
            messageId: chatId,
            lastMessage: initialMessage,
            rId: userData?.id,
            updateDoc: Date.now(),
            messageSeen: false,
            chatStatus: "open",
            // contractArray: [proposal._id],
          }),
        });
      } // Send contract details to the chat
      else {
        await updateDoc(doc(db, "messages", chatId), {
          messages: arrayUnion(
            {
              sId: userData?.id,
              text: initialMessage,
              createdAt: new Date(),
            },
            {
              sId: userData?.id,
              text: `Contract details:\nBid: $${paymentType}\nDeadline: ${deadline}`,
              attachment: {
                type: "contractOffer",
                data: proposal,
              },
              createdAt: new Date(),
            }
          ),
        });

        //add active contractid in the chatData
        const userIDs = [freelancerId, userData?.id];

        userIDs.forEach(async (id) => {
          // Reference to the chat document
          const selectedUserChatRef = doc(chatsRef, id);

          // Fetch the existing chat document
          const UserChatSnap = await getDoc(selectedUserChatRef);

          if (UserChatSnap.exists()) {
            const UserChatData = UserChatSnap.data();

            // Find the chat with matching messageId
            const chatIndex = UserChatData.chatsData.findIndex(
              (c: any) => c.messageId === chatId
            );

            if (chatIndex !== -1) {
              // Clone the chatsData array to avoid direct mutation
              let updatedChatsData = [...UserChatData.chatsData];

              // Ensure proposalArray exists, then push the new proposal ID
              // updatedChatsData[chatIndex].ContractArray = [
              //   ...(updatedChatsData[chatIndex].ContractArray || []), // Default to empty array if it doesn't exist
              //   proposal?._id,
              // ];

              // Update other fields
              updatedChatsData[chatIndex].updatedAt = Date.now();
              updatedChatsData[chatIndex].messageSeen = false;
              updatedChatsData[chatIndex].lastMessage = initialMessage;
              updatedChatsData[chatIndex].chatStatus = "open";

              // Save back to Firestore
              await updateDoc(selectedUserChatRef, {
                chatsData: updatedChatsData,
              });
            }
          }
        });
      }

      console.log(`Contract sent to chat ${chatId}`);
    } catch (error) {
      console.error("Error sending contract to chat:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAlert(null); // Reset alerts

    if (!bidAmount.trim() || !deadline) {
      setAlert({ type: "error", message: "Please fill all required fields!" });
      setIsSubmitting(false);
      return;
    }

    try {
      const proposalData = {
        jobId,
        freelancerId,
        bidAmount,
        deadline,
        pricingType,
        expiration,
      };

      const response = await fetchWithAuth(`/api/submit-offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposalData),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      const { Contract } = await response.json();
      console.log("contrat send to func", Contract);
      await sendContractToChat(Contract);
      setAlert({
        type: "success",
        message: "Offer send successfully!",
      });
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.message || "Failed to submit proposal",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="w-full flex gap-10 flex-col">
      <UserProfileLoader />
      <p className="text-left text-4xl font-medium">Make an Offer</p>
      {/* Display alert */}
      <FreelancerDetail freelancerId={freelancerId} />
      <JobDetails jobId={jobId} />
      <form onSubmit={handleSubmit} className="flex gap-10 flex-col">
        <Terms
          bidAmount={bidAmount}
          setBidAmount={setBidAmount}
          isSubmitted={isSubmitted}
          pricingType={pricingType}
          setPricingType={setPricingType}
        />

        <Deadline
          deadline={deadline}
          setDeadline={setDeadline}
          isSubmitted={false}
        />

        <Expiration
          expiration={expiration}
          setExpiration={setExpiration}
          isSubmitted={isSubmitted}
        />

        <Button
          type="submit"
          className={` text-white  ${isSubmitting ? "bg-gray-400" : ""}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Offer Contract"}
        </Button>
      </form>
      {alert && <Alert type={alert.type} message={alert.message} />}{" "}
    </div>
  );
};

export default OfferForm;

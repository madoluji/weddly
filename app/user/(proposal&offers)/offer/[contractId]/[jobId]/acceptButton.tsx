"use client";
import { Appcontext } from "@/app/context/appContext";
import useFetch from "@/app/hooks/useFetch";
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth";
import { db } from "@/app/lib/firebase";
import UserProfileLoader from "@/app/lib/userProfileLoader";
import { Button } from "@/app/ui/button";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import {
  collection,
  updateDoc,
  doc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import React, { useContext, useState } from "react";

interface Props {
  jobId: string;
  freelancerId?: string;
  contractId?: string;
}

//use either freelancerId or userData.id same in this case

const AcceptButton = ({ jobId, freelancerId, contractId }: Props) => {
  const { data: actions = [], loading } = useFetch<string[]>(
    `/check-action?jobId=${jobId}&freelancerId=${freelancerId}`
  );

  const { userData, chatData } = useContext(Appcontext);

  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);

  const sendContractToChat = async (contract: any) => {
    try {
      const { clientId, paymentType, deadline } = contract;
      console.log("con", contract);
      console.log("chaData", chatData);

      const chatsRef = collection(db, "chats");

      // retrive chat id
      const chatExists = chatData?.find((chat) => chat.rId === clientId);

      const initialMessage = "Looking forward to work with you";

      await updateDoc(doc(db, "messages", chatExists?.messageId), {
        messages: arrayUnion(
          {
            sId: userData?.id,
            text: initialMessage,
            createdAt: new Date(),
          },
          {
            sId: userData?.id,
            text: `Contract details:\nPrice: $${paymentType}\nDeadline: ${deadline}`,
            attachment: {
              type: "activeContract",
              data: contract,
            },
            createdAt: new Date(),
          }
        ),
      });

      //add active contractid in the chatData
      const userIDs = [clientId, userData?.id];

      userIDs.forEach(async (id) => {
        // Reference to the chat document
        const selectedUserChatRef = doc(chatsRef, id);

        // Fetch the existing chat document
        const UserChatSnap = await getDoc(selectedUserChatRef);

        if (UserChatSnap.exists()) {
          const UserChatData = UserChatSnap.data();

          // Find the chat with matching messageId
          const chatIndex = UserChatData.chatsData.findIndex(
            (c: any) => c.messageId === chatExists?.messageId
          );

          if (chatIndex !== -1) {
            // Clone the chatsData array to avoid direct mutation
            let updatedChatsData = [...UserChatData.chatsData];

            // Ensure contractArray exists, then push the new contract ID
            updatedChatsData[chatIndex].ContractArray = [
              ...(updatedChatsData[chatIndex].ContractArray || []), // Default to empty array if it doesn't exist
              contract?._id,
            ];

            // Update other fields
            updatedChatsData[chatIndex].updatedAt = Date.now();
            updatedChatsData[chatIndex].messageSeen = false;
            updatedChatsData[chatIndex].lastMessage = initialMessage;

            // Save back to Firestore
            await updateDoc(selectedUserChatRef, {
              chatsData: updatedChatsData,
            });
          }
        }
      });
    } catch (error) {
      console.error("Error sending contract to chat:", error);
    }
  };

  const handleAccept = async () => {
    try {
      // Call the API to accept the contract
      const response = await fetchWithAuth("/api/contract-action", {
        method: "PATCH",
        body: JSON.stringify({
          contractId,
          userId: freelancerId,
          newStatus: "active",
        }),
      });

      if (response.ok) {
        // Handle successful acceptance
        const { contract } = await response.json();
        sendContractToChat(contract);
        setIsAcceptDialogOpen(false);
        alert("Contract accepted successfully!");
      } else {
        // Handle error case
        alert("Failed to accept the contract. Please try again.");
      }
    } catch (error) {
      console.error("Error accepting contract:", error);
      alert("An error occurred while accepting the contract.");
    }
  };

  const handleDecline = async () => {
    try {
      // Call the API to decline the contract
      const response = await fetchWithAuth("/api/contract-action", {
        method: "PATCH",
        body: JSON.stringify({
          jobId,
          userId: freelancerId,
          newStatus: "declined",
        }),
      });

      if (response.ok) {
        // Handle successful decline
        setIsDeclineDialogOpen(false);
        alert("Contract declined successfully!");
      } else {
        // Handle error case
        alert("Failed to decline the contract. Please try again.");
      }
    } catch (error) {
      console.error("Error declining contract:", error);
      alert("An error occurred while declining the contract.");
    }
  };
  if (loading) return <p>Loading...</p>;

  return (
    <div className="py-2 space-y-3 mb-4">
      <UserProfileLoader />
      {Array.isArray(actions) && actions.includes("proposal_submitted") ? (
        <span className="">You&apos;ve taken action for this offer</span>
      ) : (
        <>
          <Button
            className="w-full text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            onClick={() => setIsAcceptDialogOpen(true)}
          >
            Accept Offer
          </Button>

          <Button
            outline={true}
            danger={true}
            className="w-full font-medium py-2 px-4 rounded-md border hover:bg-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            onClick={() => setIsDeclineDialogOpen(true)}
          >
            Decline Offer
          </Button>
        </>
      )}

      {/* Accept Dialog */}
      {isAcceptDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Accept Contract Offer</h3>
              <p className="text-gray-500 mt-1">
                Are you sure you want to accept this contract offer? Once
                accepted, you will be committed to the terms and conditions
                outlined in the contract.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <div className="flex items-start">
                <div className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800">
                    Binding Agreement
                  </h4>
                  <p className="mt-1 text-sm text-blue-700">
                    By accepting this offer, you acknowledge that you are
                    entering into a legally binding agreement. You will be
                    obligated to fulfill all requirements and deliverables as
                    specified in the contract terms above.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setIsAcceptDialogOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                className="px-4 py-2 rounded-md text-white font-medium text-sm hover:bg-primary-700"
              >
                Confirm & Accept
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Dialog */}
      {isDeclineDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Decline Contract Offer</h3>
              <p className="text-gray-500 mt-1">
                Are you sure you want to decline this contract offer? This
                action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setIsDeclineDialogOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDecline}
                className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700 font-medium text-sm"
              >
                Confirm & Decline
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptButton;

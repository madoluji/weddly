"use client"

import type React from "react"
import { useContext, useEffect, useState, useRef } from "react"
import {
  XMarkIcon,
  PaperClipIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  ArrowTopRightOnSquareIcon,
  UserCircleIcon,
  StarIcon,
  ArrowPathIcon,
  CalendarIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline"
import { fetchWithAuth } from "@/app/lib/fetchWIthAuth"
import Link from "next/link"
import { db } from "@/app/lib/firebase"
import { serverTimestamp } from "firebase/database"
import { collection, doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore"
import { Appcontext } from "@/app/context/appContext"
import Image from "next/image"

interface Proposal {
  _id: string
  jobId: {
    _id: string
  }
  userId: string
  clientId: string
  attachments: string
  coverLetter: string
  bidAmount: number
  createdAt: string
}

interface Freelancer {
  userId: string
  fullName: string
  profilePicture: string
  skills?: string[]
  rating?: number
  jobSuccess?: number
}

interface JobProposalModalProps {
  proposal: Proposal
  onClose: () => void
}

interface UserData {
  id: string
}

type ChatDataItem = {
  messageId: string
  lastMessage: string
  rId: string
  updateDoc: number
  messageSeen: boolean
  userData: UserData
  user: UserData
  lastMessageSender?: string
  proposalArray?: [proposalId: string]
}

const JobProposalModal: React.FC<JobProposalModalProps> = ({ proposal, onClose }) => {
  interface AppContextValue {
    userData: UserData | null
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
    chatData: ChatDataItem[] | null
    setChatData: React.Dispatch<React.SetStateAction<ChatDataItem[] | null>>
    loadUserData: (uid: string) => Promise<void>
    messages: any // Replace `any` with a specific type if possible
    setMessages: React.Dispatch<React.SetStateAction<any>>
    messagesId: string | null
    setMessagesId: React.Dispatch<React.SetStateAction<string | null>>
  }

  const context = useContext(Appcontext) as AppContextValue
  const { userData, chatData } = context
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null)
  const [showMessageInput, setShowMessageInput] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        setIsLoading(true)
        const response = await fetchWithAuth(`/api/freelancers?userId=${proposal.userId}`)
        const data = await response.json()
        setFreelancer(data.freelancer)
      } catch (error) {
        console.error("Error fetching freelancer data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFreelancer()

    // Handle escape key press
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showMessageInput) {
          setShowMessageInput(false)
        } else {
          onClose()
        }
      }
    }

    // Prevent scrolling on body when modal is open
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleEscapeKey)

    return () => {
      document.body.style.overflow = "auto"
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [proposal.userId, onClose, showMessageInput])

  useEffect(() => {
    // Focus the message input when it appears
    if (showMessageInput && messageInputRef.current) {
      messageInputRef.current.focus()
    }
  }, [showMessageInput])

  interface ChatData {
    messageId: string
    lastMessage: string
    rId: string
    updateDoc: number
    messageSeen: boolean
  }

  const addChat = async (selectedUser: string | undefined, proposal?: Proposal) => {
    if (!selectedUser || !userData?.id || !message.trim()) {
      return
    }

    try {
      setIsSending(true)
      const messagesRef = collection(db, "messages")
      const chatsRef = collection(db, "chats")

      const conversationExists = chatData?.find((chat: ChatData) => chat.rId === selectedUser)

      if (conversationExists) {
        const eMessageId = conversationExists.messageId

        const proposalExists = conversationExists.proposalArray?.find((pId) => {
          return pId === proposal?._id
        })

        if (!proposalExists) {
          await updateDoc(doc(db, "messages", eMessageId), {
            messages: arrayUnion({
              sId: userData?.id,
              text: message,
              createdAt: new Date(),
            }),
          })
          await updateDoc(doc(db, "messages", eMessageId), {
            messages: arrayUnion({
              sId: userData?.id,
              attachment: {
                type: "proposalDetails",
                data: proposal,
              },
              createdAt: new Date(),
            }),
          })

          const userIDs = [freelancer?.userId, userData.id]

          userIDs.forEach(async (id) => {
            // Reference to the chat document
            const selectedUserChatRef = doc(chatsRef, id)

            // Fetch the existing chat document
            const UserChatSnap = await getDoc(selectedUserChatRef)

            if (UserChatSnap.exists()) {
              const UserChatData = UserChatSnap.data()

              // Find the chat with matching messageId
              const chatIndex = UserChatData.chatsData.findIndex((c: ChatData) => c.messageId === eMessageId)

              if (chatIndex !== -1) {
                // Clone the chatsData array to avoid direct mutation
                const updatedChatsData = [...UserChatData.chatsData]

                // Ensure proposalArray exists, then push the new proposal ID
                updatedChatsData[chatIndex].proposalArray = [
                  ...(updatedChatsData[chatIndex].proposalArray || []), // Default to empty array if it doesn't exist
                  proposal?._id,
                ]

                // Update other fields
                updatedChatsData[chatIndex].chatStatus = "open";
                updatedChatsData[chatIndex].lastMessage = message;
                updatedChatsData[chatIndex].updatedAt = Date.now();
                updatedChatsData[chatIndex].messageSeen = false;

                // Save back to Firestore
                await updateDoc(selectedUserChatRef, {
                  chatsData: updatedChatsData,
                })
              }
            }
          })
        }
      } else {
        const newMessageRef = doc(messagesRef)
        await setDoc(newMessageRef, {
          createAt: serverTimestamp(),
          messages: [
            {
              sId: userData.id,
              text: message,
              createdAt: Date.now(),
            },
          ],
        })

        await updateDoc(doc(db, "messages", newMessageRef.id), {
          messages: arrayUnion({
            sId: userData.id,
            attachment: {
              type: "proposalDetails",
              data: proposal,
            },
            createdAt: new Date(),
          }),
        })

        // Update both users' chat collections
        await updateDoc(doc(chatsRef, selectedUser), {
          chatsData: arrayUnion({
            messageId: newMessageRef.id,
            lastMessage: message,
            rId: userData?.id,
            updateDoc: Date.now(),
            messageSeen: false,
            chatStatus: "open",
            proposalArray: proposal?._id ? [proposal._id] : [],
          }),
        })

        await updateDoc(doc(chatsRef, userData?.id), {
          chatsData: arrayUnion({
            messageId: newMessageRef.id,
            lastMessage: message,
            rId: selectedUser,
            updateDoc: Date.now(),
            messageSeen: true,
            chatStatus: "open",
            proposalArray: proposal?._id ? [proposal._id] : [],
          }),
        })
      }

      setShowMessageInput(false)
      setMessage("")
    } catch (error) {
      console.error("Error creating chat:", error)
    } finally {
      setIsSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center">
            <DocumentTextIcon className="w-6 h-6 mr-3" />
            <h2 className="text-xl font-bold">Proposal Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <ArrowPathIcon className="h-10 w-10 text-primary-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {/* Freelancer Info */}
                <div className="md:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-50 to-primary-300 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-primary-800 flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        Freelancer
                      </h3>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col items-center text-center">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary-100 to-primary-200 overflow-hidden mb-3 ring-2 ring-primary-100 ring-offset-2">
                          {freelancer?.profilePicture ? (
                            <Image
                              src={freelancer.profilePicture || "/placeholder.svg"}
                              alt={freelancer.fullName}
                              width={80}
                              height={80}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserCircleIcon className="h-20 w-20 text-primary-300" />
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{freelancer?.fullName}</h3>

                        <div className="flex items-center justify-center mt-2 space-x-4">
                          {freelancer?.rating && (
                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                              <StarIcon className="w-4 h-4 text-yellow-500" />
                              <span className="ml-1 text-sm font-medium text-yellow-700">
                                {freelancer.rating.toFixed(1)}
                              </span>
                            </div>
                          )}

                          {freelancer?.jobSuccess && (
                            <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
                              <CheckBadgeIcon className="w-4 h-4 text-green-500" />
                              <span className="ml-1 text-sm font-medium text-green-700">{freelancer.jobSuccess}%</span>
                            </div>
                          )}
                        </div>

                        {freelancer?.skills && freelancer.skills.length > 0 && (
                          <div className="mt-4 w-full">
                            <p className="text-sm text-gray-500 mb-2 font-medium">Skills</p>
                            <div className="flex flex-wrap justify-center gap-1">
                              {freelancer.skills.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full border border-primary-100"
                                >
                                  {skill}
                                </span>
                              ))}
                              {freelancer.skills.length > 3 && (
                                <span className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded-full border border-gray-200">
                                  +{freelancer.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-5 w-full">
                          <button
                            onClick={() => setShowMessageInput(true)}
                            className="w-full flex items-center justify-center px-4 py-2 border border-primary-300 rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
                          >
                            <EnvelopeIcon className="w-4 h-4 mr-2" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proposal Details */}
                <div className="md:col-span-2 space-y-5">
                  {/* Bid Information */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-50 to-primary-300 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-primary-800 flex items-center">
                        <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                        Bid Details
                      </h3>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Bid Amount</p>
                            <p className="text-2xl font-bold text-green-600">₹{proposal.bidAmount.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                            <CalendarIcon className="h-6 w-6 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Submitted On</p>
                            <p className="text-sm font-medium text-gray-900">{formatDate(proposal.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      {proposal.attachments && (
                        <div className="mt-5 pt-5 border-t border-gray-100">
                          <a
                            href={proposal.attachments}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                          >
                            <PaperClipIcon className="h-5 w-5 mr-2" />
                            View Attachment
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-50 to-primary-300 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-primary-800 flex items-center">
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Cover Letter
                      </h3>
                    </div>

                    <div className="p-5">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-gray-700 whitespace-pre-line">{proposal.coverLetter}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-5 bg-gray-50 flex flex-wrap gap-4 justify-end">
              <Link
                href={`/client/job-proposal/${proposal.jobId._id}/offer/${proposal.userId}/new`}
                className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <CheckBadgeIcon className="h-5 w-5 mr-2" />
                Hire Freelancer
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Message Input Modal */}
      {showMessageInput && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="text-lg font-bold flex items-center">
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Message to {freelancer?.fullName}
              </h3>
              <button
                onClick={() => setShowMessageInput(false)}
                className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">
                  Your message will start a conversation with this freelancer
                </p>
              </div>

              <textarea
                ref={messageInputRef}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none h-32"
                placeholder="Type your message to the freelancer..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setShowMessageInput(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addChat(freelancer?.userId, proposal)}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!message.trim() || isSending}
                >
                  {isSending ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>Send Message</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobProposalModal


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
import SafeImage from "@/app/ui/shared/SafeImage"

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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6 py-5">
          <div className="flex items-center">
            <div className="mr-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <DocumentTextIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">
                Proposal review
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Proposal Details</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="min-w-0">
                  <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                      <h3 className="flex items-center font-semibold text-slate-900">
                        <UserIcon className="mr-2 h-4 w-4 text-primary-700" />
                        Freelancer
                      </h3>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-3 h-20 w-20 overflow-hidden rounded-full bg-primary-100 ring-2 ring-primary-100 ring-offset-2">
                          {freelancer?.profilePicture ? (
                            <SafeImage
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

                        <div className="mt-2 flex items-center justify-center space-x-4">
                          {freelancer?.rating && (
                            <div className="flex items-center rounded-full bg-primary-50 px-2 py-1">
                              <StarIcon className="h-4 w-4 text-primary-600" />
                              <span className="ml-1 text-sm font-medium text-primary-700">
                                {freelancer.rating.toFixed(1)}
                              </span>
                            </div>
                          )}

                          {freelancer?.jobSuccess && (
                            <div className="flex items-center rounded-full bg-slate-100 px-2 py-1">
                              <CheckBadgeIcon className="h-4 w-4 text-slate-600" />
                              <span className="ml-1 text-sm font-medium text-slate-700">{freelancer.jobSuccess}%</span>
                            </div>
                          )}
                        </div>

                        {freelancer?.skills && freelancer.skills.length > 0 && (
                          <div className="mt-4 w-full">
                            <p className="mb-2 text-sm font-medium text-gray-500">Skills</p>
                            <div className="flex flex-wrap justify-center gap-1">
                              {freelancer.skills.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="rounded-full border border-primary-100 bg-primary-50 px-2 py-1 text-xs text-primary-700"
                                >
                                  {skill}
                                </span>
                              ))}
                              {freelancer.skills.length > 3 && (
                                <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">
                                  +{freelancer.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-5 w-full">
                          <button
                            onClick={() => setShowMessageInput(true)}
                            className="flex w-full items-center justify-center rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-primary-700 transition hover:bg-primary-100"
                          >
                            <EnvelopeIcon className="mr-2 h-4 w-4" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 space-y-5">
                  <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                      <h3 className="flex items-center font-semibold text-slate-900">
                        <CurrencyDollarIcon className="mr-2 h-4 w-4 text-primary-700" />
                        Bid Details
                      </h3>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-center">
                          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                            <CurrencyDollarIcon className="h-6 w-6 text-primary-700" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Bid Amount</p>
                            <p className="text-2xl font-bold text-primary-700">₹{proposal.bidAmount.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
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
                            className="inline-flex items-center rounded-xl bg-primary-50 px-4 py-2.5 text-primary-700 transition hover:bg-primary-100"
                          >
                            <PaperClipIcon className="h-5 w-5 mr-2" />
                            View Attachment
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                      <h3 className="flex items-center font-semibold text-slate-900">
                        <DocumentTextIcon className="mr-2 h-4 w-4 text-primary-700" />
                        Cover Letter
                      </h3>
                    </div>

                    <div className="p-5">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-gray-700 whitespace-pre-line">{proposal.coverLetter}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-4 border-t border-slate-200 bg-slate-50 p-5">
              <Link
                href={`/client/job-proposal/${proposal.jobId._id}/offer/${proposal.userId}/new`}
                className="inline-flex items-center rounded-xl bg-primary-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-800"
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
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="flex items-center text-lg font-semibold text-slate-900">
                <EnvelopeIcon className="mr-2 h-5 w-5 text-primary-700" />
                Message to {freelancer?.fullName}
              </h3>
              <button
                onClick={() => setShowMessageInput(false)}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
                className="h-32 w-full resize-none rounded-xl border border-gray-300 p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                placeholder="Type your message to the freelancer..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => setShowMessageInput(false)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addChat(freelancer?.userId, proposal)}
                  className="rounded-xl bg-primary-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
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

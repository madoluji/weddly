import ChatWindow from "@/app/ui/chat-component/chatWindow";
import React from "react";

const ChatRoom = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  return <ChatWindow />;
};

export default ChatRoom;

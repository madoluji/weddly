import ChatWindow from "@/app/ui/chat-component/chatWindow";
import React from "react";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

const ChatRoom = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <PageShell
      title="Chatroom"
      description="Continue your conversations and collaboration from one place"
    >
      <PageCard className="p-2 sm:p-4">
        <ChatWindow key={id} />
      </PageCard>
    </PageShell>
  );
};

export default ChatRoom;

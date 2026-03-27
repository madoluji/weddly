import ChatWindow from "@/app/ui/chat-component/chatWindow";

const ChatRoom = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <ChatWindow />;
};

export default ChatRoom;

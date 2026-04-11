import ChatWindow from "@/app/ui/chat-component/chatWindow";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

const ChatRoom = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <PageShell
      title="Chatroom"
      description="Continue your conversations and manage collaboration in one place"
    >
      <PageCard className="p-0">
        <ChatWindow key={id} />
      </PageCard>
    </PageShell>
  );
};

export default ChatRoom;

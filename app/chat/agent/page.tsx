import ChatBox from "@/components/ChatBox";

export default function AgentPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <ChatBox userType="agent" />
    </div>
  );
}

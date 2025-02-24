import ChatBox from "@/components/ChatBox";

export default function CustomerPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <ChatBox userType="customer" />
    </div>
  );
}

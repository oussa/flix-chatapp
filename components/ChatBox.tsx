// "use client";
// import { useEffect, useState, useRef } from "react";
// import { socket } from "@/lib/sockett";
// import Message from "@/components/Message";

// const ChatBox = ({ userType }: { userType: "customer" | "agent" }) => {
//   const [messages, setMessages] = useState<{ sender: string; message: string }[]>([]);
//   const [message, setMessage] = useState("");
//   const [typing, setTyping] = useState(false);
//   const [conversationResolved, setConversationResolved] = useState(false);
//   const conversationId = "42"; // Replace with actual conversation ID from API
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     socket.emit(`${userType}:join`, { conversationId });

//     // Listen for new messages and update UI
//     socket.on("server:newMessage", (newMessage) => {
//       setMessages((prev) => [...prev, newMessage]);
//     });

//     // Listen for conversation updates (latest message, unread status)
//     socket.on("server:conversationUpdated", ({ latestMessage }) => {
//       console.log(`Latest message: ${latestMessage}`);
//     });

//     // Handle typing indicators
//     socket.on("server:customerTyping", () => {
//       if (userType === "agent") setTyping(true);
//     });

//     socket.on("server:agentTyping", () => {
//       if (userType === "customer") setTyping(true);
//     });

//     // Clear typing status after a delay
//     const typingTimeout = setTimeout(() => setTyping(false), 2000);

//     // Handle conversation resolution
//     socket.on("server:conversationResolved", () => {
//       setConversationResolved(true);
//       setMessages([]); // Clear messages when conversation is resolved
//     });

//     // Handle errors
//     socket.on("server:error", (errorMessage) => {
//       console.error("Chat error:", errorMessage);
//     });

//     return () => {
//       socket.off("server:newMessage");
//       socket.off("server:conversationUpdated");
//       socket.off("server:customerTyping");
//       socket.off("server:agentTyping");
//       socket.off("server:conversationResolved");
//       socket.off("server:error");
//       clearTimeout(typingTimeout);
//     };
//   }, [userType]);

//   // Ensure the latest message is always visible
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!message.trim() || conversationResolved) return;

//     // Add the sent message immediately to UI for instant feedback
//     setMessages((prev) => [...prev, { sender: userType, message }]);

//     console.log(`${userType}:message`, { conversationId, message });
//     socket.emit(`${userType}:message`, { conversationId, message });
//     setMessage("");
//   };

//   const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
//     if (event.key === "Enter") {
//       event.preventDefault();
//       sendMessage();
//     }
//   };

//   const sendTypingIndicator = () => {
//     socket.emit(`${userType}:typing`, { conversationId });
//   };

//   const resolveConversation = () => {
//     if (userType === "agent") {
//       socket.emit("agent:resolveConversation", { conversationId });
//     }
//   };

//   return (
//     <div className="p-4 border rounded shadow-md w-80 bg-white">
//       <div className="h-64 overflow-y-auto border-b mb-2 p-2">
//         {messages.map((msg, index) => (
//           <Message key={index} sender={msg.sender} message={msg.message} />
//         ))}
//         {typing && <p className="text-gray-500 italic">Typing...</p>}
//         <div ref={messagesEndRef} />
//       </div>
//       {conversationResolved ? (
//         <p className="text-red-500 text-center">Conversation Resolved</p>
//       ) : (
//         <>
//           <input
//             className="w-full p-2 border rounded"
//             type="text"
//             value={message}
//             onChange={(e) => {
//               setMessage(e.target.value);
//               sendTypingIndicator();
//             }}
//             onKeyDown={handleKeyPress} // Handle Enter key
//             placeholder="Type a message..."
//           />
//           <button className="w-full mt-2 p-2 bg-blue-500 text-white rounded" onClick={sendMessage}>
//             Send
//           </button>
//           {userType === "agent" && (
//             <button className="w-full mt-2 p-2 bg-red-500 text-white rounded" onClick={resolveConversation}>
//               Resolve Conversation
//             </button>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default ChatBox;

export default function ChatBox() {
  return <div>ChatBox</div>;
}

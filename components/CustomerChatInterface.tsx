"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import Image from "next/image"
import { v4 as uuidv4 } from 'uuid'
import { 
  CustomerEvents, 
  ServerEvents,
} from '@/types/events'
import {
  type Message as ServerMessage,
  type MessagePayload,
  type ConversationResolvedPayload,
  type ErrorEvent,
  type ClientSocket
} from '@/types/socket';
import { useSocket } from '@/lib/socket';
import { Button } from '@/components/ui/button';

interface Message {
  id: string | number
  text: string
  isUser: boolean
  timestamp: number
  isThinking?: boolean
}

interface UserInfo {
  email: string
  firstName: string
  lastName: string
  bookingId?: string
}

interface ChatInterfaceProps {
  onClose: () => void
}

// TODO: Move these questions and their logic to the server and simplify conversation creation
const allQuestions = [
  "Hello, I'm Flixy your AI agent. How can I help you today?",
  "To best serve you I still need some information before handing over to one of our human agents.",
  "What's your email address?",
  "What's your first name?",
  "What's your last name?",
  "Do you have a booking ID? If so, please enter it. If not, just type 'no'.",
  "Thank you for providing your information. We're connecting you with a support agent. Please wait..",
  "You've been added to the queue. An agent will be with you shortly."
]

// Step 1: Greeting and getting replies from the user about all the basic information
// Step 2: Sending to server and getting a conversation ID back
// Step 3: Joining the conversation using socketio and listening for messages

export default function ChatInterface({ onClose }: ChatInterfaceProps) {
  const socket = useSocket() as ClientSocket | null;
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [conversationStage, setConversationStage] = useState<number>(0)
  const [conversationId, setConversationId] = useState<number | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    messageInputRef.current?.focus();
    const convId = Number(localStorage.getItem('convId'));
    if (convId) {
      setConversationId(convId);
      fetchConversationHistory(convId);
    }

    // Add global event listener for Escape key
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [onClose]);

  const clearSession = () => {
    localStorage.removeItem('convId');
    setConversationId(null);
    setUserInfo(null);
    setCurrentQuestionIndex(0);
    setMessages([]);
    setIsInitialized(false);
  };

  // Fetch conversation history
  const fetchConversationHistory = async (convId: number) => {
    try {
      const response = await fetch(`/api/customer/messages?conversationId=${convId}`);
      if (response.ok) {
        const data = await response.json();
        // Convert messages from API format to our format
        const formattedMessages = data.messages.map((msg: { id: string, content: string, isFromUser: boolean, createdAt: string }) => ({
          id: msg.id.toString(),
          text: msg.content,
          isUser: msg.isFromUser,
          timestamp: new Date(msg.createdAt).getTime()
        }));
        setMessages(formattedMessages);
      } else if (response.status === 404) {
        // Conversation not found. Likely it was resolved by the agent. Clean up local state
        console.info('conversation already resolved');
        clearSession();
      }
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  };

  // Clear session when conversation is resolved
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'conversationResolved') {
        const resolvedId = e.newValue ? parseInt(e.newValue) : null;
        if (resolvedId === conversationId) {
          clearSession();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [conversationId]);

  const addMessage = useCallback((text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: uuidv4(),
      text,
      isUser,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  useEffect(() => {
    if (conversationStage === 1) {
      addMessage(allQuestions[6], false);
      setConversationStage(2);
    } else if (conversationStage === 2) {
      setTimeout(() => {
        addMessage(allQuestions[7], false);
        setConversationStage(3);
      }, 1000);
    } else if (conversationStage === 3) {
      // After all messages are added, add to queue
      setTimeout(() => {
        createConversation();
      }, 1000);
    }
  }, [conversationStage]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageContent = inputMessage.trim();
    
    // Validate message content
    if (!messageContent) {
      console.error('Message content cannot be empty');
      return;
    }

    setInputMessage("");

    if (conversationId && socket) {
      // Create the message payload first to ensure it's properly structured
      const messagePayload: MessagePayload = {
        conversationId,
        content: messageContent,
        isFromUser: true
      };

      // Validate the payload
      if (!messagePayload.content || !messagePayload.conversationId) {
        console.error('Invalid message payload:', messagePayload);
        return;
      }

      // Generate a temporary ID for optimistic update
      const tempId = `temp-${uuidv4()}`;
      
      // Add message optimistically
      const newMessage: Message = {
        id: tempId,
        text: messageContent,
        isUser: true,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, newMessage]);

      try {
        socket?.emit(CustomerEvents.MESSAGE, messagePayload);
      } catch (error) {
        console.error('Error sending message:', error);
        // Remove the optimistic message if there was an error
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }

      setTimeout(scrollToBottom, 100);
    } else {
      // Process the user's response based on current question
      // TODO: This is a bit of a mess. We should refactor this to be more manageable.
      switch (currentQuestionIndex) {
        case 0: // Initial greeting
          addMessage(messageContent, true);
          setCurrentQuestionIndex(1);
          setTimeout(() => addMessage(allQuestions[1], false), 1000);
          setTimeout(() => {
            addMessage(allQuestions[2], false);
            setCurrentQuestionIndex(2);
          }, 2000);
          break;
        case 2: // Email
          addMessage(messageContent, true);
          if (messageContent.includes('@')) {
            setUserInfo({
              email: messageContent,
              firstName: '',
              lastName: '',
            });
            setCurrentQuestionIndex(3);
            setTimeout(() => addMessage(allQuestions[3], false), 1000);
          } else {
            setTimeout(() => addMessage("Please enter a valid email address.", false), 1000);
          }
          break;
        case 3: // First name
          addMessage(messageContent, true);
          setUserInfo(prev => prev ? {
            ...prev,
            firstName: messageContent
          } : null);
          setCurrentQuestionIndex(4);
          setTimeout(() => addMessage(allQuestions[4], false), 1000);
          break;
        case 4: // Last name
          addMessage(messageContent, true);
          setUserInfo(prev => prev ? {
            ...prev,
            lastName: messageContent
          } : null);
          setCurrentQuestionIndex(5);
          setTimeout(() => addMessage(allQuestions[5], false), 1000);
          break;
        case 5: // Booking ID
          // Add user's response to booking ID question
          addMessage(messageContent, true);
          setUserInfo(prev => prev ? {
            ...prev,
            bookingId: messageContent.toLowerCase() === 'no' ? undefined : messageContent
          } : null);
          setCurrentQuestionIndex(6);
          
          // Start the queue sequence instead of using nested timeouts
          setConversationStage(1);
          break;
      }
    }

    setTimeout(scrollToBottom, 100);
  }

  const createConversation = async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInfo, messages }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversationId(data.conversationId);
        localStorage.setItem('convId', data.conversationId);
      }
    } catch (error) {
      console.error("Error adding to queue:", error);
    }
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (!isInitialized && messages.length === 0) {
      // Show initial message
      addMessage(allQuestions[0], false)
      setIsInitialized(true)
    }
  }, [isInitialized, messages.length, addMessage])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initialize socket connection when waiting for agent
  useEffect(() => {
    if (!socket) {
      console.error('Socket.IO connection not available');
      return;
    }

    if (conversationId) {
      socket.emit(CustomerEvents.JOIN, { conversationId });

      socket.on(ServerEvents.NEW_MESSAGE, (message: ServerMessage) => {
        if (!message || !message.content || !message.id) {
          console.error('Invalid message received:', message);
          return;
        }
        
        setMessages(prev => {
          // Skip if we already have this message
          if (prev.some(m => m.id === message.id || 
              (typeof m.id === 'string' && m.id.startsWith('temp-') && m.text === message.content))) {
            return prev;
          }
          
          // Add new message
          return [...prev, {
            id: message.id,
            text: message.content,
            isUser: message.isFromUser,
            timestamp: new Date(message.createdAt).getTime()
          }];
        });
        
        setTimeout(scrollToBottom, 100);
      });

      socket.on(ServerEvents.MESSAGE_SENT, (message: ServerMessage) => {
        if (!message || !message.content || !message.id) {
          console.error('Invalid message confirmation received:', message);
          return;
        }

        setMessages(prev => prev.map(m => 
          typeof m.id === 'string' && m.id.startsWith('temp-') && m.text === message.content
            ? {
                id: message.id,
                text: message.content,
                isUser: message.isFromUser,
                timestamp: new Date(message.createdAt).getTime()
              }
            : m
        ));
      });

      socket.on(ServerEvents.ERROR, (error: ErrorEvent) => {
        console.error('Message error:', error);
        // Remove temporary message on error
        setMessages(prev => prev.filter(m => typeof m.id !== 'string' || !m.id.startsWith('temp-')));
      });

      socket.on(ServerEvents.CONVERSATION_RESOLVED, (data: ConversationResolvedPayload) => {
        console.log('Chat resolved:', data);
        
        // Add the resolution message
        setMessages(prev => [...prev, {
          id: `resolution-${Date.now()}`,
          text: "This conversation has been marked as resolved by the agent. Thank you for using our service.",
          isUser: false,
          timestamp: Date.now()
        }]);

        // Clear the session after a short delay
        setTimeout(() => {
          console.info('conversationResolved');
          
          // Clear messages after a delay
          setTimeout(() => {
            clearSession();
          }, 5000);
        }, 1000);
      });
    }

    // Cleanup function
    return () => {
      socket.emit(CustomerEvents.DISCONNECT, conversationId);
      socket.off(ServerEvents.NEW_MESSAGE);
      socket.off(ServerEvents.MESSAGE_SENT);
      socket.off(ServerEvents.CONVERSATION_RESOLVED);
      socket.off(ServerEvents.ERROR);
    };
  }, [socket, conversationId, scrollToBottom]);

  return (
    <div 
      className="fixed inset-0 md:inset-auto md:bottom-4 md:right-4 md:w-96 md:h-[600px] bg-white rounded-none md:rounded-2xl shadow-xl flex flex-col z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-title"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 overflow-hidden" aria-hidden="true">
            <Image src="/flixy.png" alt="" width={32} height={32} />
          </div>
          <span className="text-xl font-semibold" id="chat-title">Flixy</span>
        </div>
        <div className="ml-auto">
          <button 
            onClick={onClose}
            aria-label="Close chat"
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onClose();
              }
            }}
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center overflow-hidden" aria-hidden="true">
              <Image src="/flixy.png" alt="" width={48} height={48} />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No messages</h2>
            <p className="text-gray-600">Messages from the team will be shown here</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.isUser ? "justify-end" : "justify-start"} mb-4`}
                role="article"
                aria-label={`${message.isUser ? "You" : "Support agent"} said`}
              >
                {!message.isUser && (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 overflow-hidden" aria-hidden="true">
                    <Image src="/flixy.png" alt="" width={32} height={32} />
                  </div>
                )}
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${!message.isUser ? 'bg-gray-100' : 'bg-[#31a200] text-white'}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 pt-2">
        {messages.length < 2 && (
          <div className="text-xs text-gray-500 mb-2" aria-live="polite">
            By chatting with us, you agree to the monitoring and recording of this chat to deliver our services and processing of your personal data in accordance with our Privacy Policy.
          </div>
        )}
        <form onSubmit={handleSendMessage} aria-label="Chat message form">
          <div className="relative w-full">
            <Input
              ref={messageInputRef}
              type="text"
              placeholder="Message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              className="w-full pl-4 pr-16 py-5 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-200"
              aria-label="Type your message"
              required
            />
            <Button
              className="absolute right-0 top-0 bottom-0 py-[21px] px-4 rounded-r-full"
              type="submit"
              disabled={!inputMessage.trim()}
              aria-label="Send message"
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

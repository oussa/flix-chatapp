'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/UserAvatar';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { logout, getSession } from '@/app/actions/auth';
import { useSocket } from '@/lib/socket';
import {
  CustomerEvents,
  AgentEvents,
  ServerEvents,
} from '@/types/events';
import {
  type MessagePayload,
  type ConversationUpdatePayload,
  type ConversationResolvedPayload,
  type ErrorEvent,
  type ClientSocket
} from '@/types/socket';
import type { Message, Conversation } from '@/types/socket';
import { Input } from '@/components/ui/input';

export default function AgentDashboard() {
  const router = useRouter();
  const socket = useSocket() as ClientSocket | null;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [agentId, setAgentId] = useState<number | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Add effect to scroll when messages change or conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      scrollToBottom();
    }
  }, [selectedConversation, scrollToBottom]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    if (selectedConversation) {
      socket.emit(AgentEvents.JOIN, { conversationId: selectedConversation });
    }

    // Listen for conversation updates
    socket.on(ServerEvents.CONVERSATION_UPDATED, (data: ConversationUpdatePayload) => {
      setConversations(prevConvs => {
        const updatedConvs = prevConvs.map(conv =>
          conv.id === data.conversationId
            ? {
              ...conv,
              latestMessage: data.latestMessage,
              lastMessageAt: data.lastMessageAt,
              isRead: data.isRead
            }
            : conv
        );
        // Sort by lastMessageAt
        return [...updatedConvs].sort((a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
      });
    });

    socket.on(ServerEvents.NEW_CONVERSATION, async (conversationId: number) => {
      // Skip if we already have this conversation
      if (conversations.some(conv => conv.id === conversationId)) {
        return;
      }

      await fetchConversations();
    });

    socket.on(ServerEvents.CONVERSATION_RESOLVED, (data: ConversationResolvedPayload) => {
      if (data.conversationId === selectedConversation) {
        setSelectedConversation(null);
        setConversations(prevConvs =>
          prevConvs.filter(conv => conv.id !== data.conversationId)
        );
      }
    });

    return () => {
      socket.off(ServerEvents.CONVERSATION_UPDATED);
      socket.off(ServerEvents.NEW_CONVERSATION);
      socket.off(ServerEvents.CONVERSATION_RESOLVED);
    };
  }, [socket, selectedConversation, conversations]);

  // Join conversation messages channel when selected
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    socket.emit(CustomerEvents.JOIN, { conversationId: selectedConversation });

    socket.on(ServerEvents.NEW_MESSAGE, (message: Message) => {
      // Validate incoming message
      if (!message || !message.content || !message.id || !message.conversationId) {
        console.error('Invalid message received:', message);
        return;
      }

      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.id === message.conversationId
            ? {
              ...conv,
              messages: [...conv.messages, message],
              lastMessageAt: message.createdAt,
              // Only mark as unread if message is from user
              isRead: !message.isFromUser
            }
            : conv
        )
      );
      if (selectedConversation === message.conversationId) {
        setTimeout(scrollToBottom, 100);
      }
    });

    socket.on(ServerEvents.MESSAGE_SENT, (message: Message) => {
      if (!message || !message.content || !message.id || !message.conversationId) {
        console.error('Invalid message confirmation received:', message);
        return;
      }

      // Update the conversation with the confirmed message
      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.id === message.conversationId
            ? {
              ...conv,
              messages: [...conv.messages, message],
              lastMessageAt: message.createdAt
            }
            : conv
        )
      );
      if (selectedConversation === message.conversationId) {
        setTimeout(scrollToBottom, 100);
      }
    });

    socket.on(ServerEvents.ERROR, (error: ErrorEvent) => {
      console.error('Message error:', error);
      // TODO: Handle message error (e.g., show error notification to agent)
    });

    // Focus the input field when joining a conversation
    messageInputRef.current?.focus();

    return () => {
      socket.emit(CustomerEvents.DISCONNECT, selectedConversation);
      socket.off(ServerEvents.NEW_MESSAGE);
      socket.off(ServerEvents.MESSAGE_SENT);
      socket.off(ServerEvents.ERROR);
    };
  }, [selectedConversation, socket, scrollToBottom]);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/agent/login');
      } else {
        setAgentId(Number(session));
        fetchConversations();
      }
    };
    checkAuth();
  }, [router]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/agent/conversations?status=open');
      if (response.ok) {
        const data = await response.json();
        // Sort conversations by lastMessageAt
        const sortedData = data.sort((a: Conversation, b: Conversation) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        setConversations(sortedData);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageContent = message.trim();

    // Validate message content and required fields
    if (!messageContent || !selectedConversation || !agentId || !socket) {
      console.error('Invalid message data:', { messageContent, selectedConversation, agentId });
      return;
    }

    // Create the message payload first to ensure it's properly structured
    const messagePayload: MessagePayload = {
      conversationId: selectedConversation,
      content: messageContent,
      isFromUser: false,
      agentId
    };

    // Additional validation of the payload
    if (!messagePayload.content || !messagePayload.conversationId || !messagePayload.agentId) {
      console.error('Invalid message payload:', messagePayload);
      return;
    }

    setMessage('');

    try {
      // Send message through Socket.IO
      socket.emit(AgentEvents.MESSAGE, messagePayload);
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Handle the error (e.g., show error message to agent)
    }

    // Scroll to bottom after sending message
    setTimeout(scrollToBottom, 100);
  };

  const handleConversationSelect = (convId: number) => {
    if (selectedConversation && socket) {
      socket.emit(CustomerEvents.DISCONNECT, selectedConversation);
    }

    setSelectedConversation(convId);
    if (!agentId || !socket) return;

    const conversation = conversations.find(c => c.id === convId);
    if (!conversation?.isRead) {
      markConversationAsRead(convId);
    }

    if (!conversation?.assignedAgentId) {
      assignConversationToAgent(convId);
    }

    socket.emit(CustomerEvents.JOIN, convId);
  };

  const markConversationAsRead = async (convId: number) => {
    try {
      await fetch('/api/agent/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'markAsRead',
          conversationId: convId,
        }),
      });

      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.id === convId
            ? { ...conv, isRead: true }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const assignConversationToAgent = async (convId: number) => {
    try {
      await fetch('/api/agent/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'assign',
          conversationId: convId,
          agentId,
        }),
      });

      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.id === convId
            ? { ...conv, assignedAgentId: agentId }
            : conv
        )
      );
    } catch (error) {
      console.error('Error assigning conversation:', error);
    }
  };

  // Handle localStorage events for conversation resolution
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'conversationResolved' && e.newValue) {
        const resolvedId = Number(e.newValue);
        if (!isNaN(resolvedId)) {
          // Update selected conversation if it was resolved
          if (selectedConversation === resolvedId) {
            setSelectedConversation(null);
          }
          // Remove the resolved conversation from the list
          setConversations(prevConvs =>
            prevConvs.filter(conv => conv.id !== resolvedId)
          );
          // Remove from localStorage to prevent duplicate handling
          localStorage.removeItem('conversationResolved');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedConversation]);

  // Handle conversation resolution
  const handleResolveIssue = async () => {
    if (!selectedConversation || !socket) return;

    try {
      socket.emit(AgentEvents.RESOLVE_CONVERSATION, selectedConversation);
      setIsConfirmationOpen(false);
    } catch (error) {
      console.error('Error resolving conversation:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/agent/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-[#31a200] text-[#31a200] hover:bg-[#31a200] hover:text-white"
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Conversations List */}
          <div className="col-span-4 bg-white rounded-lg shadow flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Open Conversations</h2>
              <p className="text-sm text-gray-500 mt-1">{conversations.length} active chats</p>
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="divide-y">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors duration-150 ${
                      selectedConversation === conv.id ? 'bg-gray-50' : ''
                    } ${!conv.isRead ? 'bg-green-50/50' : ''}`}
                    onClick={() => handleConversationSelect(Number(conv.id))}
                    data-testid={`conversation-${conv.id}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative flex-shrink-0">
                        <UserAvatar firstName={conv.firstName} lastName={conv.lastName} size="md"/>
                        {!conv.isRead && (
                          <div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"/>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-medium truncate ${!conv.isRead ? 'text-green-700' : 'text-gray-900'}`}>
                            {conv.firstName} {conv.lastName}
                          </span>
                          <span
                            className={`text-xs ${!conv.isRead ? 'text-green-600 font-medium' : 'text-gray-500'} flex-shrink-0`}>
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500 truncate">
                            {conv.email}
                          </span>
                        </div>
                        <div
                          className={`text-sm truncate ${!conv.isRead ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                          {conv.latestMessage || conv.messages[conv.messages.length - 1]?.content || 'No messages'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {conversations.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No active conversations</p>
                  <p className="text-sm text-gray-500">New customer chats will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-8 bg-white rounded-lg shadow">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      {conversations.find(c => c.id === selectedConversation) && (
                        <>
                          <UserAvatar
                            firstName={conversations.find(c => c.id === selectedConversation)!.firstName}
                            lastName={conversations.find(c => c.id === selectedConversation)!.lastName}
                            size="lg"
                          />
                          <div>
                            <h2 className="font-semibold">
                              {conversations.find(c => c.id === selectedConversation)!.firstName}{' '}
                              {conversations.find(c => c.id === selectedConversation)!.lastName}
                            </h2>
                            <p className="text-sm text-gray-600">
                              {conversations.find(c => c.id === selectedConversation)!.email}
                            </p>
                            {conversations.find(c => c.id === selectedConversation)?.bookingId && (
                              <p className="text-sm text-gray-600">
                                Booking ID: {conversations.find(c => c.id === selectedConversation)!.bookingId}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setIsConfirmationOpen(true)}
                    >
                      Mark Issue as Resolved
                    </Button>
                  </div>
                </div>

                <div
                  data-testid="agent-chat-area"
                  className="h-[calc(100vh-400px)] overflow-y-auto p-4 space-y-4"
                >
                  {conversations.find(c => c.id === selectedConversation)?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isFromUser ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.isFromUser
                            ? 'bg-gray-100'
                            : 'bg-[#31a200] text-white'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef}/>
                </div>

                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage}>
                    <div className="flex gap-2">
                      <Input
                        ref={messageInputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        className="flex-1 border rounded-md px-3 py-5 focus:outline-none focus:ring-2 focus:ring-[#31a200]"
                        placeholder="Type your message..."
                        data-testid="agent-message-input"
                      />
                      <Button
                        className="py-5"
                        type="submit"
                        disabled={!message.trim()}
                        data-testid="agent-send-button"
                      >
                        Send
                      </Button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a customer conversation to start helping them
              </div>
            )}
          </div>
        </div>
      </main>

      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleResolveIssue}
        title="Mark Issue as Resolved"
        description="Are you sure you want to mark this issue as resolved? This will close the conversation and remove it from your active list."
        confirmText="Yes, Mark as Resolved"
        cancelText="No, Keep Open"
      />
    </div>
  );
}

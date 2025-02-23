'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/UserAvatar';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { logout, getSession } from '@/app/actions/auth';

interface Conversation {
  id: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    bookingId?: string;
  };
  status: 'open' | 'closed';
  unread: boolean;
  lastMessage: string;
  updatedAt: string;
}

export default function AgentDashboard() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/agent/login');
      }
    };
    checkAuth();
  }, [router]);

  // Mock data for demonstration
  useEffect(() => {
    setConversations([
      {
        id: 1,
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          bookingId: 'BK123',
        },
        status: 'open',
        unread: true,
        lastMessage: 'Hi, I need help with my booking',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        user: {
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@example.com',
        },
        status: 'open',
        unread: false,
        lastMessage: 'When is my refund coming through?',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        user: {
          firstName: 'Robert',
          lastName: 'Johnson',
          email: 'robert@example.com',
          bookingId: 'BK456',
        },
        status: 'open',
        unread: true,
        lastMessage: 'Can I change my travel date?',
        updatedAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the message to your backend
    setMessage('');
  };

  const handleConversationSelect = (convId: number) => {
    setSelectedConversation(convId);
    // Mark conversation as read when selected
    setConversations(prevConvs =>
      prevConvs.map(conv =>
        conv.id === convId ? { ...conv, unread: false } : conv
      )
    );
  };

  const handleResolveIssue = () => {
    if (selectedConversation) {
      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.id === selectedConversation
            ? { ...conv, status: 'closed' }
            : conv
        )
      );
      setSelectedConversation(null);
      setIsConfirmationOpen(false);
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
          <div className="col-span-4 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Open Conversations</h2>
            </div>
            <div className="divide-y">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  className={`w-full p-4 text-left hover:bg-gray-50 ${
                    selectedConversation === conv.id ? 'bg-gray-50' : ''
                  } ${conv.unread ? 'bg-green-50/50' : ''}`}
                  onClick={() => handleConversationSelect(conv.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <UserAvatar firstName={conv.user.firstName} lastName={conv.user.lastName} size="md" />
                      {conv.unread && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-medium truncate ${conv.unread ? 'text-green-700' : ''}`}>
                          {conv.user.firstName} {conv.user.lastName}
                        </span>
                        <span className={`text-sm ${conv.unread ? 'text-green-600 font-medium' : 'text-gray-500'} flex-shrink-0`}>
                          {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`text-sm truncate ${conv.unread ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                        {conv.lastMessage}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-8 bg-white rounded-lg shadow">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      <UserAvatar 
                        firstName={conversations.find(c => c.id === selectedConversation)?.user.firstName || ''} 
                        lastName={conversations.find(c => c.id === selectedConversation)?.user.lastName || ''} 
                        size="lg"
                      />
                      <div>
                        <h2 className="font-semibold">
                          {conversations.find((c) => c.id === selectedConversation)?.user.firstName}{' '}
                          {conversations.find((c) => c.id === selectedConversation)?.user.lastName}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {conversations.find((c) => c.id === selectedConversation)?.user.email}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setIsConfirmationOpen(true)}
                      className="bg-[#31a200] text-white hover:bg-[#31a200]/90 border-0"
                    >
                      Mark Issue as Resolved
                    </Button>
                  </div>
                </div>

                <div className="h-[calc(100vh-400px)] overflow-y-auto p-4">
                  {/* Chat messages would go here */}
                </div>

                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#31a200]"
                        placeholder="Type your message..."
                      />
                      <Button type="submit">Send</Button>
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
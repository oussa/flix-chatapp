'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Conversation {
  id: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    bookingId?: string;
  };
  status: string;
  lastMessage: string;
  updatedAt: string;
}

export default function AgentDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [message, setMessage] = useState('');

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
        lastMessage: 'Hi, I need help with my booking',
        updatedAt: new Date().toISOString(),
      },
      // Add more mock conversations as needed
    ]);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the message to your backend
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
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
                  }`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">
                      {conv.user.firstName} {conv.user.lastName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(conv.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {conv.lastMessage}
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
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold">
                        {
                          conversations.find((c) => c.id === selectedConversation)
                            ?.user.firstName
                        }{' '}
                        {
                          conversations.find((c) => c.id === selectedConversation)
                            ?.user.lastName
                        }
                      </h2>
                      <p className="text-sm text-gray-600">
                        {
                          conversations.find((c) => c.id === selectedConversation)
                            ?.user.email
                        }
                      </p>
                    </div>
                    <Button variant="outline">Close Chat</Button>
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
                        className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Type your message..."
                      />
                      <Button type="submit">Send</Button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 
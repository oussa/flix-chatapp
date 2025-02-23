import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  isFromUser: boolean;
  createdAt: string;
}

interface ChatWidgetProps {
  onClose: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isCollectingInfo, setIsCollectingInfo] = useState(true);
  const [userInfo, setUserInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    bookingId: '',
  });
  const [currentQuestion, setCurrentQuestion] = useState('email');

  useEffect(() => {
    // Check for existing session
    const savedSession = localStorage.getItem('chatSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setUserInfo(session.userInfo);
      setMessages(session.messages);
      setIsCollectingInfo(false);
    }
  }, []);

  const simulateTyping = async (message: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMessages(prev => [...prev, { 
      id: Date.now(),
      content: message,
      isFromUser: false,
      createdAt: new Date().toISOString()
    }]);
  };

  const handleInfoCollection = async (value: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      content: value,
      isFromUser: true,
      createdAt: new Date().toISOString()
    }]);

    const questions = {
      email: { next: 'firstName', message: "What's your first name?" },
      firstName: { next: 'lastName', message: "What's your last name?" },
      lastName: { next: 'bookingId', message: "Do you have a booking ID? (Type 'no' if not)" },
      bookingId: { next: 'done', message: "Thanks! An agent will be with you shortly." }
    };

    setUserInfo(prev => ({ ...prev, [currentQuestion]: value }));

    if (currentQuestion === 'bookingId') {
      setIsCollectingInfo(false);
      const session = {
        userInfo: { ...userInfo, bookingId: value },
        messages: [...messages, { id: Date.now(), content: value, isFromUser: true, createdAt: new Date().toISOString() }]
      };
      localStorage.setItem('chatSession', JSON.stringify(session));
    } else {
      const nextQuestion = questions[currentQuestion as keyof typeof questions].next;
      setCurrentQuestion(nextQuestion);
      await simulateTyping(questions[currentQuestion as keyof typeof questions].message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (isCollectingInfo) {
      handleInfoCollection(input);
    } else {
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: input,
        isFromUser: true,
        createdAt: new Date().toISOString()
      }]);
      // Here you would typically send the message to your backend
    }
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-background rounded-lg shadow-xl border border-accent/20">
      <div className="p-4 border-b flex justify-between items-center bg-primary text-primary-foreground rounded-t-lg">
        <h3 className="font-semibold">Chat with us</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:text-primary-foreground/80">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isFromUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent/10 text-foreground'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-accent/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-accent/20 rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type your message..."
          />
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Send</Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWidget; 
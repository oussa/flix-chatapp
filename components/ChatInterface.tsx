"use client"

import { useState, useEffect, useLayoutEffect, memo, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import Image from "next/image"
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string
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

export default function ChatInterface({ onClose }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isWaitingForAgent, setIsWaitingForAgent] = useState(false)
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true)

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

  const addMessage = useCallback((text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: uuidv4(),
      text,
      isUser,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user's message
    addMessage(inputMessage, true)
    
    // Process the user's response based on current question
    switch (currentQuestionIndex) {
      case 0: // Initial greeting
        setCurrentQuestionIndex(1)
        setTimeout(() => addMessage(allQuestions[1], false), 1000)
        setTimeout(() => {
          addMessage(allQuestions[2], false)
          setCurrentQuestionIndex(2)
        }, 2000)
        break
      case 2: // Email
        if (inputMessage.includes('@')) {
          setUserInfo({
            email: inputMessage,
            firstName: '',
            lastName: '',
          })
          setCurrentQuestionIndex(3)
          setTimeout(() => addMessage(allQuestions[3], false), 1000)
        } else {
          setTimeout(() => addMessage("Please enter a valid email address.", false), 1000)
        }
        break
      case 3: // First name
        setUserInfo(prev => prev ? {
          ...prev,
          firstName: inputMessage
        } : null)
        setCurrentQuestionIndex(4)
        setTimeout(() => addMessage(allQuestions[4], false), 1000)
        break
      case 4: // Last name
        setUserInfo(prev => prev ? {
          ...prev,
          lastName: inputMessage
        } : null)
        setCurrentQuestionIndex(5)
        setTimeout(() => addMessage(allQuestions[5], false), 1000)
        break
      case 5: // Booking ID
        setUserInfo(prev => prev ? {
          ...prev,
          bookingId: inputMessage.toLowerCase() === 'no' ? undefined : inputMessage
        } : null)
        setCurrentQuestionIndex(6)
        setIsWaitingForAgent(true)
        setTimeout(() => {
          addMessage(allQuestions[6], false)
        }, 1000)
        setTimeout(() => {
          addMessage(allQuestions[7], false)
          addToQueue()
        }, 1000)
        break
    }

    setInputMessage("")
  }

  const addToQueue = async () => {
    try {
      const response = await fetch("/api/queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInfo, messages }),
      })
      if (response.ok) {
        // await addMessage(allQuestions[7], false)
      } else {
        // await addMessage("There was an error adding you to the queue. Please try again later.", false)
      }
    } catch (error) {
      console.error("Error adding to queue:", error)
      // await addMessage("There was an error connecting to our service. Please try again later.", false)
    }
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (!isInitialized && messages.length === 0) {
      console.log("isInitialized", isInitialized)
      // Show initial message
      addMessage(allQuestions[0], false)
      setIsInitialized(true)
    }
  }, [isInitialized, messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-4 md:right-4 md:w-96 md:h-[600px] bg-white rounded-none md:rounded-2xl shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 overflow-hidden">
            <Image src="/flixy.png" alt="Flixy" width={32} height={32} />
          </div>
          <span className="text-xl font-semibold">Flixy</span>
        </div>
        <div className="ml-auto">
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              <Image src="/flixy.png" alt="Flixy" width={48} height={48} />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No messages</h2>
            <p className="text-gray-600">Messages from the team will be shown here</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"} mb-4`}>
                {!message.isUser && (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 overflow-hidden">
                    <Image src="/flixy.png" alt="Flixy" width={32} height={32} />
                  </div>
                )}
                <div className={`max-w-[80%] ${message.isUser ? "bg-black text-white rounded-[20px] rounded-br-sm" : "bg-white shadow-sm rounded-[20px] rounded-tl-sm"} p-3`}>
                  {!message.isUser && <div className="font-semibold mb-1">Flixy • AI Agent</div>}
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
        {showPrivacyNotice && messages.length === 0 && (
          <div className="text-xs text-gray-500 mb-2">
            By chatting with us, you agree to the monitoring and recording of this chat to deliver our services and processing of your personal data in accordance with our Privacy Policy.
          </div>
        )}
        <div className="relative">
          <Input
            type="text"
            placeholder="Message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="w-full pl-4 pr-24 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-200"
          />
        </div>
      </div>
    </div>
  )
}

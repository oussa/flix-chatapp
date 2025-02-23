"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import Image from "next/image"

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
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isWaitingForAgent, setIsWaitingForAgent] = useState(false)
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true)

  const questions = [
    "What's your email address?",
    "What's your first name?",
    "What's your last name?",
    "If you have a booking ID, please enter it (optional):",
  ]

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages")
    const savedUserInfo = localStorage.getItem("userInfo")
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else {
      showThinkingThenMessage(
        "Hello! Before we connect you with an agent, I need to collect some information. " + questions[0],
      )
    }
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo))
      setCurrentQuestion(questions.length)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    if (userInfo) {
      localStorage.setItem("userInfo", JSON.stringify(userInfo))
    }
  }, [userInfo])

  const addMessage = (text: string, isUser: boolean, isThinking: boolean = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: Date.now(),
      isThinking
    }
    setMessages((prevMessages) => [...prevMessages, newMessage])
  }

  const showThinkingThenMessage = async (text: string) => {
    addMessage("Thinking...", false, true)
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 3000))
    // Remove thinking message and add actual message
    setMessages(prev => {
      const filtered = prev.filter(msg => !msg.isThinking)
      return [...filtered, {
        id: Date.now().toString(),
        text,
        isUser: false,
        timestamp: Date.now()
      }]
    })
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      addMessage(inputMessage, true)
      setInputMessage("")

      if (currentQuestion < questions.length) {
        await showThinkingThenMessage(questions[currentQuestion])
        handleUserInfoInput(inputMessage)
      } else if (!isWaitingForAgent) {
        setIsWaitingForAgent(true)
        await showThinkingThenMessage(
          "Thank you for providing your information. We're connecting you with a support agent. Please wait."
        )
        await addToQueue()
      }
    }
  }

  const handleUserInfoInput = async (input: string) => {
    const updatedInfo = { ...userInfo } as UserInfo
    switch (currentQuestion) {
      case 0:
        updatedInfo.email = input
        break
      case 1:
        updatedInfo.firstName = input
        break
      case 2:
        updatedInfo.lastName = input
        break
      case 3:
        updatedInfo.bookingId = input
        break
    }
    setUserInfo(updatedInfo)
    setCurrentQuestion((prev) => prev + 1)

    if (currentQuestion < questions.length - 1) {
      await showThinkingThenMessage(questions[currentQuestion + 1])
    } else if (currentQuestion === questions.length - 1) {
      await showThinkingThenMessage("Thank you for providing your information. How can we help you today?")
    }
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
        await showThinkingThenMessage("You've been added to the queue. An agent will be with you shortly.")
      } else {
        await showThinkingThenMessage("There was an error adding you to the queue. Please try again later.")
      }
    } catch (error) {
      console.error("Error adding to queue:", error)
      await showThinkingThenMessage("There was an error connecting to our service. Please try again later.")
    }
  }

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
          messages.map((message) => (
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
          ))
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

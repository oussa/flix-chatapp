"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: number
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
      addMessage(
        "Hello! Before we connect you with an agent, I need to collect some information. " + questions[0],
        false,
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

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: Date.now(),
    }
    setMessages((prevMessages) => [...prevMessages, newMessage])
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      addMessage(inputMessage, true)
      setInputMessage("")

      if (currentQuestion < questions.length) {
        handleUserInfoInput(inputMessage)
      } else if (!isWaitingForAgent) {
        setIsWaitingForAgent(true)
        addMessage(
          "Thank you for providing your information. We're connecting you with a support agent. Please wait.",
          false,
        )
        await addToQueue()
      }
    }
  }

  const handleUserInfoInput = (input: string) => {
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
      addMessage(questions[currentQuestion + 1], false)
    } else if (currentQuestion === questions.length - 1) {
      addMessage("Thank you for providing your information. How can we help you today?", false)
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
        addMessage("You've been added to the queue. An agent will be with you shortly.", false)
      } else {
        addMessage("There was an error adding you to the queue. Please try again later.", false)
      }
    } catch (error) {
      console.error("Error adding to queue:", error)
      addMessage("There was an error connecting to our service. Please try again later.", false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Chat Support</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] p-2 rounded-lg ${message.isUser ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex">
        <Input
          type="text"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 mr-2"
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  )
}

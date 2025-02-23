"use client"

import { useState } from "react"
import Link from "next/link"
import LandingPage from "@/components/LandingPage"
import ChatButton from "@/components/ChatButton"
import ChatInterface from "@/components/ChatInterface"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Chat Support Demo</h1>
          <Button asChild>
            <Link href="/agent">Agent Dashboard</Link>
          </Button>
        </div>
        <LandingPage />
        <ChatButton onClick={() => setIsChatOpen(true)} />
        {isChatOpen && <ChatInterface onClose={() => setIsChatOpen(false)} />}
      </div>
    </main>
  )
}

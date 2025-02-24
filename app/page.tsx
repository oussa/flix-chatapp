"use client"

import { useState } from "react"
import Link from "next/link"
import LandingPage from "@/components/LandingPage"
import ChatButton from "@/components/ChatButton"
import ChatInterface from "@/components/CustomerChatInterface"
import { Search, X } from "lucide-react"

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#31a200] text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-between items-center w-full">
              <Link href="/" className="text-3xl font-bold text-white">
                FLIX
              </Link>
              <h1 className="text-2xl font-bold">Help Center</h1>
              <div className="w-[100px]"></div> {/* Spacer for centering */}
            </div>
            <div className="w-full max-w-3xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="How can we help you today?"
                  className="w-full h-12 pl-11 pr-11 rounded-full bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <LandingPage searchQuery={searchQuery} onChatOpen={() => setIsChatOpen(true)} />
        <ChatButton onClick={() => setIsChatOpen(true)} />
        {isChatOpen && <ChatInterface onClose={() => setIsChatOpen(false)} />}
      </main>
    </div>
  )
}

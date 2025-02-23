import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { helpTopics } from "@/app/data/help-topics"
import { useState, useEffect } from "react"

interface LandingPageProps {
  searchQuery: string
  onChatOpen: () => void
}

export default function LandingPage({ searchQuery, onChatOpen }: LandingPageProps) {
  const [filteredTopics, setFilteredTopics] = useState(helpTopics)

  // Update filtered topics when search query changes
  useEffect(() => {
    const filtered = helpTopics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredTopics(filtered)
  }, [searchQuery])

  return (
    <div className="relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <picture className="w-full h-full">
          <source
            srcSet="https://cdn-cf.cms.flixbus.com/drupal-assets/2021-10/desktop-flix-hero-q4-2021.jpg"
            media="(min-width: 1200px)"
          />
          <source
            srcSet="https://cdn-cf.cms.flixbus.com/drupal-assets/2021-10/tablet-flix-hero-q4-2021.jpeg"
            media="(min-width: 600px)"
          />
          <source
            srcSet="https://cdn-cf.cms.flixbus.com/drupal-assets/2021-10/mobile-flix-hero-q4-2021.jpg"
            media="(max-width: 599px)"
          />
          <img
            className="w-full h-full object-cover object-[75%_center] opacity-35"
            alt=""
            src="https://cdn-cf.cms.flixbus.com/drupal-assets/2021-10/mobile-flix-hero-q4-2021.jpg"
          />
        </picture>
        <div className="absolute inset-0"></div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          {filteredTopics.map((topic) => (
            <Link key={topic.id} href={topic.link} className="block group h-full transform-gpu">
              <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_20px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out h-full flex flex-col items-center text-center group-hover:scale-[1.02] origin-center">
                <div className="mb-4">
                  <topic.icon className="h-8 w-8 text-[#31a200]" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-semibold text-[#2D3436] mb-4">{topic.title}</h2>
                <Button 
                  variant="outline" 
                  className="mt-auto border-[#31a200] text-[#31a200] hover:bg-[#31a200] hover:text-white"
                >
                  LEARN MORE
                </Button>
              </div>
            </Link>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="relative z-10 text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-4">
              No results found for your search
            </h3>
            <Button 
              className="bg-[#31a200] text-white hover:bg-[#31a200]/90"
              onClick={onChatOpen}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start a Chat
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import * as icons from 'lucide-react'
import { useState, useEffect } from 'react'
import { getHelpTopics, type HelpTopic } from '@/app/actions/help-topics'
import { LucideIcon } from 'lucide-react'

interface LandingPageProps {
  searchQuery: string
  onChatOpen: () => void
}

export default function LandingPage({ searchQuery, onChatOpen }: LandingPageProps) {
  const [topics, setTopics] = useState<HelpTopic[]>([])
  const [filteredTopics, setFilteredTopics] = useState<HelpTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch help topics on mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const fetchedTopics = await getHelpTopics()
        setTopics(fetchedTopics)
        setFilteredTopics(fetchedTopics)
      } catch (error) {
        console.error('Error fetching help topics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopics()
  }, [])

  // Update filtered topics when search query changes
  useEffect(() => {
    const filtered = topics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredTopics(filtered)
  }, [searchQuery, topics])

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-140px)] container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-[20px] h-48"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
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
          <Image
            loading="lazy"
            className="w-full h-full object-cover object-[75%_center] opacity-35"
            alt="FlixBus Hero Image"
            fill
            src="https://cdn-cf.cms.flixbus.com/drupal-assets/2021-10/mobile-flix-hero-q4-2021.jpg"
          />
        </picture>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Cards Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          role="list"
          aria-label="Help topics"
        >
          {filteredTopics.map((topic) => {
            const IconComponent = icons[topic.icon] as LucideIcon
            return (
              <Link 
                key={topic.id} 
                href={`/help/${topic.slug}`} 
                className="block group h-full transform-gpu"
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    window.location.href = `/help/${topic.slug}`;
                  }
                }}
                aria-label={`${topic.title} - Learn more`}
              >
                <div
                  className="bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_20px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out h-full flex flex-col items-center text-center group-hover:scale-[1.02] origin-center">
                  <div className="mb-4" aria-hidden="true">
                    <IconComponent className="h-8 w-8 text-[#31a200]" strokeWidth={1.5}/>
                  </div>
                  <h2 className="text-xl font-semibold text-[#2D3436] mb-4">{topic.title}</h2>
                  <Button
                    variant="outline"
                    className="mt-auto border-[#31a200] text-[#31a200] hover:bg-[#31a200] hover:text-white"
                    tabIndex={-1}
                  >
                    LEARN MORE
                  </Button>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div 
            className="text-center py-12"
            aria-live="polite"
            role="status"
          >
            <h3 className="text-2xl font-semibold mb-4">
              No results found for your search
            </h3>
            <Button
              className="bg-[#31a200] text-white hover:bg-[#31a200]/90"
              onClick={onChatOpen}
              aria-label="Chat with our customer support"
            >
              <MessageSquare className="mr-2 h-5 w-5" aria-hidden="true"/>
              Chat with our customer support
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

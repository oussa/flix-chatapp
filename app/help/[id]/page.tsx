'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getHelpTopicBySlug } from '@/app/actions/help-topics';
import * as icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();
  const { id } = useParams<{id: string}>();
  const [helpData, setHelpData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHelpData() {
      try {
        setIsLoading(true);
        const topicData = await getHelpTopicBySlug(id as string);
        
        if (!topicData) {
          setError('Help topic not found');
          return;
        }
        
        setHelpData({
          title: topicData.title,
          icon: topicData.icon,
          content: topicData.content
        });
      } catch (err) {
        console.error('Error fetching help topic:', err);
        setError('Failed to load help topic');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchHelpData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-[#31a200] text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col items-center gap-6">
              <div className="flex justify-between items-center w-full">
                <Link href="/" className="text-3xl font-bold text-white">
                  FLIX
                </Link>
                <h1 className="text-2xl font-bold">Help Center</h1>
                <div className="w-[100px]"></div>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !helpData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-[#31a200] text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col items-center gap-6">
              <div className="flex justify-between items-center w-full">
                <Link href="/" className="text-3xl font-bold text-white">
                  FLIX
                </Link>
                <h1 className="text-2xl font-bold">Help Center</h1>
                <div className="w-[100px]"></div>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 text-center">
          <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Help Topic Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the help topic you're looking for.</p>
          <Button onClick={() => router.push('/')}>
            Return to Help Center
          </Button>
        </div>
      </div>
    );
  }

  const IconComponent = (helpData?.icon && icons[helpData.icon as keyof typeof icons]) 
    ? icons[helpData.icon as keyof typeof icons] as LucideIcon 
    : HelpCircle;

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#31a200]/10 p-3 rounded-full">
              <IconComponent className="h-8 w-8 text-[#31a200]" />
            </div>
            <h1 className="text-3xl font-bold">{helpData.title}</h1>
          </div>

          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: helpData.content }}
          />

          <div className="mt-12 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Was this helpful?</h3>
            <div className="flex gap-4">
              <Button variant="outline">Yes, thanks!</Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/?openChat=true'}
              >
                No, I need more help
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

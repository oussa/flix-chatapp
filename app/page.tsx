'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import ChatWidget from '@/components/chat/ChatWidget';
import FaqArticle from '@/components/faq/FaqArticle';

const faqArticles = {
  tracking: {
    title: 'How to Track Your Order',
    content: `Tracking your order is easy and can be done in a few simple steps:\n
1. Log into your account on our website\n
2. Go to the "Orders" section in your account dashboard\n
3. Click on the order you want to track\n
4. You'll see the current status and location of your order\n
You can also track your order using the tracking number that was sent to your email when your order was shipped. Simply enter this number in the tracking section of our website.`,
  },
  returns: {
    title: 'Our Return Policy',
    content: `We want you to be completely satisfied with your purchase. Here's our return policy:\n
• You have 30 days from the date of delivery to return your item\n
• Items must be unused and in their original packaging\n
• Free returns on all domestic orders\n
• International returns may be subject to shipping fees\n
To initiate a return, please log into your account and go to the "Orders" section, or contact our customer support team for assistance.`,
  },
};

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<keyof typeof faqArticles | null>(null);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Our Support Center
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Get instant help from our team of experts. We're here to assist you with any questions or concerns you might have.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <div className="bg-background border border-accent/20 p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Common Questions</h2>
            <div className="space-y-4">
              <button
                className="w-full text-left p-4 bg-accent/10 text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setSelectedFaq('tracking')}
              >
                How do I track my order?
              </button>
              <button
                className="w-full text-left p-4 bg-accent/10 text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setSelectedFaq('returns')}
              >
                What's your return policy?
              </button>
            </div>
          </div>

          <div className="bg-background border border-accent/20 p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Need More Help?</h2>
            <p className="text-foreground/80 mb-6">
              Our support team is available 24/7 to help you with any questions you might have.
            </p>
            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Chat
            </Button>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Why Choose Our Support?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6">
              <h3 className="font-semibold text-lg text-foreground mb-2">24/7 Availability</h3>
              <p className="text-foreground/80">
                Our team is always here to help you, any time of day or night.
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg text-foreground mb-2">Expert Support</h3>
              <p className="text-foreground/80">
                Get help from our team of experienced support professionals.
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg text-foreground mb-2">Quick Response</h3>
              <p className="text-foreground/80">
                We aim to respond to all inquiries within minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isChatOpen && (
        <Button
          className="fixed bottom-4 right-4 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageSquare className="mr-2 h-5 w-5" />
          Chat with us
        </Button>
      )}

      {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}

      {selectedFaq && (
        <FaqArticle
          title={faqArticles[selectedFaq].title}
          content={faqArticles[selectedFaq].content}
          onClose={() => setSelectedFaq(null)}
        />
      )}
    </main>
  );
}

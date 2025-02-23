import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to Our Chat Support</h1>
      <p className="text-xl text-center mb-12">
        We're here to help you with any questions or issues you may have. Check out our FAQs or start a chat with our
        support team.
      </p>
      <div className="flex justify-center space-x-4 mb-12">
        <Button asChild>
          <Link href="#faq1">FAQ: Account Issues</Link>
        </Button>
        <Button asChild>
          <Link href="#faq2">FAQ: Billing Questions</Link>
        </Button>
      </div>
      <div className="space-y-8">
        <section id="faq1" className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">FAQ: Account Issues</h2>
          <p>Here you can find information about common account-related problems and their solutions.</p>
        </section>
        <section id="faq2" className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">FAQ: Billing Questions</h2>
          <p>Find answers to frequently asked questions about billing, subscriptions, and payments.</p>
        </section>
      </div>
    </div>
  )
}

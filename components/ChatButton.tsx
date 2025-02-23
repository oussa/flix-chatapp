import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface ChatButtonProps {
  onClick: () => void
}

export default function ChatButton({ onClick }: ChatButtonProps) {
  return (
    <Button className="fixed bottom-4 right-4 rounded-full p-4" onClick={onClick}>
      <MessageCircle className="h-6 w-6" />
    </Button>
  )
}

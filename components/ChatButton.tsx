import Image from "next/image"

interface ChatButtonProps {
  onClick: () => void
}

export default function ChatButton({ onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden">
        <Image src="/flixy.png" alt="Chat with Flixy" width={48} height={48} />
      </div>
    </button>
  )
}

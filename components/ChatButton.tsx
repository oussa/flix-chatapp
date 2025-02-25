import Image from "next/image"

interface ChatButtonProps {
  onClick: () => void
}

export default function ChatButton({ onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-white/25 backdrop-blur-sm shadow-xl hover:shadow-3xl hover:scale-105 transition-scale transition-shadow duration-200 flex items-center justify-center z-50"
      aria-label="Open chat with support"
      role="button"
      tabIndex={0}
      title="Chat with support"
      data-testid="chat-button"
    >
      <div className="w-12 h-12 rounded-full overflow-hidden" aria-hidden="true">
        <Image src="/flixy.png" alt="" width={48} height={48} />
      </div>
    </button>
  )
}

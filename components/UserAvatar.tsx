interface UserAvatarProps {
  firstName: string
  lastName: string
  size?: "sm" | "md" | "lg"
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const getRandomColor = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-orange-500'
  ]
  
  // Use the sum of char codes to determine color
  const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return colors[charCodeSum % colors.length]
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg"
}

export default function UserAvatar({ firstName, lastName, size = "md" }: UserAvatarProps) {
  const initials = getInitials(firstName, lastName)
  const bgColor = getRandomColor(firstName + lastName)
  
  return (
    <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  )
} 
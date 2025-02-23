import {
  RotateCcw,
  Calendar,
  Map,
  CreditCard,
  Luggage,
  Ticket,
  Tag,
  MessageCircle,
  Baby,
  AccessibilityIcon,
  Lock,
  Mail
} from "lucide-react"

export const helpTopics = [
  {
    id: "refund",
    title: "Request a refund",
    icon: RotateCcw,
    link: "/help/refund"
  },
  {
    id: "bookings",
    title: "Manage your bookings",
    icon: Calendar,
    link: "/help/bookings"
  },
  {
    id: "route",
    title: "Route and delay info",
    icon: Map,
    link: "/help/route"
  },
  {
    id: "payment",
    title: "Payment Problems",
    icon: CreditCard,
    link: "/help/payment"
  },
  {
    id: "baggage",
    title: "Baggage",
    icon: Luggage,
    link: "/help/baggage"
  },
  {
    id: "booking",
    title: "Book a ticket",
    icon: Ticket,
    link: "/help/booking"
  },
  {
    id: "vouchers",
    title: "Vouchers",
    icon: Tag,
    link: "/help/vouchers"
  },
  {
    id: "feedback",
    title: "Feedback",
    icon: MessageCircle,
    link: "/help/feedback"
  },
  {
    id: "children",
    title: "Booking for Children",
    icon: Baby,
    link: "/help/children"
  },
  {
    id: "disabilities",
    title: "Passengers with disabilities",
    icon: AccessibilityIcon,
    link: "/help/disabilities"
  },
  {
    id: "security",
    title: "Security",
    icon: Lock,
    link: "/help/security"
  },
  {
    id: "contact",
    title: "Contact Us",
    icon: Mail,
    link: "/help/contact"
  }
] 
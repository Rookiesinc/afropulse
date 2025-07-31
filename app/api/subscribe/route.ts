import { NextResponse } from "next/server"

interface SubscribeRequest {
  email: string
}

interface Subscriber {
  email: string
  subscribedAt: string
  isActive: boolean
  verifiedAt?: string
}

// In-memory storage for demo purposes
// In production, this would be stored in a database like Supabase
const subscribers: Subscriber[] = [
  {
    email: "tobionisemo2020@gmail.com",
    subscribedAt: new Date().toISOString(),
    isActive: true,
    verifiedAt: new Date().toISOString(),
  },
  {
    email: "tosinogen2012@gmail.com",
    subscribedAt: new Date().toISOString(),
    isActive: true,
    verifiedAt: new Date().toISOString(),
  },
]

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: Request) {
  try {
    const body: SubscribeRequest = await request.json()
    const { email } = body

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const existingSubscriber = subscribers.find((sub) => sub.email === normalizedEmail)

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          {
            message: "You're already subscribed to our weekly digest!",
            status: "already_subscribed",
          },
          { status: 200 },
        )
      } else {
        // Reactivate existing subscriber
        existingSubscriber.isActive = true
        existingSubscriber.subscribedAt = new Date().toISOString()

        console.log(`✅ Reactivated subscriber: ${normalizedEmail}`)

        return NextResponse.json({
          message: "Welcome back! You've been resubscribed to our weekly digest.",
          status: "resubscribed",
        })
      }
    }

    // Add new subscriber
    const newSubscriber: Subscriber = {
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      isActive: true,
      verifiedAt: new Date().toISOString(), // Auto-verify for demo
    }

    subscribers.push(newSubscriber)

    console.log(`✅ New subscriber added: ${normalizedEmail}`)
    console.log(`📊 Total active subscribers: ${subscribers.filter((s) => s.isActive).length}`)

    return NextResponse.json({
      message: "Successfully subscribed! You'll receive our weekly Afrobeats digest every Monday.",
      status: "subscribed",
    })
  } catch (error) {
    console.error("Error in subscribe API:", error)
    return NextResponse.json({ error: "Failed to process subscription. Please try again." }, { status: 500 })
  }
}

export async function GET() {
  try {
    const activeSubscribers = subscribers.filter((sub) => sub.isActive)

    return NextResponse.json({
      message: "Subscription service is active",
      totalSubscribers: subscribers.length,
      activeSubscribers: activeSubscribers.length,
      status: "ready",
    })
  } catch (error) {
    console.error("Error checking subscription service:", error)
    return NextResponse.json({ error: "Subscription service unavailable" }, { status: 500 })
  }
}

// Export subscribers for use by other APIs (like send-digest)
export function getActiveSubscribers(): string[] {
  return subscribers.filter((sub) => sub.isActive).map((sub) => sub.email)
}

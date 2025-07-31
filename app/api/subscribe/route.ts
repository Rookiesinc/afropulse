import { type NextRequest, NextResponse } from "next/server"

interface Subscriber {
  email: string
  subscribedAt: string
  isActive: boolean
  verifiedAt?: string
}

// In-memory storage for demo (in production, use a database)
const subscribers: Subscriber[] = []

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function GET() {
  try {
    const activeCount = subscribers.filter((sub) => sub.isActive).length
    return NextResponse.json({
      total: activeCount,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error getting subscribers:", error)
    return NextResponse.json({ error: "Failed to get subscribers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const existingSubscriber = subscribers.find((sub) => sub.email === normalizedEmail)

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json({ error: "Email is already subscribed" }, { status: 409 })
      } else {
        // Reactivate existing subscriber
        existingSubscriber.isActive = true
        existingSubscriber.subscribedAt = new Date().toISOString()
        existingSubscriber.verifiedAt = new Date().toISOString()
      }
    } else {
      // Add new subscriber
      const newSubscriber: Subscriber = {
        email: normalizedEmail,
        subscribedAt: new Date().toISOString(),
        isActive: true,
        verifiedAt: new Date().toISOString(),
      }
      subscribers.push(newSubscriber)
    }

    const activeCount = subscribers.filter((sub) => sub.isActive).length

    console.log(`✅ New subscriber added: ${normalizedEmail}`)

    return NextResponse.json({
      message: "Successfully subscribed to weekly digest!",
      email: normalizedEmail,
      total: activeCount,
    })
  } catch (error) {
    console.error("❌ Error subscribing email:", error)
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find and deactivate subscriber
    const subscriber = subscribers.find((sub) => sub.email === normalizedEmail)

    if (!subscriber) {
      return NextResponse.json({ error: "Email not found in subscription list" }, { status: 404 })
    }

    subscriber.isActive = false
    const activeCount = subscribers.filter((sub) => sub.isActive).length

    console.log(`✅ Subscriber unsubscribed: ${normalizedEmail}`)

    return NextResponse.json({
      message: "Successfully unsubscribed from weekly digest",
      email: normalizedEmail,
      total: activeCount,
    })
  } catch (error) {
    console.error("❌ Error unsubscribing email:", error)
    return NextResponse.json({ error: "Failed to unsubscribe. Please try again." }, { status: 500 })
  }
}

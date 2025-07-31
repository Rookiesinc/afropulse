import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

interface Subscriber {
  email: string
  subscribedAt: string
  isActive: boolean
  verificationToken?: string
  verifiedAt?: string
}

interface SubscriberData {
  subscribers: Subscriber[]
  total: number
  lastUpdated: string
}

async function getSubscribers(): Promise<SubscriberData> {
  try {
    const dataDir = path.join(process.cwd(), "data")
    const filePath = path.join(dataDir, "subscribers.json")

    // Ensure directory exists
    await fs.mkdir(dataDir, { recursive: true })

    try {
      const data = await fs.readFile(filePath, "utf8")
      const parsed = JSON.parse(data)
      return {
        subscribers: parsed.subscribers || [],
        total: parsed.total || 0,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      }
    } catch (error) {
      // File doesn't exist, return empty data
      return {
        subscribers: [],
        total: 0,
        lastUpdated: new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error("Error reading subscribers:", error)
    return {
      subscribers: [],
      total: 0,
      lastUpdated: new Date().toISOString(),
    }
  }
}

async function saveSubscribers(data: SubscriberData): Promise<void> {
  try {
    const dataDir = path.join(process.cwd(), "data")
    const filePath = path.join(dataDir, "subscribers.json")

    // Ensure directory exists
    await fs.mkdir(dataDir, { recursive: true })

    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Error saving subscribers:", error)
    throw error
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function GET() {
  try {
    const data = await getSubscribers()
    return NextResponse.json({
      total: data.total,
      lastUpdated: data.lastUpdated,
    })
  } catch (error) {
    console.error("Error getting subscribers:", error)
    return NextResponse.json({ error: "Failed to get subscribers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const data = await getSubscribers()

    // Check if email already exists
    const existingSubscriber = data.subscribers.find((sub) => sub.email === normalizedEmail)

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
      data.subscribers.push(newSubscriber)
    }

    // Update totals
    data.total = data.subscribers.filter((sub) => sub.isActive).length
    data.lastUpdated = new Date().toISOString()

    await saveSubscribers(data)

    return NextResponse.json({
      message: "Successfully subscribed to weekly digest!",
      email: normalizedEmail,
      total: data.total,
    })
  } catch (error) {
    console.error("Error subscribing email:", error)
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const data = await getSubscribers()

    // Find and deactivate subscriber
    const subscriber = data.subscribers.find((sub) => sub.email === normalizedEmail)

    if (!subscriber) {
      return NextResponse.json({ error: "Email not found in subscription list" }, { status: 404 })
    }

    subscriber.isActive = false
    data.total = data.subscribers.filter((sub) => sub.isActive).length
    data.lastUpdated = new Date().toISOString()

    await saveSubscribers(data)

    return NextResponse.json({
      message: "Successfully unsubscribed from weekly digest",
      email: normalizedEmail,
      total: data.total,
    })
  } catch (error) {
    console.error("Error unsubscribing email:", error)
    return NextResponse.json({ error: "Failed to unsubscribe. Please try again." }, { status: 500 })
  }
}

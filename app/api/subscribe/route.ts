import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

interface Subscriber {
  email: string
  verified: boolean
  subscribed_at: string
  unsubscribed_at?: string
  status: "active" | "unsubscribed" | "pending"
}

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json")

async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

async function readSubscribers(): Promise<Subscriber[]> {
  try {
    await ensureDataDirectory()
    const data = await fs.readFile(SUBSCRIBERS_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist or is empty, return empty array
    return []
  }
}

async function writeSubscribers(subscribers: Subscriber[]): Promise<void> {
  await ensureDataDirectory()
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2))
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const subscribers = await readSubscribers()

    // Check if email already exists
    const existingSubscriber = subscribers.find((sub) => sub.email === normalizedEmail)

    if (existingSubscriber) {
      if (existingSubscriber.status === "active") {
        return NextResponse.json({ error: "Email is already subscribed to our newsletter" }, { status: 400 })
      } else if (existingSubscriber.status === "unsubscribed") {
        // Reactivate the subscription
        existingSubscriber.status = "active"
        existingSubscriber.verified = true
        existingSubscriber.subscribed_at = new Date().toISOString()
        delete existingSubscriber.unsubscribed_at

        await writeSubscribers(subscribers)

        return NextResponse.json({
          success: true,
          message: "Welcome back! Your subscription has been reactivated.",
        })
      }
    }

    // Add new subscriber
    const newSubscriber: Subscriber = {
      email: normalizedEmail,
      verified: true, // Auto-verify for simplicity
      subscribed_at: new Date().toISOString(),
      status: "active",
    }

    subscribers.push(newSubscriber)
    await writeSubscribers(subscribers)

    console.log(`✅ New subscriber added: ${normalizedEmail}`)

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed! You'll receive our weekly digest every Friday.",
    })
  } catch (error: any) {
    console.error("❌ Error in subscribe API:", error)
    return NextResponse.json(
      {
        error: "Failed to subscribe. Please try again later.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const subscribers = await readSubscribers()
    const activeSubscribers = subscribers.filter((sub) => sub.status === "active")

    return NextResponse.json({
      total: subscribers.length,
      active: activeSubscribers.length,
      subscribers: activeSubscribers.map((sub) => ({
        email: sub.email,
        subscribed_at: sub.subscribed_at,
        verified: sub.verified,
      })),
    })
  } catch (error: any) {
    console.error("❌ Error fetching subscribers:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }
}

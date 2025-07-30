import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface Subscriber {
  email: string
  subscribedAt: string
  active: boolean
}

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json")

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(SUBSCRIBERS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Read subscribers from file
function readSubscribers(): Subscriber[] {
  ensureDataDirectory()
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const data = fs.readFileSync(SUBSCRIBERS_FILE, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error reading subscribers:", error)
  }
  return []
}

// Write subscribers to file
function writeSubscribers(subscribers: Subscriber[]) {
  ensureDataDirectory()
  try {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2))
  } catch (error) {
    console.error("Error writing subscribers:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const subscribers = readSubscribers()

    // Check if email already exists
    const existingSubscriber = subscribers.find((sub) => sub.email === email)
    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return NextResponse.json({ error: "Email already subscribed" }, { status: 409 })
      } else {
        // Reactivate subscription
        existingSubscriber.active = true
        existingSubscriber.subscribedAt = new Date().toISOString()
      }
    } else {
      // Add new subscriber
      subscribers.push({
        email,
        subscribedAt: new Date().toISOString(),
        active: true,
      })
    }

    writeSubscribers(subscribers)

    return NextResponse.json({
      message: "Successfully subscribed to weekly digest",
      email,
    })
  } catch (error) {
    console.error("Error subscribing email:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const subscribers = readSubscribers()
    const activeSubscribers = subscribers.filter((sub) => sub.active)

    return NextResponse.json({
      total: activeSubscribers.length,
      subscribers: activeSubscribers.map((sub) => ({
        email: sub.email,
        subscribedAt: sub.subscribedAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }
}

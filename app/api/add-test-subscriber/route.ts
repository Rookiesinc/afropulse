import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface Subscriber {
  email: string
  subscribedAt: string
  active: boolean
}

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json")

function ensureDataDirectory() {
  const dataDir = path.dirname(SUBSCRIBERS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

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

function writeSubscribers(subscribers: Subscriber[]) {
  ensureDataDirectory()
  try {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2))
  } catch (error) {
    console.error("Error writing subscribers:", error)
    throw error
  }
}

export async function POST() {
  try {
    const testEmails = ["tobionisemo2020@gmail.com", "tosinogen2012@gmail.com"]
    const results = []
    const subscribers = readSubscribers()

    for (const testEmail of testEmails) {
      // Check if email already exists
      const existingSubscriber = subscribers.find((sub) => sub.email === testEmail)
      
      if (existingSubscriber) {
        if (existingSubscriber.active) {
          results.push({
            email: testEmail,
            status: "already_active",
            message: "Already subscribed and active"
          })
        } else {
          // Reactivate subscription
          existingSubscriber.active = true
          existingSubscriber.subscribedAt = new Date().toISOString()
          results.push({
            email: testEmail,
            status: "reactivated", 
            message: "Subscription reactivated"
          })
        }
      } else {
        // Add new test subscriber
        subscribers.push({
          email: testEmail,
          subscribedAt: new Date().toISOString(),
          active: true,
        })
        results.push({
          email: testEmail,
          status: "added",
          message: "Successfully added to subscribers"
        })
      }
    }

    writeSubscribers(subscribers)

    return NextResponse.json({
      message: "Test email processing completed",
      results: results,
      totalProcessed: testEmails.length
    })
  } catch (error) {
    console.error("Error adding test subscriber:", error)
    return NextResponse.json({ 
      error: "Failed to add test subscriber",
      details: error 
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}

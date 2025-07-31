import { NextResponse } from "next/server"
import { writeFile, readFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

interface Subscriber {
  email: string
  subscribedAt: string
  isActive: boolean
  verifiedAt?: string
}

interface SubscriberData {
  subscribers: Subscriber[]
  total: number
  lastUpdated: string
}

const TEST_EMAIL = "tobionisemo2020@gmail.com"

async function getSubscribersFilePath(): Promise<string> {
  const dataDir = path.join(process.cwd(), "data")

  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }

  return path.join(dataDir, "subscribers.json")
}

async function getSubscribers(): Promise<SubscriberData> {
  try {
    const filePath = await getSubscribersFilePath()

    if (!existsSync(filePath)) {
      const initialData: SubscriberData = {
        subscribers: [],
        total: 0,
        lastUpdated: new Date().toISOString(),
      }
      await writeFile(filePath, JSON.stringify(initialData, null, 2))
      return initialData
    }

    const data = await readFile(filePath, "utf8")
    const parsed = JSON.parse(data)

    return {
      subscribers: parsed.subscribers || [],
      total: parsed.total || 0,
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
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
    const filePath = await getSubscribersFilePath()
    await writeFile(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Error saving subscribers:", error)
    throw error
  }
}

export async function POST() {
  try {
    const data = await getSubscribers()

    // Check if test email already exists
    const existingSubscriber = data.subscribers.find((sub) => sub.email === TEST_EMAIL)

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json({
          message: "Test subscriber already exists and is active",
          email: TEST_EMAIL,
          total: data.total,
        })
      } else {
        // Reactivate existing subscriber
        existingSubscriber.isActive = true
        existingSubscriber.subscribedAt = new Date().toISOString()
        existingSubscriber.verifiedAt = new Date().toISOString()
      }
    } else {
      // Add new test subscriber
      const newSubscriber: Subscriber = {
        email: TEST_EMAIL,
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

    console.log(`✅ Test subscriber added/activated: ${TEST_EMAIL}`)

    return NextResponse.json({
      message: "Test subscriber added successfully",
      email: TEST_EMAIL,
      total: data.total,
    })
  } catch (error) {
    console.error("❌ Error adding test subscriber:", error)
    return NextResponse.json({ error: "Failed to add test subscriber" }, { status: 500 })
  }
}

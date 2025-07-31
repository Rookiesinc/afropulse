import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { promises as fs } from "fs"
import path from "path"

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json")

interface Subscriber {
  email: string
  subscribedAt: string
  verified: boolean
  verificationToken?: string
}

// In-memory cache for subscribers to reduce file reads
let subscribersCache: Subscriber[] | null = null

async function readSubscribers(): Promise<Subscriber[]> {
  if (subscribersCache) {
    return subscribersCache
  }
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, "utf8")
    subscribersCache = JSON.parse(data)
    return subscribersCache
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // File does not exist, return empty array and create the directory/file
      await fs.mkdir(path.dirname(SUBSCRIBERS_FILE), { recursive: true })
      await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify([]), "utf8")
      subscribersCache = []
      return []
    }
    console.error("Error reading subscribers file:", error)
    throw new Error("Failed to read subscribers data")
  }
}

async function writeSubscribers(subscribers: Subscriber[]): Promise<void> {
  subscribersCache = subscribers // Update cache
  try {
    await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), "utf8")
  } catch (error) {
    console.error("Error writing subscribers file:", error)
    throw new Error("Failed to write subscribers data")
  }
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Function to generate a simple verification token
function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const subscribers = await readSubscribers()
    const existingSubscriber = subscribers.find((s) => s.email === email)

    if (existingSubscriber) {
      if (existingSubscriber.verified) {
        return NextResponse.json({ message: "Email already subscribed and verified" }, { status: 200 })
      } else {
        // Resend verification email if not verified
        const verificationToken = existingSubscriber.verificationToken || generateVerificationToken()
        existingSubscriber.verificationToken = verificationToken
        await writeSubscribers(subscribers) // Save updated token if new

        const verificationLink = `${process.env.VERCEL_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

        const mailOptions = {
          from: `"Afropulse" <${process.env.GMAIL_USER}>`, // Use GMAIL_USER directly
          to: email,
          subject: "Verify your Afropulse Subscription",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #e53e3e;">Welcome to Afropulse!</h2>
              <p>Thank you for subscribing to our weekly digest of the hottest African music releases and trends.</p>
              <p>Please verify your email address by clicking the link below:</p>
              <p style="margin: 20px 0;">
                <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #e53e3e; color: #ffffff; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
              </p>
              <p>This link will expire in 24 hours.</p>
              <p>If you did not subscribe to Afropulse, please ignore this email.</p>
              <p>Best regards,<br/>The Afropulse Team</p>
            </div>
          `,
        }

        await new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (err) => {
            if (err) {
              console.error("Error sending verification email:", err)
              return reject(new Error("Failed to send verification email"))
            }
            resolve(true)
          })
        })

        return NextResponse.json({ message: "Verification email re-sent. Please check your inbox." }, { status: 200 })
      }
    }

    // New subscriber
    const verificationToken = generateVerificationToken()
    const newSubscriber: Subscriber = {
      email,
      subscribedAt: new Date().toISOString(),
      verified: false,
      verificationToken,
    }
    subscribers.push(newSubscriber)
    await writeSubscribers(subscribers)

    const verificationLink = `${process.env.VERCEL_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    const mailOptions = {
      from: `"Afropulse" <${process.env.GMAIL_USER}>`, // Use GMAIL_USER directly
      to: email,
      subject: "Verify your Afropulse Subscription",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #e53e3e;">Welcome to Afropulse!</h2>
          <p>Thank you for subscribing to our weekly digest of the hottest African music releases and trends.</p>
          <p>Please verify your email address by clicking the link below:</p>
          <p style="margin: 20px 0;">
            <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #e53e3e; color: #ffffff; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
          </p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not subscribe to Afropulse, please ignore this email.</p>
          <p>Best regards,<br/>The Afropulse Team</p>
        </div>
      `,
    }

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error("Error sending verification email:", err)
          return reject(new Error("Failed to send verification email"))
        }
        resolve(true)
      })
    })

    return NextResponse.json(
      { message: "Subscription successful! Please check your email to verify." },
      { status: 200 },
    )
  } catch (error) {
    console.error("Subscription API error:", error)
    return NextResponse.json({ error: "Failed to subscribe. Please try again later." }, { status: 500 })
  }
}

export async function GET() {
  try {
    const subscribers = await readSubscribers()
    return NextResponse.json({ total: subscribers.length, verified: subscribers.filter((s) => s.verified).length })
  } catch (error) {
    console.error("Error fetching subscriber count:", error)
    return NextResponse.json({ total: 0, error: "Failed to fetch subscriber count" }, { status: 500 })
  }
}

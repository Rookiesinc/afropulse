import { NextResponse } from "next/server"
import { Resend } from "resend"

// In-memory storage for subscribers (for Vercel serverless environment)
// In a real application, you would use a database (e.g., Supabase, Neon, Vercel Postgres)
interface Subscriber {
  email: string
  subscribedAt: string
  verified: boolean
  verificationToken: string
}

// Using a simple array for demonstration.
// In a production app, this would be a database client.
const subscribers: Subscriber[] = []

// For demonstration purposes, you might want to load initial data or persist it
// in a more robust way (e.g., Vercel Blob, Redis with Upstash).
// For now, it resets on cold starts of the serverless function.

const RESEND_API_KEY = process.env.RESEND_API_KEY
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

// Helper to generate a simple token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    const existingSubscriber = subscribers.find((s) => s.email === email)

    if (existingSubscriber) {
      if (existingSubscriber.verified) {
        return NextResponse.json({ message: "Email already subscribed and verified" }, { status: 200 })
      } else {
        // Resend verification email if not verified
        const verificationToken = generateToken()
        existingSubscriber.verificationToken = verificationToken
        console.log(`Subscriber ${email} found but not verified. Resending verification email.`)

        if (resend) {
          try {
            await resend.emails.send({
              from: "onboarding@resend.dev", // Replace with your verified Resend domain
              to: email,
              subject: "Verify your Afrobeats Digest Subscription",
              html: `
                <h1>Verify Your Subscription</h1>
                <p>Thank you for subscribing to the Afrobeats Digest! Please click the link below to verify your email address:</p>
                <p><a href="${process.env.VERCEL_URL}/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}">Verify Email</a></p>
                <p>If you did not subscribe, please ignore this email.</p>
              `,
            })
            return NextResponse.json(
              { message: "Email already subscribed but not verified. Verification email re-sent." },
              { status: 200 },
            )
          } catch (emailError) {
            console.error("Error resending verification email:", emailError)
            return NextResponse.json(
              { message: "Failed to resend verification email. Please try again later." },
              { status: 500 },
            )
          }
        } else {
          console.warn("Resend API key not configured. Cannot send verification email.")
          return NextResponse.json(
            {
              message:
                "Email already subscribed but not verified. Verification email not sent (Resend not configured).",
            },
            { status: 200 },
          )
        }
      }
    }

    const verificationToken = generateToken()
    const newSubscriber: Subscriber = {
      email,
      subscribedAt: new Date().toISOString(),
      verified: false,
      verificationToken,
    }
    subscribers.push(newSubscriber)
    console.log(`New subscriber added: ${email}. Verification email sent.`)

    if (resend) {
      try {
        await resend.emails.send({
          from: "onboarding@resend.dev", // Replace with your verified Resend domain
          to: email,
          subject: "Verify your Afrobeats Digest Subscription",
          html: `
            <h1>Verify Your Subscription</h1>
            <p>Thank you for subscribing to the Afrobeats Digest! Please click the link below to verify your email address:</p>
            <p><a href="${process.env.VERCEL_URL}/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}">Verify Email</a></p>
            <p>If you did not subscribe, please ignore this email.</p>
          `,
        })
      } catch (emailError) {
        console.error("Error sending verification email:", emailError)
        return NextResponse.json(
          { message: "Subscription successful, but failed to send verification email." },
          { status: 500 },
        )
      }
    } else {
      console.warn("Resend API key not configured. Cannot send verification email.")
    }

    return NextResponse.json(
      { message: "Subscription successful! Please check your email to verify." },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in subscribe API:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// For demonstration/testing purposes, allow getting subscribers
export async function GET() {
  return NextResponse.json({ subscribers: subscribers.map((s) => ({ email: s.email, verified: s.verified })) })
}

// For demonstration/testing purposes, allow verifying an email
export async function PUT(request: Request) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ message: "Email and token are required" }, { status: 400 })
    }

    const subscriber = subscribers.find((s) => s.email === email)

    if (!subscriber) {
      return NextResponse.json({ message: "Subscriber not found" }, { status: 404 })
    }

    if (subscriber.verificationToken === token) {
      subscriber.verified = true
      subscriber.verificationToken = "" // Clear token after verification
      console.log(`Subscriber ${email} successfully verified.`)
      return NextResponse.json({ message: "Email verified successfully!" }, { status: 200 })
    } else {
      return NextResponse.json({ message: "Invalid verification token" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in verify email API:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

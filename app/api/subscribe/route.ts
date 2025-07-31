import { NextResponse } from "next/server"
import { Resend } from "resend"

// Check for Resend API key during build/runtime
const RESEND_API_KEY = process.env.RESEND_API_KEY
if (!RESEND_API_KEY) {
  // This error will be caught during the build process if the key is missing
  throw new Error("RESEND_API_KEY is not set. Please set it in your environment variables.")
}
const resend = new Resend(RESEND_API_KEY)

// In-memory storage for subscribers (for demonstration purposes)
// In a real application, you would use a database (e.g., Supabase, Neon, Vercel Postgres)
interface Subscriber {
  email: string
  verified: boolean
  token: string
  subscribedAt: string
}

// This is a simplified in-memory store. It will reset on serverless cold starts.
// For production, replace with a persistent database.
const subscribers: Subscriber[] = []

// Function to generate a simple verification token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 })
    }

    const existingSubscriber = subscribers.find((s) => s.email === email)

    if (existingSubscriber) {
      if (existingSubscriber.verified) {
        return NextResponse.json({ message: "Email already subscribed and verified!" }, { status: 200 })
      } else {
        // Resend verification email if not verified
        const newToken = generateToken()
        existingSubscriber.token = newToken
        existingSubscriber.subscribedAt = new Date().toISOString() // Update timestamp
        console.log(`Resending verification email to ${email} with new token.`)

        const verificationLink = `${process.env.VERCEL_URL}/verify-email?email=${encodeURIComponent(email)}&token=${newToken}`

        await resend.emails.send({
          from: "Afrobeats Digest <onboarding@resend.dev>", // Replace with your verified Resend domain
          to: email,
          subject: "Verify Your Afrobeats Digest Subscription",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #007bff; text-align: center;">Confirm Your Subscription to Afrobeats Digest!</h2>
              <p>Hello,</p>
              <p>Thank you for subscribing to the Afrobeats Digest! To complete your subscription and start receiving weekly updates on the hottest new Afrobeats releases, please verify your email address by clicking the link below:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify My Email</a>
              </p>
              <p>This link will expire in 24 hours. If you did not subscribe to this digest, please ignore this email.</p>
              <p>Best regards,<br>The Afrobeats Digest Team</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 0.8em; color: #777; text-align: center;">If you have trouble clicking the "Verify My Email" button, copy and paste the URL below into your web browser:</p>
              <p style="font-size: 0.8em; color: #777; text-align: center; word-break: break-all;">${verificationLink}</p>
            </div>
          `,
        })

        return NextResponse.json(
          { message: "Subscription pending verification. Verification email re-sent!" },
          { status: 200 },
        )
      }
    }

    const token = generateToken()
    const newSubscriber: Subscriber = {
      email,
      verified: false,
      token,
      subscribedAt: new Date().toISOString(),
    }
    subscribers.push(newSubscriber)
    console.log(`New subscriber added: ${email}. Pending verification.`)

    const verificationLink = `${process.env.VERCEL_URL}/verify-email?email=${encodeURIComponent(email)}&token=${token}`

    await resend.emails.send({
      from: "Afrobeats Digest <onboarding@resend.dev>", // Replace with your verified Resend domain
      to: email,
      subject: "Verify Your Afrobeats Digest Subscription",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #007bff; text-align: center;">Confirm Your Subscription to Afrobeats Digest!</h2>
          <p>Hello,</p>
          <p>Thank you for subscribing to the Afrobeats Digest! To complete your subscription and start receiving weekly updates on the hottest new Afrobeats releases, please verify your email address by clicking the link below:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify My Email</a>
          </p>
          <p>This link will expire in 24 hours. If you did not subscribe to this digest, please ignore this email.</p>
          <p>Best regards,<br>The Afrobeats Digest Team</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.8em; color: #777; text-align: center;">If you have trouble clicking the "Verify My Email" button, copy and paste the URL below into your web browser:</p>
          <p style="font-size: 0.8em; color: #777; text-align: center; word-break: break-all;">${verificationLink}</p>
        </div>
      `,
    })

    return NextResponse.json(
      { message: "Subscription successful! Please check your email to verify." },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error subscribing:", error)
    return NextResponse.json({ message: "Failed to subscribe. Please try again later." }, { status: 500 })
  }
}

// This endpoint is for verification.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")
  const token = searchParams.get("token")

  if (!email || !token) {
    return NextResponse.json({ message: "Missing email or token" }, { status: 400 })
  }

  const subscriber = subscribers.find((s) => s.email === email)

  if (subscriber && subscriber.token === token) {
    subscriber.verified = true
    subscriber.token = "" // Clear token after verification
    console.log(`Email ${email} verified successfully.`)
    return NextResponse.json({ message: "Email verified successfully! You are now subscribed." }, { status: 200 })
  } else {
    return NextResponse.json({ message: "Invalid or expired verification link." }, { status: 400 })
  }
}

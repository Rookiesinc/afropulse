import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// In-memory storage for subscribers (for demonstration purposes)
interface Subscriber {
  email: string
  subscribedAt: string
  verified: boolean
  verificationToken?: string
}

// Using a Map for in-memory storage for better performance and direct access
const subscribers = new Map<string, Subscriber>()

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

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (subscribers.has(normalizedEmail)) {
      const existingSubscriber = subscribers.get(normalizedEmail)!
      if (existingSubscriber.verified) {
        return NextResponse.json({ error: "Email already subscribed and verified" }, { status: 409 })
      } else {
        // Resend verification email if not verified
        const verificationToken = existingSubscriber.verificationToken || generateVerificationToken()
        existingSubscriber.verificationToken = verificationToken
        subscribers.set(normalizedEmail, existingSubscriber) // Update token if regenerated

        const verificationLink = `${process.env.VERCEL_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`

        const mailOptions = {
          from: `"Afropulse" <${process.env.GMAIL_USER}>`, // Use GMAIL_USER directly
          to: normalizedEmail,
          subject: "Verify your Afropulse Subscription",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #ff5722;">Confirm Your Afropulse Subscription</h2>
              <p>Thank you for subscribing to our weekly Afrobeats digest!</p>
              <p>Please click the button below to verify your email address and activate your subscription:</p>
              <p style="text-align: center;">
                <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #ff5722; color: #ffffff; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
              </p>
              <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
              <p><a href="${verificationLink}">${verificationLink}</a></p>
              <p>This link will expire in 24 hours.</p>
              <p>If you did not subscribe to Afropulse, please ignore this email.</p>
              <p>Best regards,<br>The Afropulse Team</p>
            </div>
          `,
        }

        try {
          const sendMailPromise = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Email sending timed out"))
            }, 10000) // 10 seconds timeout

            transporter.sendMail(mailOptions, (error, info) => {
              clearTimeout(timeout)
              if (error) {
                console.error("Error sending verification email:", error)
                reject(error)
              } else {
                console.log("Verification email sent:", info.response)
                resolve()
              }
            })
          })
          await sendMailPromise
          return NextResponse.json({ message: "Verification email resent. Please check your inbox." }, { status: 200 })
        } catch (emailError) {
          console.error("Failed to resend verification email:", emailError)
          return NextResponse.json(
            { error: "Failed to resend verification email. Please try again later." },
            { status: 500 },
          )
        }
      }
    }

    const verificationToken = generateVerificationToken()
    subscribers.set(normalizedEmail, {
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      verified: false,
      verificationToken,
    })

    const verificationLink = `${process.env.VERCEL_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`

    const mailOptions = {
      from: `"Afropulse" <${process.env.GMAIL_USER}>`, // Use GMAIL_USER directly
      to: normalizedEmail,
      subject: "Verify your Afropulse Subscription",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #ff5722;">Confirm Your Afropulse Subscription</h2>
          <p>Thank you for subscribing to our weekly Afrobeats digest!</p>
          <p>Please click the button below to verify your email address and activate your subscription:</p>
          <p style="text-align: center;">
            <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #ff5722; color: #ffffff; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
          </p>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not subscribe to Afropulse, please ignore this email.</p>
          <p>Best regards,<br>The Afropulse Team</p>
        </div>
      `,
    }

    const sendMailPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Email sending timed out"))
      }, 10000) // 10 seconds timeout

      transporter.sendMail(mailOptions, (error, info) => {
        clearTimeout(timeout)
        if (error) {
          console.error("Error sending verification email:", error)
          reject(error)
        } else {
          console.log("Verification email sent:", info.response)
          resolve()
        }
      })
    })

    await sendMailPromise

    return NextResponse.json(
      { message: "Subscription successful! Please check your email to verify." },
      { status: 200 },
    )
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Failed to subscribe. Please try again later." }, { status: 500 })
  }
}

// Export subscribers map for other routes (e.g., verify-email, send-digest)
export { subscribers }

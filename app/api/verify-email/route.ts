import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

const TEST_EMAILS = ["tobionisemo2020@gmail.com", "tosinogen2012@gmail.com"]

export async function POST(request: Request) {
  try {
    console.log("🔍 Starting email delivery verification...")
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check email configuration
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error("❌ Email configuration missing")
      return NextResponse.json({ error: "Email configuration missing" }, { status: 500 })
    }

    // Create transporter
    console.log("📮 Setting up email transporter...")
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    })

    // Verify transporter
    try {
      await transporter.verify()
      console.log("✅ Email transporter verified")
    } catch (error) {
      console.error("❌ Email transporter verification failed:", error)
      return NextResponse.json({ error: "Email service unavailable" }, { status: 500 })
    }

    // Generate verification token (in production, store this in database)
    const verificationToken = Math.random().toString(36).substring(2, 15)
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    const mailOptions = {
      from: `"Afrobeats Tracker" <${GMAIL_USER}>`,
      to: email,
      subject: "🎵 Verify Your Email - Afrobeats Tracker",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎵 Afrobeats Tracker</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your Gateway to African Music</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
            
            <p>Welcome to Afrobeats Tracker! 🎉</p>
            
            <p>To complete your subscription and start receiving weekly updates about the hottest Afrobeats releases, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
                ✅ Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">${verificationUrl}</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <h3 style="color: #ff6b35;">What You'll Get:</h3>
            <ul style="color: #666;">
              <li>🎵 Weekly digest of the hottest new Afrobeats releases</li>
              <li>🔥 Trending songs and viral hits</li>
              <li>🌟 Discover new and emerging African artists</li>
              <li>📊 Social media buzz and chart performance</li>
              <li>🎤 Entertainment news and industry updates</li>
            </ul>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This verification link will expire in 24 hours. If you didn't sign up for Afrobeats Tracker, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2024 Afrobeats Tracker. Made with ❤️ for African music lovers.</p>
          </div>
        </body>
        </html>
      `,
    }

    // Add timeout to email sending
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Email timeout")), 30000)
    })

    await Promise.race([transporter.sendMail(mailOptions), timeoutPromise])

    console.log(`✅ Verification email sent to ${email}`)

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
      email: email,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error sending verification email:", error)
    return NextResponse.json(
      {
        error: "Failed to send verification email",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Email verification service is ready",
    testEmails: TEST_EMAILS,
    status: "ready",
  })
}

import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET() {
  try {
    const gmailUser = process.env.GMAIL_USER
    const gmailPassword = process.env.GMAIL_APP_PASSWORD

    if (!gmailUser || !gmailPassword) {
      return NextResponse.json({
        status: "error",
        message: "Gmail credentials not configured",
        details: {
          gmailUser: gmailUser ? "✅ Set" : "❌ Missing",
          gmailPassword: gmailPassword ? "✅ Set" : "❌ Missing",
        },
        instructions: {
          step1: "Enable 2-Factor Authentication on your Gmail account",
          step2: "Go to https://myaccount.google.com/apppasswords",
          step3: "Generate a new App Password for 'Mail'",
          step4: "Set GMAIL_USER=your-email@gmail.com",
          step5: "Set GMAIL_APP_PASSWORD=your16characterapppassword",
        },
      })
    }

    // Test Gmail connection
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    })

    // Verify connection
    await transporter.verify()

    return NextResponse.json({
      status: "success",
      message: "Gmail SMTP connection successful",
      details: {
        gmailUser: gmailUser,
        gmailPassword: "✅ Set (hidden for security)",
        connectionTest: "✅ Passed",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Gmail connection error:", error)

    let errorMessage = "Unknown error"
    let troubleshooting = []

    if (error.code === "EAUTH") {
      errorMessage = "Authentication failed"
      troubleshooting = [
        "Check that 2-Factor Authentication is enabled on your Gmail account",
        "Verify you're using an App Password, not your regular Gmail password",
        "Make sure the App Password is exactly 16 characters",
        "Try generating a new App Password",
      ]
    } else if (error.code === "ENOTFOUND") {
      errorMessage = "Network connection failed"
      troubleshooting = ["Check your internet connection", "Verify DNS settings", "Try again in a few minutes"]
    } else if (error.code === "ETIMEDOUT") {
      errorMessage = "Connection timeout"
      troubleshooting = ["Check firewall settings", "Verify network connectivity", "Try again later"]
    }

    return NextResponse.json({
      status: "error",
      message: `Gmail SMTP connection failed: ${errorMessage}`,
      error: {
        code: error.code,
        message: error.message,
      },
      troubleshooting,
      timestamp: new Date().toISOString(),
    })
  }
}

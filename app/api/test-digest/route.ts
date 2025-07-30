import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const gmailUser = process.env.GMAIL_USER
    const gmailPassword = process.env.GMAIL_APP_PASSWORD

    if (!gmailUser || !gmailPassword) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    // Fetch sample data for the digest
    const [releasesResponse, buzzingResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/releases`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/buzzing`),
    ])

    const releasesData = await releasesResponse.json()
    const buzzingData = await buzzingResponse.json()

    const releases = releasesData.songs?.slice(0, 5) || []
    const buzzing = buzzingData.songs?.slice(0, 5) || []

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    })

    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const mailOptions = {
      from: `"Afrobeats Tracker" <${gmailUser}>`,
      to: email,
      subject: `🎵 Test Digest - Afrobeats Weekly (${currentDate})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Afrobeats Weekly Digest</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);">
            <h1 style="color: white; margin: 0; font-size: 32px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🎵 Afrobeats Weekly</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">TEST DIGEST - ${currentDate}</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: white; padding: 0; border-radius: 0 0 15px 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Welcome Message -->
            <div style="padding: 30px 30px 20px 30px;">
              <h2 style="color: #ff6b35; margin: 0 0 15px 0; font-size: 24px;">🔥 This Week's Heat!</h2>
              <p style="margin: 0; color: #666; font-size: 16px;">This is a test digest to verify your email setup. Here's what's trending in Afrobeats right now!</p>
            </div>
            
            <!-- New Releases Section -->
            <div style="padding: 0 30px 20px 30px;">
              <h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #ff6b35; padding-bottom: 10px;">🆕 Fresh Releases</h3>
              ${releases
                .map(
                  (song: any, index: number) => `
                <div style="background: #f8f9fa; padding: 15px; margin-bottom: 15px; border-radius: 10px; border-left: 4px solid #ff6b35;">
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="background: #ff6b35; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px;">${index + 1}</span>
                    <h4 style="margin: 0; color: #333; font-size: 16px;">${song.name}</h4>
                  </div>
                  <p style="margin: 0 0 8px 36px; color: #666; font-size: 14px;"><strong>Artist:</strong> ${song.artist}</p>
                  <p style="margin: 0 0 8px 36px; color: #666; font-size: 14px;"><strong>Album:</strong> ${song.album}</p>
                  ${song.isNewArtist ? '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 36px;">🌟 NEW ARTIST</span>' : ""}
                </div>
              `,
                )
                .join("")}
            </div>
            
            <!-- Buzzing Section -->
            <div style="padding: 0 30px 30px 30px;">
              <h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #f7931e; padding-bottom: 10px;">📈 Currently Buzzing</h3>
              ${buzzing
                .map(
                  (song: any, index: number) => `
                <div style="background: #fff3e0; padding: 15px; margin-bottom: 15px; border-radius: 10px; border-left: 4px solid #f7931e;">
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="background: #f7931e; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px;">${index + 1}</span>
                    <h4 style="margin: 0; color: #333; font-size: 16px;">${song.name}</h4>
                  </div>
                  <p style="margin: 0 0 8px 36px; color: #666; font-size: 14px;"><strong>Artist:</strong> ${song.artist}</p>
                  <p style="margin: 0 0 8px 36px; color: #666; font-size: 14px;"><strong>Buzz Score:</strong> ${song.buzzScore || "N/A"}</p>
                </div>
              `,
                )
                .join("")}
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px 30px; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">🎉 <strong>Test Email Successful!</strong></p>
              <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Your Gmail SMTP configuration is working correctly. You'll receive weekly digests like this every Sunday.</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}" style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  🎵 Visit Afrobeats Tracker
                </a>
              </div>
            </div>
          </div>
          
          <!-- Disclaimer -->
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>This is a test email to verify your email configuration.</p>
            <p>© 2024 Afrobeats Tracker. Made with ❤️ for African music lovers.</p>
          </div>
        </body>
        </html>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: "Test digest sent successfully",
      email: email,
      timestamp: new Date().toISOString(),
      dataIncluded: {
        releases: releases.length,
        buzzing: buzzing.length,
      },
    })
  } catch (error: any) {
    console.error("Error sending test digest:", error)
    return NextResponse.json(
      {
        error: "Failed to send test digest",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

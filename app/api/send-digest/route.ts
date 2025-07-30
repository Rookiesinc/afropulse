import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

interface Subscriber {
  email: string
  verified: boolean
  subscribed_at: string
}

// Mock subscriber database (in production, use a real database)
const mockSubscribers: Subscriber[] = [
  {
    email: "test@example.com",
    verified: true,
    subscribed_at: new Date().toISOString(),
  },
]

export async function POST() {
  try {
    const gmailUser = process.env.GMAIL_USER
    const gmailPassword = process.env.GMAIL_APP_PASSWORD

    if (!gmailUser || !gmailPassword) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    // Get verified subscribers (in production, fetch from database)
    const subscribers = mockSubscribers.filter((sub) => sub.verified)

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No verified subscribers found",
        sent: 0,
      })
    }

    // Fetch latest data
    const [releasesResponse, buzzingResponse, newsResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/releases`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/buzzing`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/entertainment-news`),
    ])

    const releasesData = await releasesResponse.json()
    const buzzingData = await buzzingResponse.json()
    const newsData = await newsResponse.json()

    const releases = releasesData.songs?.slice(0, 10) || []
    const buzzing = buzzingData.songs?.slice(0, 8) || []
    const news = newsData.articles?.slice(0, 5) || []

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

    let successCount = 0
    let errorCount = 0

    // Send digest to each subscriber
    for (const subscriber of subscribers) {
      try {
        const mailOptions = {
          from: `"Afrobeats Tracker" <${gmailUser}>`,
          to: subscriber.email,
          subject: `🎵 Afrobeats Weekly Digest - ${currentDate}`,
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
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">${currentDate}</p>
              </div>
              
              <!-- Main Content -->
              <div style="background: white; padding: 0; border-radius: 0 0 15px 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <!-- Welcome Message -->
                <div style="padding: 30px 30px 20px 30px;">
                  <h2 style="color: #ff6b35; margin: 0 0 15px 0; font-size: 24px;">🔥 This Week's Heat!</h2>
                  <p style="margin: 0; color: #666; font-size: 16px;">Your weekly dose of the hottest Afrobeats releases, trending hits, and industry news!</p>
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
                      <div style="margin-top: 10px; margin-left: 36px;">
                        <a href="${song.spotifyUrl}" style="background: #1db954; color: white; padding: 6px 12px; text-decoration: none; border-radius: 15px; font-size: 12px; display: inline-block;">🎵 Listen on Spotify</a>
                      </div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
                
                <!-- Buzzing Section -->
                <div style="padding: 0 30px 20px 30px;">
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
                
                <!-- News Section -->
                ${
                  news.length > 0
                    ? `
                <div style="padding: 0 30px 20px 30px;">
                  <h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #6c5ce7; padding-bottom: 10px;">📰 Industry News</h3>
                  ${news
                    .map(
                      (article: any, index: number) => `
                    <div style="background: #f8f7ff; padding: 15px; margin-bottom: 15px; border-radius: 10px; border-left: 4px solid #6c5ce7;">
                      <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${article.title}</h4>
                      <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${article.summary}</p>
                      <p style="margin: 0; color: #999; font-size: 12px;"><strong>Source:</strong> ${article.source} • ${article.category}</p>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
                `
                    : ""
                }
                
                <!-- Footer -->
                <div style="background: #f8f9fa; padding: 20px 30px; border-top: 1px solid #eee;">
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}" style="background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                      🎵 Visit Afrobeats Tracker
                    </a>
                  </div>
                  
                  <p style="margin: 15px 0 0 0; color: #999; font-size: 12px; text-align: center;">
                    Don't want these emails? <a href="#" style="color: #ff6b35;">Unsubscribe here</a>
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>© 2024 Afrobeats Tracker. Made with ❤️ for African music lovers.</p>
              </div>
            </body>
            </html>
          `,
        }

        await transporter.sendMail(mailOptions)
        successCount++
        console.log(`✅ Digest sent to ${subscriber.email}`)
      } catch (error) {
        errorCount++
        console.error(`❌ Failed to send digest to ${subscriber.email}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Weekly digest sent successfully`,
      stats: {
        totalSubscribers: subscribers.length,
        successfulSends: successCount,
        failedSends: errorCount,
      },
      dataIncluded: {
        releases: releases.length,
        buzzing: buzzing.length,
        news: news.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error sending weekly digest:", error)
    return NextResponse.json(
      {
        error: "Failed to send weekly digest",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

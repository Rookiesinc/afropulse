import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { promises as fs } from "fs"
import path from "path"

interface Subscriber {
  email: string
  verified: boolean
  subscribed_at: string
  unsubscribed_at?: string
  status: "active" | "unsubscribed" | "pending"
}

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json")

async function readSubscribers(): Promise<Subscriber[]> {
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    console.log("No subscribers file found, returning empty array")
    return []
  }
}

export async function POST() {
  try {
    const gmailUser = process.env.GMAIL_USER
    const gmailPassword = process.env.GMAIL_APP_PASSWORD

    if (!gmailUser || !gmailPassword) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    // Get active subscribers
    const allSubscribers = await readSubscribers()
    const subscribers = allSubscribers.filter((sub) => sub.status === "active" && sub.verified)

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscribers found",
        sent: 0,
      })
    }

    console.log(`📧 Found ${subscribers.length} active subscribers`)

    // Fetch latest data with timeout protection
    const fetchWithTimeout = async (url: string, timeout = 10000) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(url, { signal: controller.signal })
        clearTimeout(timeoutId)
        return response
      } catch (error) {
        clearTimeout(timeoutId)
        throw error
      }
    }

    let releasesData, buzzingData, newsData

    try {
      const [releasesResponse, buzzingResponse, newsResponse] = await Promise.allSettled([
        fetchWithTimeout(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/releases`),
        fetchWithTimeout(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/buzzing`),
        fetchWithTimeout(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/entertainment-news`),
      ])

      releasesData =
        releasesResponse.status === "fulfilled" && releasesResponse.value.ok
          ? await releasesResponse.value.json()
          : { songs: [] }

      buzzingData =
        buzzingResponse.status === "fulfilled" && buzzingResponse.value.ok
          ? await buzzingResponse.value.json()
          : { songs: [] }

      newsData =
        newsResponse.status === "fulfilled" && newsResponse.value.ok
          ? await newsResponse.value.json()
          : { articles: [] }
    } catch (error) {
      console.error("Error fetching data for digest:", error)
      releasesData = { songs: [] }
      buzzingData = { songs: [] }
      newsData = { articles: [] }
    }

    const releases = releasesData.songs?.slice(0, 10) || []
    const buzzing = buzzingData.songs?.slice(0, 8) || []
    const news = newsData.articles?.slice(0, 5) || []

    console.log(`📊 Digest content: ${releases.length} releases, ${buzzing.length} buzzing, ${news.length} news`)

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
          from: `"Afropulse Weekly" <${gmailUser}>`,
          to: subscriber.email,
          subject: `🎵 Afropulse Weekly Digest - ${currentDate}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Afropulse Weekly Digest</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);">
                <h1 style="color: white; margin: 0; font-size: 32px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🎵 Afropulse Weekly</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.95; font-size: 16px;">${currentDate}</p>
              </div>
              
              <!-- Main Content -->
              <div style="background: white; padding: 0; border-radius: 0 0 15px 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <!-- Welcome Message -->
                <div style="padding: 30px 30px 20px 30px;">
                  <h2 style="color: #ff6b35; margin: 0 0 15px 0; font-size: 24px;">🔥 This Week's Heat!</h2>
                  <p style="margin: 0; color: #666; font-size: 16px;">Your weekly dose of the hottest Afrobeats releases and trending hits from across Africa!</p>
                </div>
                
                ${
                  releases.length > 0
                    ? `
                <!-- New Releases Section -->
                <div style="padding: 0 30px 20px 30px;">
                  <h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #ff6b35; padding-bottom: 10px;">🆕 Fresh Releases (Last 7 Days)</h3>
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
                      <p style="margin: 0 0 8px 36px; color: #666; font-size: 14px;"><strong>Released:</strong> ${new Date(song.releaseDate).toLocaleDateString()}</p>
                      ${song.isNewArtist ? '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 36px;">🌟 NEW ARTIST</span>' : ""}
                      <div style="margin-top: 10px; margin-left: 36px;">
                        <a href="${song.spotifyUrl}" style="background: #1db954; color: white; padding: 6px 12px; text-decoration: none; border-radius: 15px; font-size: 12px; display: inline-block;">🎵 Listen on Spotify</a>
                      </div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
                `
                    : ""
                }
                
                ${
                  buzzing.length > 0
                    ? `
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
                      <p style="margin: 0 0 8px 36px; color: #666; font-size: 14px;"><strong>Popularity:</strong> ${song.popularity}%</p>
                      ${song.buzzScore ? `<p style="margin: 0 0 8px 36px; color: #666; font-size: 14px;"><strong>Buzz Score:</strong> ${song.buzzScore}/100</p>` : ""}
                    </div>
                  `,
                    )
                    .join("")}
                </div>
                `
                    : ""
                }
                
                ${
                  news.length > 0
                    ? `
                <!-- News Section -->
                <div style="padding: 0 30px 20px 30px;">
                  <h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #6c5ce7; padding-bottom: 10px;">📰 Industry News</h3>
                  ${news
                    .map(
                      (article: any) => `
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
                      🎵 Visit Afropulse
                    </a>
                  </div>
                  
                  <p style="margin: 15px 0 0 0; color: #999; font-size: 12px; text-align: center;">
                    Don't want these emails? <a href="#" style="color: #ff6b35;">Unsubscribe here</a>
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                <p>© 2024 Afropulse. Made with ❤️ for African music lovers.</p>
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
    console.error("❌ Error sending weekly digest:", error)
    return NextResponse.json(
      {
        error: "Failed to send weekly digest",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

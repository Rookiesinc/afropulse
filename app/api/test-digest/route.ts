import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

interface SpotifyTrack {
  id: string
  name: string
  artist: string
  album: string
  releaseDate: string
  spotifyUrl: string
  imageUrl: string
  popularity: number
  genre: string
  streams: number
  previewUrl?: string
}

// Test email addresses
const TEST_EMAILS = ["tobionisemo2020@gmail.com", "tosinogen2012@gmail.com"]

async function fetchMusicData(endpoint: string): Promise<SpotifyTrack[]> {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const response = await fetch(`${baseUrl}/api/${endpoint}`, {
      headers: {
        "User-Agent": "Afropulse-Test-Digest/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status}`)
    }

    const data = await response.json()
    return data.songs || []
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    return []
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function getDaysAgo(dateString: string): string {
  const releaseDate = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - releaseDate.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}

function generateTestEmailHTML(newReleases: SpotifyTrack[], buzzingSongs: SpotifyTrack[]): string {
  const currentDate = formatDate(new Date().toISOString())

  const newReleasesHTML = newReleases
    .slice(0, 10)
    .map(
      (song) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="60" style="padding-right: 15px;">
                <img src="${song.imageUrl || "https://via.placeholder.com/60x60/ff6b35/ffffff?text=♪"}" 
                     alt="${song.album}" 
                     style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
              </td>
              <td>
                <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                  ${song.name}
                </h3>
                <p style="margin: 0 0 3px 0; font-size: 14px; color: #666;">
                  by ${song.artist}
                </p>
                <p style="margin: 0; font-size: 12px; color: #999;">
                  ${song.album} • ${getDaysAgo(song.releaseDate)}
                </p>
              </td>
              <td width="80" style="text-align: right;">
                <a href="${song.spotifyUrl}" 
                   style="display: inline-block; background: #1DB954; color: white; padding: 8px 12px; 
                          text-decoration: none; border-radius: 20px; font-size: 12px; font-weight: 500;">
                  Play
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `,
    )
    .join("")

  const buzzingSongsHTML = buzzingSongs
    .slice(0, 8)
    .map(
      (song) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="60" style="padding-right: 15px;">
                <img src="${song.imageUrl || "https://via.placeholder.com/60x60/ff6b35/ffffff?text=♪"}" 
                     alt="${song.album}" 
                     style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
              </td>
              <td>
                <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                  ${song.name}
                </h3>
                <p style="margin: 0 0 3px 0; font-size: 14px; color: #666;">
                  by ${song.artist}
                </p>
                <p style="margin: 0; font-size: 12px; color: #999;">
                  ${song.streams.toLocaleString()} streams • ${song.popularity}/100 popularity
                </p>
              </td>
              <td width="80" style="text-align: right;">
                <a href="${song.spotifyUrl}" 
                   style="display: inline-block; background: #1DB954; color: white; padding: 8px 12px; 
                          text-decoration: none; border-radius: 20px; font-size: 12px; font-weight: 500;">
                  Play
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `,
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Afropulse Test Digest</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
                    🎵 Afropulse Test Digest
                  </h1>
                  <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                    Testing weekly digest functionality
                  </p>
                  <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                    ${currentDate}
                  </p>
                </td>
              </tr>

              <!-- Test Notice -->
              <tr>
                <td style="padding: 20px; background: #e3f2fd; text-align: center; border-bottom: 1px solid #bbdefb;">
                  <p style="margin: 0; color: #1565c0; font-weight: 600;">
                    🧪 This is a test email to verify digest functionality
                  </p>
                </td>
              </tr>

              <!-- New Releases Section -->
              ${
                newReleases.length > 0
                  ? `
              <tr>
                <td style="padding: 30px;">
                  <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: #1a1a1a; border-bottom: 2px solid #ff6b35; padding-bottom: 10px;">
                    🔥 Fresh Releases (Last 7 Days)
                  </h2>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    ${newReleasesHTML}
                  </table>
                </td>
              </tr>
              `
                  : ""
              }

              <!-- Buzzing Songs Section -->
              ${
                buzzingSongs.length > 0
                  ? `
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: #1a1a1a; border-bottom: 2px solid #f7931e; padding-bottom: 10px;">
                    📈 Buzzing Right Now
                  </h2>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    ${buzzingSongsHTML}
                  </table>
                </td>
              </tr>
              `
                  : ""
              }

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                  <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                    Test completed successfully! 🎉
                  </p>
                  <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.5;">
                    This test email confirms that the digest system is working properly.
                  </p>
                  <p style="margin: 20px 0 0 0; font-size: 12px; color: #999;">
                    This is a test email from Afropulse digest system.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export async function POST() {
  try {
    console.log("🧪 Starting test digest send...")

    // Check email configuration
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error("❌ Email configuration missing")
      return NextResponse.json({ error: "Email configuration missing" }, { status: 500 })
    }

    // Fetch music data
    console.log("🎵 Fetching music data for test...")
    const [newReleases, buzzingSongs] = await Promise.all([fetchMusicData("releases"), fetchMusicData("buzzing")])

    console.log(`🎶 Test data: ${newReleases.length} new releases, ${buzzingSongs.length} buzzing songs`)

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
      console.log("✅ Email transporter verified for test")
    } catch (error) {
      console.error("❌ Email transporter verification failed:", error)
      return NextResponse.json({ error: "Email service unavailable" }, { status: 500 })
    }

    // Generate email content
    console.log("📝 Generating test email content...")
    const emailHTML = generateTestEmailHTML(newReleases, buzzingSongs)
    const currentDate = formatDate(new Date().toISOString())

    // Send test emails
    console.log("📤 Sending test emails...")
    const emailPromises = TEST_EMAILS.map(async (email, index) => {
      try {
        // Add small delay between emails
        if (index > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }

        const mailOptions = {
          from: `"Afropulse Test" <${GMAIL_USER}>`,
          to: email,
          subject: `🧪 Test: Afropulse Weekly Digest - ${currentDate}`,
          html: emailHTML,
        }

        // Add timeout to email sending
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Email timeout")), 30000)
        })

        await Promise.race([transporter.sendMail(mailOptions), timeoutPromise])

        console.log(`✅ Test email sent to ${email}`)
        return { email, status: "sent" }
      } catch (error) {
        console.error(`❌ Failed to send test email to ${email}:`, error)
        return { email, status: "failed", error: error.message }
      }
    })

    const results = await Promise.allSettled(emailPromises)
    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value.status === "sent",
    ).length

    const failed = results.length - successful

    console.log(`📊 Test digest complete: ${successful} successful, ${failed} failed`)

    return NextResponse.json({
      message: `Test digest sent successfully!`,
      sent: successful,
      failed: failed,
      total: TEST_EMAILS.length,
      recipients: TEST_EMAILS,
      songsIncluded: {
        newReleases: newReleases.length,
        buzzingSongs: buzzingSongs.length,
        uniqueArtists: new Set([...newReleases.map((s) => s.artist), ...buzzingSongs.map((s) => s.artist)]).size,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error sending test digest:", error)
    return NextResponse.json({ error: "Failed to send test digest" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Test digest service is ready",
    testEmails: TEST_EMAILS,
    status: "ready",
  })
}

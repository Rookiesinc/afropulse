import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

interface DigestTrack {
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
  previewUrl: string | null
}

// In-memory subscribers (in production, this would come from a database)
interface Subscriber {
  email: string
  subscribedAt: string
  verified: boolean
  verificationToken: string
}

const subscribers: Subscriber[] = [
  { email: "test1@example.com", subscribedAt: new Date().toISOString(), verified: true, verificationToken: "" },
  { email: "test2@example.com", subscribedAt: new Date().toISOString(), verified: true, verificationToken: "" },
  // Add more test subscribers as needed
]

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

// Create a Nodemailer transporter using Gmail SMTP
const transporter =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      })
    : null

// Function to fetch new releases (re-using logic from releases/route.ts)
// This is a simplified version for the digest. In a real app, you might
// want to call the internal /api/releases endpoint or share the logic.
async function getNewReleasesForDigest(): Promise<any[]> {
  // This is a placeholder. In a real app, you'd fetch actual data.
  // For now, return some static data or call your /api/releases endpoint.
  const fallbackTracks = [
    {
      id: "digest-1",
      name: "Afrobeat Anthem",
      artist: "V0 Artist",
      album: "Digest Hits",
      releaseDate: new Date().toISOString().split("T")[0],
      spotifyUrl: "https://open.spotify.com/track/placeholder1",
      imageUrl: "/placeholder.svg?height=100&width=100&text=Afrobeat+Anthem",
      popularity: 80,
      genre: "Afrobeats",
      streams: 1000000,
      previewUrl: null,
    },
    {
      id: "digest-2",
      name: "Rhythm of Lagos",
      artist: "V0 Crew",
      album: "City Vibes",
      releaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days ago
      spotifyUrl: "https://open.spotify.com/track/placeholder2",
      imageUrl: "/placeholder.svg?height=100&width=100&text=Rhythm+of+Lagos",
      popularity: 75,
      genre: "Afropop",
      streams: 800000,
      previewUrl: null,
    },
    {
      id: "digest-3",
      name: "Amapiano Groove",
      artist: "V0 Collective",
      album: "Dance Floor",
      releaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 days ago
      spotifyUrl: "https://open.spotify.com/track/placeholder3",
      imageUrl: "/placeholder.svg?height=100&width=100&text=Amapiano+Groove",
      popularity: 70,
      genre: "Amapiano",
      streams: 600000,
      previewUrl: null,
    },
  ]
  return fallbackTracks
}

// Function to generate the HTML email content
function generateEmailHtml(releases: any[]): string {
  const releaseItems = releases
    .map(
      (release) => `
    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px; background-color: #fff;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="width: 100px; vertical-align: top;">
            <img src="${release.imageUrl}" alt="${release.album}" width="100" height="100" style="border-radius: 4px; object-fit: cover;">
          </td>
          <td style="padding-left: 15px; vertical-align: top;">
            <h3 style="margin-top: 0; margin-bottom: 5px; color: #333;">${release.name}</h3>
            <p style="margin-top: 0; margin-bottom: 5px; color: #555; font-size: 14px;">Artist: <strong>${release.artist}</strong></p>
            <p style="margin-top: 0; margin-bottom: 5px; color: #555; font-size: 14px;">Album: ${release.album}</p>
            <p style="margin-top: 0; margin-bottom: 10px; color: #777; font-size: 12px;">Released: ${release.releaseDate}</p>
            <a href="${release.spotifyUrl}" style="display: inline-block; padding: 8px 15px; background-color: #1DB954; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 14px;">Listen on Spotify</a>
          </td>
        </tr>
      </table>
    </div>
  `,
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Afrobeats Weekly Digest</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #222;
                color: #ffffff;
                padding: 20px;
                text-align: center;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
                background-image: linear-gradient(to right, #FF5722, #FFC107); /* Orange to Amber gradient */
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
            }
            .content {
                padding: 20px;
            }
            .footer {
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #777;
                border-bottom-left-radius: 10px;
                border-bottom-right-radius: 10px;
                background-color: #f0f0f0;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #1DB954; /* Spotify Green */
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
            }
            .release-item {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #eee;
                border-radius: 8px;
                background-color: #fff;
            }
            .release-item img {
                float: left;
                margin-right: 15px;
                border-radius: 4px;
            }
            .release-item h3 {
                margin-top: 0;
                margin-bottom: 5px;
                color: #333;
            }
            .release-item p {
                margin-top: 0;
                margin-bottom: 5px;
                color: #555;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Afrobeats Weekly Digest 🔥</h1>
                <p>Your weekly dose of the freshest Afrobeats releases!</p>
            </div>
            <div class="content">
                <p>Hello Afrobeats Lover,</p>
                <p>Here are the top new Afrobeats releases from the past week:</p>
                ${releaseItems}
                <p>Stay tuned for more amazing music next week!</p>
                <p>Best,</p>
                <p>The Afrobeats Digest Team</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Afrobeats Digest. All rights reserved.</p>
                <p>You received this email because you subscribed to our weekly digest. <a href="${process.env.VERCEL_URL}/unsubscribe" style="color: #777;">Unsubscribe</a></p>
            </div>
        </div>
    </body>
    </html>
  `
}

export async function POST() {
  try {
    console.log("📧 Starting weekly digest send...")

    // Get active subscribers
    const activeSubscribers = subscribers.filter((s) => s.verified)

    if (activeSubscribers.length === 0) {
      return NextResponse.json({
        message: "No active subscribers found",
        sent: 0,
      })
    }

    // Fetch latest releases
    const tracks = await getNewReleasesForDigest()

    if (tracks.length === 0) {
      return NextResponse.json({
        error: "No tracks available for digest",
        sent: 0,
      })
    }

    // Create email transporter
    if (!transporter) {
      return NextResponse.json(
        { message: "Email transporter not configured. Check GMAIL_USER and GMAIL_APP_PASSWORD environment variables." },
        { status: 500 },
      )
    }

    // Send emails
    let sentCount = 0
    const errors: string[] = []

    for (const subscriber of activeSubscribers) {
      try {
        const htmlContent = generateEmailHtml(tracks.slice(0, 20))

        await transporter.sendMail({
          from: GMAIL_USER, // Sender address
          to: subscriber.email, // List of recipients
          subject: `🎵 Your Weekly Afrobeats Digest - ${tracks.length} Hot New Releases!`, // Subject line
          html: htmlContent, // HTML body
        })

        sentCount++
        console.log(`✅ Digest sent to: ${subscriber.email}`)

        // Add delay between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`❌ Failed to send digest to ${subscriber.email}:`, error)
        errors.push(`${subscriber.email}: ${error}`)
      }
    }

    console.log(`📊 Digest sending complete: ${sentCount}/${activeSubscribers.length} sent`)

    return NextResponse.json({
      message: `Weekly digest sent successfully`,
      sent: sentCount,
      total: activeSubscribers.length,
      tracks: tracks.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("❌ Error sending weekly digest:", error)
    return NextResponse.json(
      {
        error: "Failed to send weekly digest",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  if (!transporter) {
    return NextResponse.json(
      { message: "Email transporter not configured. Check GMAIL_USER and GMAIL_APP_PASSWORD environment variables." },
      { status: 500 },
    )
  }

  try {
    const newReleases = await getNewReleasesForDigest()
    const emailHtml = generateEmailHtml(newReleases)

    const verifiedSubscribers = subscribers.filter((s) => s.verified)

    if (verifiedSubscribers.length === 0) {
      console.log("No verified subscribers to send digest to.")
      return NextResponse.json({ message: "No verified subscribers to send digest to." }, { status: 200 })
    }

    let sentCount = 0
    let failedCount = 0

    for (const subscriber of verifiedSubscribers) {
      try {
        await transporter.sendMail({
          from: GMAIL_USER, // Sender address
          to: subscriber.email, // List of recipients
          subject: "Your Weekly Afrobeats Digest is Here! 🔥", // Subject line
          html: emailHtml, // HTML body
        })
        console.log(`Digest sent to: ${subscriber.email}`)
        sentCount++
        // Add a small delay to avoid hitting email provider rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second delay
      } catch (emailError) {
        console.error(`Failed to send digest to ${subscriber.email}:`, emailError)
        failedCount++
      }
    }

    return NextResponse.json(
      {
        message: `Weekly digest sent. Sent to ${sentCount} subscribers, failed for ${failedCount}.`,
        sentCount,
        failedCount,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error sending weekly digest:", error)
    return NextResponse.json({ message: "Failed to send weekly digest", error: error.message }, { status: 500 })
  }
}

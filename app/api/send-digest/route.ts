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

// This is a placeholder for your actual subscriber list.
// In a real application, you would fetch verified subscribers from a database.
const TEST_SUBSCRIBERS = [
  { email: "test1@example.com", verified: true },
  { email: "test2@example.com", verified: true },
  // Add more test subscribers as needed
]

// Placeholder for fetching new releases. In a real app, this would call your /api/releases endpoint.
async function getNewReleases() {
  // Simulate fetching data from your /api/releases endpoint
  // In a real scenario, you'd use `fetch('/api/releases')`
  const mockReleases = [
    {
      id: "mock-1",
      name: "Vibes On Vibes",
      artist: "Davido",
      album: "Timeless",
      releaseDate: "2025-07-28",
      spotifyUrl: "https://open.spotify.com/track/mock1",
      imageUrl: "/placeholder.svg?height=300&width=300&text=Davido",
      popularity: 90,
      genre: "Afrobeats",
      streams: 1000000,
      previewUrl: null,
    },
    {
      id: "mock-2",
      name: "Afrobeat Anthem",
      artist: "Wizkid",
      album: "Made In Lagos",
      releaseDate: "2025-07-29",
      spotifyUrl: "https://open.spotify.com/track/mock2",
      imageUrl: "/placeholder.svg?height=300&width=300&text=Wizkid",
      popularity: 88,
      genre: "Afrobeats",
      streams: 900000,
      previewUrl: null,
    },
    {
      id: "mock-3",
      name: "Rhythm of Africa",
      artist: "Burna Boy",
      album: "African Giant",
      releaseDate: "2025-07-30",
      spotifyUrl: "https://open.spotify.com/track/mock3",
      imageUrl: "/placeholder.svg?height=300&width=300&text=Burna+Boy",
      popularity: 92,
      genre: "Afrobeats",
      streams: 1200000,
      previewUrl: null,
    },
    {
      id: "mock-4",
      name: "Essence (New Mix)",
      artist: "Wizkid ft. Tems",
      album: "Made In Lagos Deluxe",
      releaseDate: "2025-07-31",
      spotifyUrl: "https://open.spotify.com/track/mock4",
      imageUrl: "/placeholder.svg?height=300&width=300&text=Wizkid+Tems",
      popularity: 95,
      genre: "Afrobeats",
      streams: 1500000,
      previewUrl: null,
    },
    {
      id: "mock-5",
      name: "Omo Ope (Live)",
      artist: "Asake",
      album: "Mr. Money With The Vibe",
      releaseDate: "2025-07-27",
      spotifyUrl: "https://open.spotify.com/track/mock5",
      imageUrl: "/placeholder.svg?height=300&width=300&text=Asake",
      popularity: 87,
      genre: "Afrobeats",
      streams: 850000,
      previewUrl: null,
    },
  ]
  return mockReleases
}

// Create a Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Function to generate the HTML content for the email digest
function generateEmailHtml(releases: any[]) {
  const releaseItemsHtml = releases
    .map(
      (release) => `
    <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="width: 100px; vertical-align: top; padding-right: 20px;">
            <img src="${release.imageUrl || "https://via.placeholder.com/100"}" alt="${release.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">
          </td>
          <td style="vertical-align: top;">
            <h3 style="margin-top: 0; margin-bottom: 5px; color: #333333;">${release.name}</h3>
            <p style="margin-top: 0; margin-bottom: 5px; color: #555555;"><strong>Artist:</strong> ${release.artist}</p>
            <p style="margin-top: 0; margin-bottom: 10px; color: #555555;"><strong>Album:</strong> ${release.album}</p>
            <p style="margin-top: 0; margin-bottom: 15px; color: #555555;"><strong>Release Date:</strong> ${release.releaseDate}</p>
            <a href="${release.spotifyUrl}" style="display: inline-block; padding: 8px 15px; background-color: #1DB954; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px;">Listen on Spotify</a>
          </td>
        </tr>
      </table>
    </div>
  `,
    )
    .join("")

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(to right, #ff416c, #ff4b2b); padding: 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px;">Afrobeats Weekly Digest 🔥</h1>
          <p style="margin-top: 10px; font-size: 16px;">Your dose of the freshest Afrobeats releases!</p>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello Afrobeats Lover,</p>
          <p style="font-size: 16px; margin-bottom: 20px;">Here are the hottest new Afrobeats releases from the past week:</p>
          ${releaseItemsHtml}
          <p style="font-size: 16px; margin-top: 30px;">Stay tuned for more amazing music next week!</p>
          <p style="font-size: 16px;">Best regards,<br>The Afrobeats Digest Team</p>
        </div>
        <div style="background-color: #eeeeee; padding: 20px; text-align: center; font-size: 12px; color: #777777;">
          <p>&copy; ${new Date().getFullYear()} Afrobeats Digest. All rights reserved.</p>
          <p>You are receiving this email because you subscribed to our weekly digest.</p>
          <p>If you wish to unsubscribe, please click <a href="#" style="color: #007bff; text-decoration: none;">here</a>.</p>
        </div>
      </div>
    </div>
  `
}

export async function POST() {
  try {
    console.log("📧 Starting weekly digest send...")

    // Get active subscribers
    const activeSubscribers = TEST_SUBSCRIBERS.filter((s) => s.verified)

    if (activeSubscribers.length === 0) {
      return NextResponse.json({
        message: "No active subscribers found",
        sent: 0,
      })
    }

    // Fetch latest releases
    const tracks = await getNewReleases()

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
          from: process.env.GMAIL_USER, // Sender address
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
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json(
      { message: "Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables." },
      { status: 500 },
    )
  }

  try {
    const newReleases = await getNewReleases() // Fetch new releases
    if (newReleases.length === 0) {
      console.log("No new releases found for the digest. Skipping email send.")
      return NextResponse.json({ message: "No new releases found to send." }, { status: 200 })
    }

    const emailHtml = generateEmailHtml(newReleases)

    let sentCount = 0
    let failedCount = 0

    for (const subscriber of TEST_SUBSCRIBERS) {
      // Iterate through TEST_SUBSCRIBERS
      if (!subscriber.verified) {
        console.log(`Skipping unverified subscriber: ${subscriber.email}`)
        continue
      }

      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: subscriber.email,
          subject: "Your Weekly Afrobeats Digest is Here! 🔥",
          html: emailHtml,
        })
        console.log(`Digest sent to: ${subscriber.email}`)
        sentCount++
      } catch (error) {
        console.error(`Failed to send digest to ${subscriber.email}:`, error)
        failedCount++
      }

      // Add a small delay to avoid hitting email provider rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second delay per email
    }

    return NextResponse.json(
      {
        message: `Weekly digest sent. Sent: ${sentCount}, Failed: ${failedCount}`,
        totalSubscribers: TEST_SUBSCRIBERS.length,
        newReleasesCount: newReleases.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error sending weekly digest:", error)
    return NextResponse.json({ message: "Failed to send weekly digest." }, { status: 500 })
  }
}

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

// Mock data for new releases (replace with actual fetched data)
const MOCK_NEW_RELEASES = [
  {
    id: "mock1",
    name: "New Vibe 2025",
    artist: "Wizkid",
    album: "Sounds of Lagos",
    release_date: "2025-07-28",
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/mock1",
  },
  {
    id: "mock2",
    name: "Afrobeat Fusion",
    artist: "Davido",
    album: "Timeless",
    release_date: "2025-07-29",
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/mock2",
  },
  {
    id: "mock3",
    name: "Essence (Remix)",
    artist: "Tems",
    album: "For Broken Ears",
    release_date: "2025-07-27",
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/mock3",
  },
  {
    id: "mock4",
    name: "Last Last (Acoustic)",
    artist: "Burna Boy",
    album: "Love, Damini",
    release_date: "2025-07-26",
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/mock4",
  },
  {
    id: "mock5",
    name: "Rush (Afro Remix)",
    artist: "Ayra Starr",
    album: "19 & Dangerous",
    release_date: "2025-07-25",
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/mock5",
  },
]

// In a real application, you would fetch verified subscribers from a database
// For this demo, we'll use a hardcoded list of test emails.
const TEST_SUBSCRIBERS = [
  { email: "tobionisemo2020@gmail.com", verified: true },
  { email: "tosinogen2012@gmail.com", verified: true },
  // Add more test emails here if needed
]

// Placeholder for fetching new releases. In a real app, this would call your /api/releases endpoint.
async function getNewReleases() {
  // Simulate fetching data from your /api/releases endpoint
  // In a real scenario, you'd use `fetch('/api/releases')`
  return MOCK_NEW_RELEASES
}

// Function to generate the HTML content for the email digest
function generateEmailHtml(releases: any[]) {
  const releaseItemsHtml = releases
    .map(
      (release) => `
    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px; background-color: #fff;">
      <img src="${release.image}" alt="${release.album}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px; float: left; margin-right: 15px;">
      <h3 style="margin: 0 0 5px 0; color: #333;">${release.name}</h3>
      <p style="margin: 0 0 5px 0; color: #555;">Artist: <strong>${release.artist}</strong></p>
      <p style="margin: 0 0 10px 0; color: #555;">Album: <em>${release.album}</em></p>
      <p style="margin: 0; color: #777; font-size: 0.9em;">Released: ${release.release_date}</p>
      <a href="${release.spotify_url}" style="display: inline-block; margin-top: 10px; padding: 8px 15px; background-color: #1DB954; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 0.9em;">Listen on Spotify</a>
      <div style="clear: both;"></div>
    </div>
  `,
    )
    .join("")

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(to right, #ff416c, #ff4b2b); padding: 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px;">Afrobeats Digest</h1>
          <p style="margin: 5px 0 0; font-size: 16px;">Your weekly dose of the hottest new Afrobeats!</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #333; text-align: center; margin-bottom: 25px;">🔥 New Releases This Week!</h2>
          ${releaseItemsHtml}
          <p style="text-align: center; margin-top: 30px; font-size: 1.1em; color: #555;">Stay tuned for more fresh sounds next week!</p>
          <p style="text-align: center; margin-top: 20px;">
            <a href="${process.env.VERCEL_URL}" style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">Visit Our Website</a>
          </p>
        </div>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 0.9em; color: #777;">
          <p>&copy; ${new Date().getFullYear()} Afrobeats Digest. All rights reserved.</p>
          <p>
            <a href="${process.env.VERCEL_URL}/unsubscribe" style="color: #777; text-decoration: underline;">Unsubscribe</a> from this list.
          </p>
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
    const GMAIL_USER = process.env.GMAIL_USER
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { message: "Email transporter not configured. Check GMAIL_USER and GMAIL_APP_PASSWORD environment variables." },
        { status: 500 },
      )
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    })

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
  const GMAIL_USER = process.env.GMAIL_USER
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error("Gmail credentials not set. Cannot send digest emails.")
    return NextResponse.json({ message: "Gmail credentials not configured. Digest not sent." }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  })

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
        from: GMAIL_USER,
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
}

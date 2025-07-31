import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { promises as fs } from "fs"
import path from "path"

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json")

interface Subscriber {
  email: string
  subscribedAt: string
  verified: boolean
}

// In-memory cache for subscribers to reduce file reads
let subscribersCache: Subscriber[] | null = null

async function readSubscribers(): Promise<Subscriber[]> {
  if (subscribersCache) {
    return subscribersCache
  }
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, "utf8")
    subscribersCache = JSON.parse(data)
    return subscribersCache
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // File does not exist, return empty array and create the directory/file
      await fs.mkdir(path.dirname(SUBSCRIBERS_FILE), { recursive: true })
      await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify([]), "utf8")
      subscribersCache = []
      return []
    }
    console.error("Error reading subscribers file:", error)
    throw new Error("Failed to read subscribers data")
  }
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Helper function to check if a date is within the last 7 days
function isWithinSevenDays(releaseDate: string): boolean {
  const date = new Date(releaseDate)
  const now = new Date()
  const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))
  return date >= sevenDaysAgo && date <= new Date()
}

// Mock data for new releases (ensure they are genuinely from the last 7 days)
const MOCK_NEW_RELEASES = [
  {
    id: "release-1",
    name: "Afrobeat Anthem",
    artist: "Burna Boy",
    album: "African Giant",
    releaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    spotifyUrl: "https://open.spotify.com/track/1",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273e5e2e2e2e2e2e2e2e2e2e2e2",
    popularity: 90,
    genre: "Afrobeats",
  },
  {
    id: "release-2",
    name: "Amapiano Groove",
    artist: "Tyla",
    album: "Water",
    releaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    spotifyUrl: "https://open.spotify.com/track/2",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273f5f2f2f2f2f2f2f2f2f2f2f2",
    popularity: 88,
    genre: "Amapiano",
  },
  {
    id: "release-3",
    name: "Alté Vibe",
    artist: "Tems",
    album: "For Broken Ears",
    releaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    spotifyUrl: "https://open.spotify.com/track/3",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273g6g2g2g2g2g2g2g2g2g2g2g2",
    popularity: 85,
    genre: "Alté",
  },
  {
    id: "release-4",
    name: "Highlife Classic",
    artist: "Flavour",
    album: "Flavour of Africa",
    releaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    spotifyUrl: "https://open.spotify.com/track/4",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273h7h2h2h2h2h2h2h2h2h2h2h2",
    popularity: 82,
    genre: "Highlife",
  },
  {
    id: "release-5",
    name: "New Wave",
    artist: "Rema",
    album: "Rave & Roses",
    releaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    spotifyUrl: "https://open.spotify.com/track/5",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273i8i2i2i2i2i2i2i2i2i2i2i2",
    popularity: 89,
    genre: "Afrobeats",
  },
  {
    id: "release-6",
    name: "Street Pop",
    artist: "Asake",
    album: "Mr. Money With The Vibe",
    releaseDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    spotifyUrl: "https://open.spotify.com/track/6",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273j9j2j2j2j2j2j2j2j2j2j2j2",
    popularity: 87,
    genre: "Afrobeats",
  },
  {
    id: "release-7",
    name: "Chill Amapiano",
    artist: "Kabza De Small",
    album: "I Am The King Of Amapiano",
    releaseDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    spotifyUrl: "https://open.spotify.com/track/7",
    imageUrl: "https://i.scdn.co/image/ab67616d0000b273k0k2k2k2k2k2k2k2k2k2k2k2",
    popularity: 84,
    genre: "Amapiano",
  },
].filter((release) => isWithinSevenDays(release.releaseDate)) // Ensure only genuinely recent releases are included

async function generateDigestEmailHtml(newReleases: typeof MOCK_NEW_RELEASES): Promise<string> {
  const releaseItemsHtml = newReleases
    .map(
      (release) => `
    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px; display: flex; align-items: center; background-color: #ffffff;">
      <img src="${release.imageUrl}" alt="${release.name} album cover" style="width: 80px; height: 80px; border-radius: 4px; margin-right: 15px; object-fit: cover;">
      <div>
        <h3 style="margin: 0 0 5px 0; font-size: 18px; color: #333;">${release.name}</h3>
        <p style="margin: 0 0 5px 0; font-size: 14px; color: #555;"><strong>Artist:</strong> ${release.artist}</p>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;"><strong>Album:</strong> ${release.album}</p>
        <a href="${release.spotifyUrl}" style="display: inline-block; padding: 8px 15px; background-color: #e53e3e; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 14px;">Listen on Spotify</a>
      </div>
    </div>
  `,
    )
    .join("")

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
        <h1 style="color: #e53e3e; font-size: 28px; margin: 0;">Afropulse Weekly Digest</h1>
        <p style="color: #777; font-size: 14px;">Your weekly dose of the hottest African music!</p>
      </div>
      
      <div style="padding: 20px 0;">
        <h2 style="color: #e53e3e; font-size: 22px; margin-top: 0; margin-bottom: 20px;">🔥 New Releases This Week</h2>
        ${newReleases.length > 0 ? releaseItemsHtml : "<p>No new releases this week. Stay tuned!</p>"}
      </div>

      <div style="padding: 20px 0; border-top: 1px solid #eee; margin-top: 20px;">
        <h2 style="color: #e53e3e; font-size: 22px; margin-top: 0; margin-bottom: 20px;">📈 Trending Tracks</h2>
        <p style="color: #555;">Check out what's buzzing on our <a href="${process.env.VERCEL_URL}/trending" style="color: #e53e3e; text-decoration: none;">Trending Page</a>!</p>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; margin-top: 20px; font-size: 12px; color: #999;">
        <p>You received this email because you subscribed to Afropulse. If you no longer wish to receive these emails, you can <a href="${process.env.VERCEL_URL}/unsubscribe" style="color: #e53e3e; text-decoration: none;">unsubscribe here</a>.</p>
        <p>&copy; ${new Date().getFullYear()} Afropulse. All rights reserved.</p>
      </div>
    </div>
  `
}

export async function GET() {
  try {
    const subscribers = await readSubscribers()
    const verifiedSubscribers = subscribers.filter((s) => s.verified)

    if (verifiedSubscribers.length === 0) {
      return NextResponse.json({ message: "No verified subscribers to send digest to." }, { status: 200 })
    }

    const emailHtml = await generateDigestEmailHtml(MOCK_NEW_RELEASES)

    let sentCount = 0
    const failedRecipients: string[] = []

    for (const subscriber of verifiedSubscribers) {
      const mailOptions = {
        from: `"Afropulse" <${process.env.GMAIL_USER}>`, // Use GMAIL_USER directly
        to: subscriber.email,
        subject: "Your Weekly Afropulse Digest!",
        html: emailHtml,
      }

      try {
        // Add a timeout for sending each email
        await Promise.race([
          new Promise<void>((resolve, reject) => {
            transporter.sendMail(mailOptions, (err) => {
              if (err) {
                console.error(`Error sending email to ${subscriber.email}:`, err)
                failedRecipients.push(subscriber.email)
                reject(err)
              } else {
                sentCount++
                resolve()
              }
            })
          }),
          new Promise<void>((_, reject) => setTimeout(() => reject(new Error("Email sending timed out")), 10000)), // 10 second timeout per email
        ])
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 1-second delay between emails to avoid rate limits
      } catch (error) {
        console.error(`Failed to send email to ${subscriber.email} after timeout/error:`, error)
        if (!failedRecipients.includes(subscriber.email)) {
          failedRecipients.push(subscriber.email)
        }
      }
    }

    return NextResponse.json({
      message: "Weekly digest sending initiated.",
      totalSubscribers: verifiedSubscribers.length,
      sentCount,
      failedRecipients,
      lastRun: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in send-digest API:", error)
    return NextResponse.json({ error: "Failed to send weekly digest" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { subscribers } from "../subscribe/route" // Import the in-memory subscribers map

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Define types for better readability
interface DigestSong {
  id: string
  name: string
  artist: string
  album: string
  releaseDate: string
  imageUrl: string
  spotifyUrl?: string
  audiomackUrl?: string
  appleMusicUrl?: string
  genre: string
  streams?: number
  previewUrl?: string
}

// Helper to generate a date within the last 7 days
function generateRecentDate(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split("T")[0] // YYYY-MM-DD format
}

// Mock new releases for the digest, ensuring they are within the last 7 days
const MOCK_NEW_RELEASES: DigestSong[] = [
  {
    id: "digest1",
    name: "Afrobeat Fusion",
    artist: "Wizkid",
    album: "Sounds of Lagos",
    releaseDate: generateRecentDate(1),
    imageUrl: "/placeholder.svg?height=300&width=300",
    spotifyUrl: "https://open.spotify.com/track/mock1",
    genre: "Afrobeats",
    popularity: 90,
    streams: 1500000,
    previewUrl: "https://p.scdn.co/mp3-preview/mock1",
  },
  {
    id: "digest2",
    name: "Amapiano Groove",
    artist: "Davido",
    album: "Timeless Vibes",
    releaseDate: generateRecentDate(3),
    imageUrl: "/placeholder.svg?height=300&width=300",
    spotifyUrl: "https://open.spotify.com/track/mock2",
    genre: "Amapiano",
    popularity: 88,
    streams: 1200000,
    previewUrl: "https://p.scdn.co/mp3-preview/mock2",
  },
  {
    id: "digest3",
    name: "Highlife Revival",
    artist: "Burna Boy",
    album: "African Giant",
    releaseDate: generateRecentDate(5),
    imageUrl: "/placeholder.svg?height=300&width=300",
    spotifyUrl: "https://open.spotify.com/track/mock3",
    genre: "Highlife",
    popularity: 92,
    streams: 1800000,
    previewUrl: "https://p.scdn.co/mp3-preview/mock3",
  },
  {
    id: "digest4",
    name: "Alté Anthem",
    artist: "Tems",
    album: "For Broken Ears",
    releaseDate: generateRecentDate(2),
    imageUrl: "/placeholder.svg?height=300&width=300",
    spotifyUrl: "https://open.spotify.com/track/mock4",
    genre: "Alté",
    popularity: 85,
    streams: 900000,
    previewUrl: "https://p.scdn.co/mp3-preview/mock4",
  },
  {
    id: "digest5",
    name: "Gqom Banger",
    artist: "Master KG",
    album: "Jerusalema",
    releaseDate: generateRecentDate(6),
    imageUrl: "/placeholder.svg?height=300&width=300",
    spotifyUrl: "https://open.spotify.com/track/mock5",
    genre: "Gqom",
    popularity: 87,
    streams: 1100000,
    previewUrl: "https://p.scdn.co/mp3-preview/mock5",
  },
  {
    id: "digest6",
    name: "Afro-Drill Flow",
    artist: "Asake",
    album: "Mr. Money With The Vibe",
    releaseDate: generateRecentDate(0), // Today
    imageUrl: "/placeholder.svg?height=300&width=300",
    spotifyUrl: "https://open.spotify.com/track/mock6",
    genre: "Afro-Drill",
    popularity: 95,
    streams: 2000000,
    previewUrl: "https://p.scdn.co/mp3-preview/mock6",
  },
  {
    id: "digest7",
    name: "Soulful Amapiano",
    artist: "Ayra Starr",
    album: "19 & Dangerous",
    releaseDate: generateRecentDate(4),
    imageUrl: "/placeholder.svg?height=300&width=300",
    spotifyUrl: "https://open.spotify.com/track/mock7",
    genre: "Amapiano",
    popularity: 89,
    streams: 1300000,
    previewUrl: "https://p.scdn.co/mp3-preview/mock7",
  },
  {
    id: "digest8",
    name: "Afro-Pop Dance",
    artist: "Rema",
    album: "Rave & Roses",
    releaseDate: generateRecentDate(1),
    imageUrl: "/placeholder.svg?height=300&width=300",
    spotifyUrl: "https://open.spotify.com/track/mock8",
    genre: "Afropop",
    popularity: 91,
    streams: 1600000,
    previewUrl: "https://p.scdn.co/mp3-preview/mock8",
  },
  {
    id: "digest9",
    name: "New Era Sound",
    artist: "Omah Lay",
    album: "Boy Alone",
    releaseDate: generateRecentDate(3),
    imageUrl: "/placeholder.svg?height=300&width=300",
    spotifyUrl: "https://open.spotify.com/track/mock9",
    genre: "Afrobeats",
    popularity: 86,
    streams: 1000000,
    previewUrl: "https://p.scdn.co/mp3-preview/mock9",
  },
  {
    id: "digest10",
    name: "Street Anthem",
    artist: "Zlatan",
    album: "Zanku",
    releaseDate: generateRecentDate(5),
    imageUrl: "/placeholder.svg?height=300&width=300",
    spotifyUrl: "https://open.spotify.com/track/mock10",
    genre: "Afrobeats",
    popularity: 80,
    streams: 750000,
    previewUrl: "https://p.scdn.co/mp3-preview/mock10",
  },
]

// Function to check if a release date is within the last 7 days
function isWithinSevenDays(releaseDate: string): boolean {
  const date = new Date(releaseDate)
  const now = new Date()
  const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))
  return date >= sevenDaysAgo && date <= new Date()
}

// Function to generate the HTML content for the email digest
function generateEmailHtml(releases: DigestSong[]): string {
  const releaseItems = releases
    .map(
      (song) => `
    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px; background-color: #fff;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 100px; vertical-align: top; padding-right: 15px;">
            <img src="${song.imageUrl}" alt="${song.album} cover" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">
          </td>
          <td style="vertical-align: top;">
            <h3 style="margin-top: 0; margin-bottom: 5px; color: #333; font-size: 18px;">${song.name}</h3>
            <p style="margin-top: 0; margin-bottom: 5px; color: #555; font-size: 14px;"><strong>Artist:</strong> ${song.artist}</p>
            <p style="margin-top: 0; margin-bottom: 5px; color: #555; font-size: 14px;"><strong>Album:</strong> ${song.album}</p>
            <p style="margin-top: 0; margin-bottom: 10px; color: #777; font-size: 12px;">Released: ${new Date(song.releaseDate).toLocaleDateString()}</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                ${song.spotifyUrl ? `<td style="padding-right: 10px;"><a href="${song.spotifyUrl}" style="display: inline-block; padding: 8px 12px; background-color: #1DB954; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 12px;">Listen on Spotify</a></td>` : ""}
                ${song.audiomackUrl ? `<td style="padding-right: 10px;"><a href="${song.audiomackUrl}" style="display: inline-block; padding: 8px 12px; background-color: #FF5722; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 12px;">Listen on Audiomack</a></td>` : ""}
                ${song.appleMusicUrl ? `<td style="padding-right: 10px;"><a href="${song.appleMusicUrl}" style="display: inline-block; padding: 8px 12px; background-color: #FC3C44; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 12px;">Listen on Apple Music</a></td>` : ""}
                ${song.previewUrl ? `<td><a href="${song.previewUrl}" style="display: inline-block; padding: 8px 12px; background-color: #6c757d; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 12px;">Preview</a></td>` : ""}
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `,
    )
    .join("")

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
        <h1 style="color: #ff5722; margin: 0;">Afropulse Weekly Digest</h1>
        <p style="color: #777;">Your weekly dose of the freshest Afrobeats!</p>
      </div>
      <div style="padding: 20px 0;">
        <h2 style="color: #ff5722; margin-top: 0; margin-bottom: 20px;">This Week's Top Releases</h2>
        ${releaseItems}
      </div>
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
        <p>You received this email because you subscribed to Afropulse. <a href="${process.env.VERCEL_URL}/unsubscribe" style="color: #ff5722;">Unsubscribe</a></p>
        <p>&copy; ${new Date().getFullYear()} Afropulse. All rights reserved.</p>
      </div>
    </div>
  `
}

export async function GET() {
  try {
    // Filter mock releases to ensure they are genuinely within the last 7 days
    const recentReleases = MOCK_NEW_RELEASES.filter((release) => isWithinSevenDays(release.releaseDate))

    if (recentReleases.length === 0) {
      console.log("No recent releases available for the digest. Skipping email send.")
      return NextResponse.json({ message: "No recent releases available for digest" }, { status: 200 })
    }

    const emailHtml = generateEmailHtml(recentReleases)
    let sentCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Iterate over verified subscribers and send emails
    for (const [email, subscriber] of subscribers.entries()) {
      if (subscriber.verified) {
        const mailOptions = {
          from: `"Afropulse" <${process.env.GMAIL_USER}>`, // Use GMAIL_USER directly
          to: email,
          subject: "Your Weekly Afropulse Digest! 🎧",
          html: emailHtml,
        }

        try {
          const sendMailPromise = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`Email sending to ${email} timed out`))
            }, 15000) // 15 seconds timeout per email

            transporter.sendMail(mailOptions, (error, info) => {
              clearTimeout(timeout)
              if (error) {
                console.error(`Error sending digest to ${email}:`, error)
                reject(error)
              } else {
                console.log(`Digest sent to ${email}:`, info.response)
                resolve()
              }
            })
          })
          await sendMailPromise
          sentCount++
        } catch (emailError: any) {
          failedCount++
          errors.push(`Failed to send to ${email}: ${emailError.message}`)
        }
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 1-second delay between emails to avoid rate limits
      }
    }

    if (sentCount > 0) {
      return NextResponse.json(
        {
          message: `Weekly digest sent to ${sentCount} subscribers. ${failedCount} failed.`,
          sentCount,
          failedCount,
          errors: errors.length > 0 ? errors : undefined,
        },
        { status: 200 },
      )
    } else {
      return NextResponse.json({ message: "No verified subscribers to send digest to." }, { status: 200 })
    }
  } catch (error) {
    console.error("Error sending weekly digest:", error)
    return NextResponse.json({ error: "Failed to send weekly digest" }, { status: 500 })
  }
}

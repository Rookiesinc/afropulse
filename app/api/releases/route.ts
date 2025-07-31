import { NextResponse } from "next/server"

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    release_date: string
    images: Array<{ url: string; height: number; width: number }>
  }
  external_urls: {
    spotify: string
  }
  popularity: number
  preview_url?: string
}

// In-memory storage for selected releases
let selectedReleases: SpotifyTrack[] = []

// Helper to generate a date within the last 7 days
function generateRecentDate(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split("T")[0] // YYYY-MM-DD format
}

// Fallback data for new releases, ensuring they are within the last 7 days
const FALLBACK_TRACKS = [
  {
    id: "fallback-release-1",
    name: "Vibe Check",
    artist: "Afro Innovator",
    album: "Future Sounds",
    releaseDate: generateRecentDate(1), // 1 day ago
    spotifyUrl: "https://open.spotify.com/track/1",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 85,
    genre: "Afrobeats",
    streams: 1200000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/a6d8a6d8a6d8a6d8a6d8a6d8a6d8a6d8a6d8a6d8?cid=d8a6d8a6d8a6d8a6d8a6d8a6d8a6d8a6",
  },
  {
    id: "fallback-release-2",
    name: "Rhythm Divine",
    artist: "Amapiano King",
    album: "Groove Nation",
    releaseDate: generateRecentDate(2), // 2 days ago
    spotifyUrl: "https://open.spotify.com/track/2",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 88,
    genre: "Amapiano",
    streams: 1500000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/b7e9b7e9b7e9b7e9b7e9b7e9b7e9b7e9b7e9b7e9?cid=b7e9b7e9b7e9b7e9b7e9b7e9b7e9b7e9",
  },
  {
    id: "fallback-release-3",
    name: "Soulful Journey",
    artist: "Alté Queen",
    album: "Inner Peace",
    releaseDate: generateRecentDate(3), // 3 days ago
    spotifyUrl: "https://open.spotify.com/track/3",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 82,
    genre: "Alté",
    streams: 950000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/c0f1c0f1c0f1c0f1c0f1c0f1c0f1c0f1c0f1c0f1?cid=c0f1c0f1c0f1c0f1c0f1c0f1c0f1c0f1",
  },
  {
    id: "fallback-release-4",
    name: "Highlife Anthem",
    artist: "Highlife Legend",
    album: "Golden Era",
    releaseDate: generateRecentDate(4), // 4 days ago
    spotifyUrl: "https://open.spotify.com/track/4",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 79,
    genre: "Highlife",
    streams: 700000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3?cid=d2a3d2a3d2a3d2a3d2a3d2a3d2a3d2a3",
  },
  {
    id: "fallback-release-5",
    name: "Afro Fusion",
    artist: "New Wave Artist",
    album: "Crossroads",
    releaseDate: generateRecentDate(5), // 5 days ago
    spotifyUrl: "https://open.spotify.com/track/5",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 80,
    genre: "Afrobeats",
    streams: 1100000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/e4b5e4b5e4b5e4b5e4b5e4b5e4b5e4b5e4b5e4b5?cid=e4b5e4b5e4b5e4b5e4b5e4b5e4b5e4b5",
  },
  {
    id: "fallback-release-6",
    name: "Street Banger",
    artist: "Street Pop Star",
    album: "Urban Vibes",
    releaseDate: generateRecentDate(6), // 6 days ago
    spotifyUrl: "https://open.spotify.com/track/6",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 83,
    genre: "Afrobeats",
    streams: 900000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/f6c7f6c7f6c7f6c7f6c7f6c7f6c7f6c7f6c7f6c7?cid=f6c7f6c7f6c7f6c7f6c7f6c7f6c7f6c7",
  },
  {
    id: "fallback-release-7",
    name: "Chill Amapiano",
    artist: "Chill Master",
    album: "Relaxed Grooves",
    releaseDate: generateRecentDate(7), // 7 days ago
    spotifyUrl: "https://open.spotify.com/track/7",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 78,
    genre: "Amapiano",
    streams: 600000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/a8d9a8d9a8d9a8d9a8d9a8d9a8d9a8d9a8d9a8d9?cid=a8d9a8d9a8d9a8d9a8d9a8d9a8d9a8d9",
  },
  {
    id: "fallback-release-8",
    name: "Afro Gospel",
    artist: "Gospel Voice",
    album: "Divine Melodies",
    releaseDate: generateRecentDate(1), // 1 day ago
    spotifyUrl: "https://open.spotify.com/track/8",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 75,
    genre: "Afro Gospel",
    streams: 500000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/b0e1b0e1b0e1b0e1b0e1b0e1b0e1b0e1b0e1b0e1?cid=b0e1b0e1b0e1b0e1b0e1b0e1b0e1b0e1",
  },
  {
    id: "fallback-release-9",
    name: "Dancefloor Filler",
    artist: "DJ Afro",
    album: "Club Anthems",
    releaseDate: generateRecentDate(2), // 2 days ago
    spotifyUrl: "https://open.spotify.com/track/9",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 90,
    genre: "Afrobeats",
    streams: 1800000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/c2f3c2f3c2f3c2f3c2f3c2f3c2f3c2f3c2f3c2f3?cid=c2f3c2f3c2f3c2f3c2f3c2f3c2f3c2f3",
  },
  {
    id: "fallback-release-10",
    name: "Acoustic Vibes",
    artist: "Soulful Singer",
    album: "Unplugged",
    releaseDate: generateRecentDate(3), // 3 days ago
    spotifyUrl: "https://open.spotify.com/track/10",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 70,
    genre: "Alté",
    streams: 400000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/d4e5d4e5d4e5d4e5d4e5d4e5d4e5d4e5d4e5d4e5?cid=d4e5d4e5d4e5d4e5d4e5d4e5d4e5d4e5",
  },
  {
    id: "fallback-release-11",
    name: "Afrobeat Classic",
    artist: "Veteran Artist",
    album: "Timeless Hits",
    releaseDate: generateRecentDate(4), // 4 days ago
    spotifyUrl: "https://open.spotify.com/track/11",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 87,
    genre: "Afrobeats",
    streams: 1300000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/e6f7e6f7e6f7e6f7e6f7e6f7e6f7e6f7e6f7e6f7?cid=e6f7e6f7e6f7e6f7e6f7e6f7e6f7e6f7",
  },
  {
    id: "fallback-release-12",
    name: "Gqom Groove",
    artist: "Gqom Producer",
    album: "Dark Rhythms",
    releaseDate: generateRecentDate(5), // 5 days ago
    spotifyUrl: "https://open.spotify.com/track/12",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 76,
    genre: "Gqom",
    streams: 650000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/f8g9f8g9f8g9f8g9f8g9f8g9f8g9f8g9f8g9f8g9?cid=f8g9f8g9f8g9f8g9f8g9f8g9f8g9f8g9",
  },
  {
    id: "fallback-release-13",
    name: "Afro-pop Anthem",
    artist: "Pop Sensation",
    album: "Chart Toppers",
    releaseDate: generateRecentDate(6), // 6 days ago
    spotifyUrl: "https://open.spotify.com/track/13",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 92,
    genre: "Afro-pop",
    streams: 2000000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/a0b1a0b1a0b1a0b1a0b1a0b1a0b1a0b1a0b1a0b1?cid=a0b1a0b1a0b1a0b1a0b1a0b1a0b1a0b1",
  },
  {
    id: "fallback-release-14",
    name: "Reggae Fusion",
    artist: "Island Vibes",
    album: "Tropical Sounds",
    releaseDate: generateRecentDate(7), // 7 days ago
    spotifyUrl: "https://open.spotify.com/track/14",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 68,
    genre: "Reggae Fusion",
    streams: 300000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/c2d3c2d3c2d3c2d3c2d3c2d3c2d3c2d3c2d3c2d3?cid=c2d3c2d3c2d3c2d3c2d3c2d3c2d3c2d3",
  },
  {
    id: "fallback-release-15",
    name: "Afro-Trap Beat",
    artist: "Trap Lord",
    album: "Hard Rhythms",
    releaseDate: generateRecentDate(1), // 1 day ago
    spotifyUrl: "https://open.spotify.com/track/15",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 84,
    genre: "Afro-Trap",
    streams: 1000000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/e4f5e4f5e4f5e4f5e4f5e4f5e4f5e4f5e4f5e4f5?cid=e4f5e4f5e4f5e4f5e4f5e4f5e4f5e4f5",
  },
  {
    id: "fallback-release-16",
    name: "Amapiano Soul",
    artist: "Soulful Amapiano",
    album: "Smooth Grooves",
    releaseDate: generateRecentDate(2), // 2 days ago
    spotifyUrl: "https://open.spotify.com/track/16",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 81,
    genre: "Amapiano",
    streams: 900000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/f6g7f6g7f6g7f6g7f6g7f6g7f6g7f6g7f6g7f6g7?cid=f6g7f6g7f6g7f6g7f6g7f6g7f6g7f6g7",
  },
  {
    id: "fallback-release-17",
    name: "Afro-House Party",
    artist: "House DJ",
    album: "Party Starters",
    releaseDate: generateRecentDate(3), // 3 days ago
    spotifyUrl: "https://open.spotify.com/track/17",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 89,
    genre: "Afro-House",
    streams: 1600000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/a8b9a8b9a8b9a8b9a8b9a8b9a8b9a8b9a8b9a8b9?cid=a8b9a8b9a8b9a8b9a8b9a8b9a8b9a8b9",
  },
  {
    id: "fallback-release-18",
    name: "Afro-R&B Ballad",
    artist: "R&B Crooner",
    album: "Love Songs",
    releaseDate: generateRecentDate(4), // 4 days ago
    spotifyUrl: "https://open.spotify.com/track/18",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 77,
    genre: "Afro-R&B",
    streams: 550000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/b0c1b0c1b0c1b0c1b0c1b0c1b0c1b0c1b0c1b0c1?cid=b0c1b0c1b0c1b0c1b0c1b0c1b0c1b0c1",
  },
  {
    id: "fallback-release-19",
    name: "Afro-Drill Anthem",
    artist: "Drill King",
    album: "Raw Energy",
    releaseDate: generateRecentDate(5), // 5 days ago
    spotifyUrl: "https://open.spotify.com/track/19",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 86,
    genre: "Afro-Drill",
    streams: 1100000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/c2d3c2d3c2d3c2d3c2d3c2d3c2d3c2d3c2d3c2d3?cid=c2d3c2d3c2d3c2d3c2d3c2d3c2d3c2d3",
  },
  {
    id: "fallback-release-20",
    name: "Afro-Jazz Fusion",
    artist: "Jazz Innovator",
    album: "Smooth Blends",
    releaseDate: generateRecentDate(6), // 6 days ago
    spotifyUrl: "https://open.spotify.com/track/20",
    imageUrl: "/placeholder.svg?height=300&width=300",
    popularity: 72,
    genre: "Afro-Jazz",
    streams: 450000,
    previewUrl:
      "https://p.scdn.co/mp3-preview/e4f5e4f5e4f5e4f5e4f5e4f5e4f5e4f5e4f5e4f5?cid=e4f5e4f5e4f5e4f5e4f5e4f5e4f5e4f5",
  },
]

// Function to check if a date is within the last 7 days
function isWithinSevenDays(releaseDate: string): boolean {
  const date = new Date(releaseDate)
  const now = new Date()
  const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))
  return date >= sevenDaysAgo && date <= new Date()
}

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error("Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.")
    throw new Error("Spotify credentials not configured")
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to get Spotify access token: ${response.status} - ${errorText}`)
      throw new Error("Failed to get Spotify access token")
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("Error fetching Spotify access token:", error)
    throw error
  }
}

async function fetchSpotifyNewReleases(accessToken: string, market: string) {
  const currentYear = new Date().getFullYear()
  const nextYear = currentYear + 1

  try {
    const response = await fetch(`https://api.spotify.com/v1/browse/new-releases?country=${market}&limit=50`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(8000), // 8 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch new releases for market ${market}: ${response.status} - ${errorText}`)
      throw new Error(`Failed to fetch new releases for market ${market}`)
    }

    const data = await response.json()
    return data.albums.items
      .filter((album: any) => {
        const releaseYear = new Date(album.release_date).getFullYear()
        // Filter for current and next year, and within the last 7 days
        return (releaseYear === currentYear || releaseYear === nextYear) && isWithinSevenDays(album.release_date)
      })
      .map((album: any) => ({
        id: album.id,
        name: album.name,
        artist: album.artists.map((artist: any) => artist.name).join(", "),
        album: album.name,
        releaseDate: album.release_date,
        spotifyUrl: album.external_urls.spotify,
        imageUrl: album.images[0]?.url || "/placeholder.svg?height=300&width=300",
        popularity: 0, // New releases endpoint doesn't provide popularity directly
        genre: "Afrobeats", // Default genre, can be refined with search later
        previewUrl: album.artists[0]?.id
          ? `https://p.scdn.co/mp3-preview/${album.id}?cid=${album.artists[0].id}`
          : undefined, // Placeholder for preview
      }))
  } catch (error) {
    console.error(`Error fetching Spotify new releases for market ${market}:`, error)
    return []
  }
}

async function getTrackDetails(accessToken: string, trackId: string) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(3000), // 3 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to get track details for ${trackId}: ${response.status} - ${errorText}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching track details for ${trackId}:`, error)
    return null
  }
}

// Function to get a random integer between min and max (inclusive)
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function GET() {
  // If manually selected releases exist, return them
  if (selectedReleases.length > 0) {
    return NextResponse.json({
      songs: selectedReleases,
      lastUpdated: new Date().toISOString(),
      total: selectedReleases.length,
      dataSource: "manual-selection",
      manuallySelectedCount: selectedReleases.length,
    })
  }

  const allNewReleases: SpotifyTrack[] = []
  let dataSource = "spotify-only"
  let fallbackUsed = false

  try {
    const accessToken = await getSpotifyAccessToken()

    const markets = ["NG", "GH", "KE", "ZA", "US", "GB"] // Nigeria, Ghana, Kenya, South Africa, US, UK

    for (const market of markets) {
      const releases = await fetchSpotifyNewReleases(accessToken, market)
      allNewReleases.push(...releases)
      await new Promise((resolve) => setTimeout(resolve, 300)) // Delay between market calls
    }

    // Remove duplicates based on track ID
    const uniqueReleases = allNewReleases.filter(
      (track, index, self) => index === self.findIndex((t) => t.id === track.id),
    )

    // Prioritize Nigerian artists and enhance scoring
    const nigerianArtists = [
      "Burna Boy",
      "Davido",
      "Wizkid",
      "Rema",
      "Tems",
      "Asake",
      "Ayra Starr",
      "Kizz Daniel",
      "Fireboy DML",
      "Joeboy",
      "Omah Lay",
      "Olamide",
      "Zlatan",
      "Naira Marley",
      "Bella Shmurda",
      "CKay",
      "Oxlade",
      "Adekunle Gold",
      "Tiwa Savage",
      "Yemi Alade",
      "Mr Eazi",
      "Tekno",
      "Flavour",
      "Phyno",
      "Patoranking",
      "Simi",
      "Chike",
      "Johnny Drille",
      "Ladipoe",
      "Blaqbonez",
    ]

    const enhancedReleases = await Promise.all(
      uniqueReleases.map(async (track) => {
        const artistName = track.artists[0]?.name || track.artist || ""
        const isNigerianArtist = nigerianArtists.some((name) => artistName.toLowerCase().includes(name.toLowerCase()))

        // Fetch full track details to get popularity and actual preview_url
        let fullTrackDetails = null
        if (track.id) {
          await new Promise((resolve) => setTimeout(resolve, 100)) // Small delay before fetching track details
          fullTrackDetails = await getTrackDetails(accessToken, track.id)
        }

        const popularity = fullTrackDetails?.popularity || track.popularity || getRandomInt(50, 80) // Use fetched popularity or random
        const streams = fullTrackDetails?.popularity
          ? popularity * getRandomInt(10000, 50000)
          : getRandomInt(500000, 5000000) // Simulate streams based on popularity
        const previewUrl = fullTrackDetails?.preview_url || track.previewUrl

        // Simple scoring: higher for Nigerian artists, recentness, and popularity
        let score = popularity * 0.6 // Base on popularity
        if (isNigerianArtist) {
          score += 20 // Boost for Nigerian artists
        }
        // Add a small boost for very recent releases (e.g., within 2 days)
        if (
          isWithinSevenDays(track.releaseDate) &&
          (new Date().getTime() - new Date(track.releaseDate).getTime()) / (1000 * 60 * 60 * 24) <= 2
        ) {
          score += 10
        }

        return {
          ...track,
          popularity: popularity,
          streams: streams,
          previewUrl: previewUrl,
          score: Math.min(100, score), // Cap score at 100
        }
      }),
    )

    // Sort by score (highest first)
    const sortedReleases = enhancedReleases.sort((a, b) => (b.score || 0) - (a.score || 0))

    // Ensure exactly 15 songs, filling with fallback if necessary
    let finalSongs = sortedReleases.slice(0, 15)

    if (finalSongs.length < 15) {
      const fallbackCount = 15 - finalSongs.length
      const additionalFallback = FALLBACK_TRACKS.slice(0, fallbackCount)
      finalSongs = [...finalSongs, ...additionalFallback]
      fallbackUsed = true
      dataSource = "spotify-with-fallback"
    }

    // Ensure no duplicate artists in the final list (keep the one with the highest score)
    const artistMap = new Map<string, SpotifyTrack>()
    finalSongs.forEach((song) => {
      const artistKey = song.artist.toLowerCase().trim()
      const existing = artistMap.get(artistKey)
      if (!existing || (song.score || 0) > (existing.score || 0)) {
        artistMap.set(artistKey, song)
      }
    })

    const deduplicatedFinalSongs = Array.from(artistMap.values())
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 15) // Ensure we still have max 15 after deduplication

    // If after deduplication we have less than 15, fill again with remaining fallback
    if (deduplicatedFinalSongs.length < 15) {
      const remainingFallbackCount = 15 - deduplicatedFinalSongs.length
      const usedFallbackIds = new Set(deduplicatedFinalSongs.map((s) => s.id))
      const additionalFallback = FALLBACK_TRACKS.filter((f) => !usedFallbackIds.has(f.id)).slice(
        0,
        remainingFallbackCount,
      )
      deduplicatedFinalSongs.push(...additionalFallback)
      fallbackUsed = true
      dataSource = "spotify-with-fallback"
    }

    return NextResponse.json({
      songs: deduplicatedFinalSongs,
      lastUpdated: new Date().toISOString(),
      total: deduplicatedFinalSongs.length,
      dataSource: dataSource,
      searchPeriod: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      fallbackUsed: fallbackUsed,
    })
  } catch (error) {
    console.error("Error in releases API:", error)
    // Return fallback data if any error occurs during API calls
    return NextResponse.json({
      songs: FALLBACK_TRACKS.slice(0, 15), // Ensure 15 fallback songs
      lastUpdated: new Date().toISOString(),
      total: 15,
      dataSource: "fallback",
      searchPeriod: "N/A",
      fallbackUsed: true,
      error: "Failed to fetch Spotify data, serving fallback.",
    })
  }
}

// API route to handle manual selection of releases
export async function POST(req: Request) {
  try {
    const { songs } = await req.json()
    if (!Array.isArray(songs)) {
      return NextResponse.json({ error: "Invalid input: songs must be an array" }, { status: 400 })
    }
    selectedReleases = songs.slice(0, 20) // Limit to 20 songs
    return NextResponse.json({ message: "Selected releases saved", count: selectedReleases.length })
  } catch (error) {
    console.error("Error saving selected releases:", error)
    return NextResponse.json({ error: "Failed to save selected releases" }, { status: 500 })
  }
}

export async function DELETE() {
  selectedReleases = []
  return NextResponse.json({ message: "Selected releases cleared" })
}

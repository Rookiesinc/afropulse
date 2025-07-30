import { NextResponse } from "next/server"

interface SpotifySearchResult {
  id: string
  name: string
  artist: string
  album: string
  releaseDate: string
  spotifyUrl: string
  genre: string
  popularity: number
  previewUrl?: string
  imageUrl?: string
}

// Rate limiting
let lastSearchTime = 0
let searchCount = 0
const SEARCH_RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_SEARCHES_PER_WINDOW = 20

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured")
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

async function searchSpotify(query: string, accessToken: string): Promise<SpotifySearchResult[]> {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=NG`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after")
    throw new Error(`Rate limited. Retry after ${retryAfter} seconds`)
  }

  if (!response.ok) {
    throw new Error(`Spotify search failed: ${response.status}`)
  }

  const data = await response.json()
  const tracks = data.tracks?.items || []

  return tracks.map((track: any) => ({
    id: track.id,
    name: track.name,
    artist: track.artists[0]?.name || "Unknown Artist",
    album: track.album.name,
    releaseDate: track.album.release_date,
    spotifyUrl: track.external_urls.spotify,
    genre: "Afrobeats", // Default genre
    popularity: track.popularity,
    previewUrl: track.preview_url,
    imageUrl: track.album.images[0]?.url,
  }))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Search query required" }, { status: 400 })
    }

    // Rate limiting check
    const now = Date.now()
    if (now - lastSearchTime < SEARCH_RATE_LIMIT_WINDOW) {
      searchCount++
      if (searchCount > MAX_SEARCHES_PER_WINDOW) {
        return NextResponse.json(
          {
            error: "Search rate limit exceeded",
            message: "Too many search requests. Please try again later.",
            retryAfter: Math.ceil((SEARCH_RATE_LIMIT_WINDOW - (now - lastSearchTime)) / 1000),
          },
          { status: 429 },
        )
      }
    } else {
      lastSearchTime = now
      searchCount = 1
    }

    // Check Spotify credentials
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      return NextResponse.json(
        {
          error: "Spotify credentials not configured",
          message: "Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables",
        },
        { status: 500 },
      )
    }

    // Get access token and search
    const accessToken = await getSpotifyAccessToken()
    const results = await searchSpotify(query, accessToken)

    return NextResponse.json({
      results,
      query,
      count: results.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error in Spotify search:", error)

    if (error.message.includes("Rate limited")) {
      return NextResponse.json(
        {
          error: "Spotify rate limit exceeded",
          message: error.message,
        },
        { status: 429 },
      )
    }

    return NextResponse.json(
      {
        error: "Search failed",
        message: error.message,
        results: [],
      },
      { status: 500 },
    )
  }
}

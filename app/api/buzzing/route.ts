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
}

async function getSpotifyAccessToken() {
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
    throw new Error("Failed to get Spotify access token")
  }

  const data = await response.json()
  return data.access_token
}

async function getSpotifyPlaylist(accessToken: string, playlistId: string) {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=NG&limit=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get playlist tracks")
  }

  return response.json()
}

async function searchTrendingTracks(accessToken: string) {
  const queries = [
    "genre:afrobeats",
    "burna boy OR davido OR wizkid OR rema",
    "tems OR ayra starr OR tyla OR asake",
    "afrobeats OR afrobeat",
    "kizz daniel OR fireboy OR joeboy OR omah lay",
    "olamide OR zlatan OR naira marley OR bella shmurda",
  ]

  const allTracks: SpotifyTrack[] = []

  for (const query of queries) {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=NG&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (response.ok) {
      const data = await response.json()
      allTracks.push(...data.tracks.items)
    }
  }

  return allTracks
}

function calculateBuzzScore(track: SpotifyTrack): number {
  const popularityWeight = 0.4
  const recentnessWeight = 0.3
  const artistFactorWeight = 0.3

  const popularityScore = track.popularity

  const releaseDate = new Date(track.album.release_date)
  const now = new Date()
  const daysSinceRelease = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24))
  const recentnessScore = Math.max(0, 100 - (daysSinceRelease / 365) * 100)

  const topArtists = ["burna boy", "davido", "wizkid", "rema", "tems", "ayra starr", "asake", "tyla"]
  const artistName = track.artists[0]?.name.toLowerCase() || ""
  const artistFactor = topArtists.some((artist) => artistName.includes(artist)) ? 100 : 70

  const buzzScore = Math.round(
    popularityScore * popularityWeight + recentnessScore * recentnessWeight + artistFactor * artistFactorWeight,
  )

  return Math.min(100, Math.max(0, buzzScore))
}

function categorizeGenre(track: SpotifyTrack): string {
  const trackName = track.name.toLowerCase()
  const artistName = track.artists[0]?.name.toLowerCase() || ""

  const amapianoArtists = ["tyla", "uncle waffles", "kabza de small", "dj maphorisa", "focalistic"]
  const alteArtists = ["odunsi", "santi", "lady donli", "tems", "ayra starr"]
  const highlifeArtists = ["flavour", "phyno", "kcee", "timaya"]

  if (
    amapianoArtists.some((artist) => artistName.includes(artist)) ||
    trackName.includes("amapiano") ||
    trackName.includes("piano")
  ) {
    return "Amapiano"
  }

  if (alteArtists.some((artist) => artistName.includes(artist))) {
    return "Alté"
  }

  if (highlifeArtists.some((artist) => artistName.includes(artist))) {
    return "Highlife"
  }

  return "Afrobeats"
}

function generateFallbackBuzzingSongs(count: number, startIndex = 0) {
  const fallbackArtists = [
    "Tyla",
    "Uncle Waffles",
    "Focalistic",
    "Kabza De Small",
    "DJ Maphorisa",
    "Mas Musiq",
    "Vigro Deep",
    "Major League DJz",
    "Mpura",
    "Busta 929",
    "Santi",
    "Lady Donli",
    "Cruel Santino",
    "Wavy The Creator",
    "Prettyboy D-O",
    "Nonso Amadi",
    "BOJ",
    "Odunsi",
    "Zamir",
    "Amaarae",
    "Tems",
    "Ayra Starr",
    "Rema",
    "Asake",
    "Fireboy DML",
    "Joeboy",
    "Omah Lay",
    "CKay",
    "Oxlade",
    "Kizz Daniel",
  ]

  const fallbackSongs = [
    "Trending Anthem",
    "Viral Sensation",
    "Buzzing Hit",
    "Hot Track",
    "Popular Jam",
    "Chart Climber",
    "Streaming Fire",
    "Buzz Generator",
    "Trending Wave",
    "Viral Beat",
    "Hot Melody",
    "Popular Rhythm",
    "Buzzing Vibe",
    "Trending Energy",
    "Viral Flow",
    "Hot Groove",
    "Popular Sound",
    "Buzzing Power",
    "Trending Soul",
    "Viral Magic",
    "Hot Spirit",
    "Popular Dream",
    "Buzzing Light",
    "Trending Hope",
    "Viral Joy",
    "Hot Peace",
    "Popular Life",
    "Buzzing Glory",
    "Trending Love",
    "Viral Freedom",
  ]

  const genres = ["Afrobeats", "Amapiano", "Alté", "Highlife"]

  return Array.from({ length: count }, (_, index) => {
    const actualIndex = startIndex + index
    return {
      id: `fallback-buzz-${actualIndex + 1}`,
      name: fallbackSongs[actualIndex % fallbackSongs.length],
      artist: fallbackArtists[actualIndex % fallbackArtists.length],
      album: `Buzzing Album ${actualIndex + 1}`,
      releaseDate: new Date(Date.now() - actualIndex * 2 * 24 * 60 * 60 * 1000).toISOString(),
      spotifyUrl: "https://open.spotify.com",
      imageUrl: "/placeholder.svg?height=300&width=300",
      popularity: 75 + (actualIndex % 25),
      genre: genres[actualIndex % genres.length],
      streams: 800000 + actualIndex * 150000,
      buzzScore: 80 + (actualIndex % 20),
    }
  })
}

export async function GET() {
  try {
    // Check if comprehensive buzz data is available
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    try {
      const comprehensiveRes = await fetch(`${baseUrl}/api/comprehensive-buzz`)
      if (comprehensiveRes.ok) {
        const comprehensiveData = await comprehensiveRes.json()
        return NextResponse.json({
          songs: comprehensiveData.songs || [],
          lastUpdated: new Date().toISOString(),
          total: comprehensiveData.songs?.length || 0,
          dataSource: "comprehensive",
          metrics: comprehensiveData.metrics,
        })
      }
    } catch (error) {
      console.log("Comprehensive data not available, falling back to Spotify only")
    }

    // Fallback to Spotify-only data
    const accessToken = await getSpotifyAccessToken()
    const trendingTracks = await searchTrendingTracks(accessToken)

    // Try to get tracks from popular Afrobeats playlists
    const popularPlaylistIds = [
      "37i9dQZF1DX7Jl5KP2eZaS", // Afro Hits
      "37i9dQZF1DWYkaDif7Ztbp", // Afrobeats Hits
    ]

    for (const playlistId of popularPlaylistIds) {
      try {
        const playlistData = await getSpotifyPlaylist(accessToken, playlistId)
        const playlistTracks = playlistData.items
          .filter((item: any) => item.track && item.track.id)
          .map((item: any) => item.track)
        trendingTracks.push(...playlistTracks)
      } catch (error) {
        console.log(`Could not fetch playlist ${playlistId}:`, error)
      }
    }

    // Remove duplicates
    const uniqueTracks = trendingTracks.filter(
      (track, index, self) => index === self.findIndex((t) => t.id === track.id),
    )

    // Calculate buzz scores and sort
    const tracksWithBuzz = uniqueTracks
      .map((track: SpotifyTrack) => ({
        ...track,
        buzzScore: calculateBuzzScore(track),
      }))
      .sort((a, b) => b.buzzScore - a.buzzScore)

    // Ensure only one song per artist (keep the highest buzz score)
    const artistMap = new Map<string, any>()
    tracksWithBuzz.forEach((track: any) => {
      const artistKey = track.artists[0]?.name.toLowerCase().trim() || "unknown"
      const existing = artistMap.get(artistKey)

      if (!existing || track.buzzScore > existing.buzzScore) {
        artistMap.set(artistKey, track)
      }
    })

    const deduplicatedTracks = Array.from(artistMap.values()).sort((a, b) => b.buzzScore - a.buzzScore)

    // Format the response - change from 15 to 20
    // Format the response - ensure exactly 20 songs
    let finalSongs = deduplicatedTracks.slice(0, 20)

    // If we don't have enough songs, add fallback data
    if (finalSongs.length < 20) {
      const fallbackCount = 20 - finalSongs.length
      const fallbackSongs = generateFallbackBuzzingSongs(fallbackCount, finalSongs.length)
      finalSongs = [...finalSongs, ...fallbackSongs]
    }

    const songs = finalSongs.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist:
        typeof track.artist === "string"
          ? track.artist
          : track.artists?.map((artist: any) => artist.name).join(", ") || "Unknown Artist",
      album: track.album?.name || track.album || "Unknown Album",
      releaseDate:
        track.releaseDate ||
        (track.album?.release_date ? new Date(track.album.release_date).toISOString() : new Date().toISOString()),
      spotifyUrl: track.spotifyUrl || track.external_urls?.spotify || "https://open.spotify.com",
      imageUrl: track.imageUrl || track.album?.images?.[0]?.url || "/placeholder.svg?height=300&width=300",
      popularity: track.popularity || 50,
      genre: track.genre || categorizeGenre(track),
      streams: track.streams || Math.floor(Math.random() * 10000000) + 1000000,
      buzzScore: track.buzzScore || calculateBuzzScore(track),
    }))

    return NextResponse.json({
      songs,
      lastUpdated: new Date().toISOString(),
      total: songs.length,
      dataSource: finalSongs.length > deduplicatedTracks.length ? "spotify-with-fallback" : "spotify-only",
      fallbackUsed: finalSongs.length > deduplicatedTracks.length,
    })
  } catch (error) {
    console.error("Error fetching buzzing songs:", error)

    const fallbackSongs = [
      {
        id: "buzz-fallback-1",
        name: "Configure Spotify API",
        artist: "Setup Required",
        album: "API Configuration",
        releaseDate: new Date().toISOString(),
        spotifyUrl: "https://developer.spotify.com/dashboard",
        imageUrl: "/placeholder.svg?height=300&width=300",
        popularity: 0,
        genre: "Afrobeats",
        streams: 0,
        buzzScore: 0,
      },
    ]

    return NextResponse.json({
      songs: fallbackSongs,
      lastUpdated: new Date().toISOString(),
      total: fallbackSongs.length,
      error: "Spotify API connection failed",
      dataSource: "fallback",
    })
  }
}

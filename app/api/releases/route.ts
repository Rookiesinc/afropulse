import { NextResponse } from "next/server"

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    release_date: string
    images: Array<{ url: string }>
  }
  popularity: number
  external_urls: {
    spotify: string
  }
  preview_url?: string
}

interface Song {
  id: string
  name: string
  artist: string
  album: string
  releaseDate: string
  spotifyUrl: string
  genre: string
  popularity: number
  streams?: number
  buzzScore?: number
  isNewArtist?: boolean
  artistScore?: number
  previewUrl?: string
}

interface ApiResponse {
  songs: Song[]
  cached?: boolean
  dataSource: string
  discoveredArtists?: number
  timestamp: string
  totalFetched?: number
  error?: string
}

// Enhanced African artist database with Nigerian priority
const AFRICAN_ARTISTS = [
  // Nigerian Artists (Priority)
  "Burna Boy",
  "Wizkid",
  "Davido",
  "Tiwa Savage",
  "Yemi Alade",
  "Rema",
  "Fireboy DML",
  "Joeboy",
  "Omah Lay",
  "Tems",
  "Ayra Starr",
  "Asake",
  "Kizz Daniel",
  "Tekno",
  "Mr Eazi",
  "Runtown",
  "Patoranking",
  "Timaya",
  "Phyno",
  "Olamide",
  "Naira Marley",
  "Zlatan",
  "Mayorkun",
  "Peruzzi",
  "Oxlade",
  "Ckay",
  "Ruger",
  "BNXN",
  "Victony",
  "Bella Shmurda",
  "Zinoleesky",
  "Mohbad",
  "Portable",
  "Seyi Vibez",
  "Young Jonn",
  "Lojay",
  "Magixx",
  "Boy Spyce",

  // South African Artists
  "Tyla",
  "Focalistic",
  "DJ Maphorisa",
  "Kabza De Small",
  "Sha Sha",
  "Master KG",
  "Nomcebo Zikode",
  "Busiswa",
  "Moonchild Sanelly",
  "Sho Madjozi",
  "Nasty C",
  "AKA",
  "Cassper Nyovest",
  "Black Coffee",
  "Sun-El Musician",
  "Ami Faku",
  "Mlindo The Vocalist",
  "Sjava",
  "Big Zulu",
  "Blaq Diamond",

  // Ghanaian Artists
  "Black Sherif",
  "Stonebwoy",
  "Shatta Wale",
  "Sarkodie",
  "King Promise",
  "Kwesi Arthur",
  "Gyakie",
  "Amaarae",
  "R2Bees",
  "Medikal",
  "Joey B",
  "Darkovibes",
  "Kelvyn Boy",
  "Kuami Eugene",

  // Kenyan Artists
  "Sauti Sol",
  "Nyashinski",
  "Khaligraph Jones",
  "Otile Brown",
  "Nadia Mukami",
  "Bahati",
  "Akothee",
  "Diamond Platnumz",
  "Rayvanny",
  "Harmonize",
  "Zuchu",
  "Nandy",
  "Mbosso",
  "Lava Lava",

  // Other African Artists
  "Aya Nakamura",
  "Dadju",
  "Gims",
  "Ninho",
  "Jain",
  "Alpha Blondy",
  "Youssou N'Dour",
  "Salif Keita",
  "Angelique Kidjo",
  "Fally Ipupa",
  "Innoss'B",
]

let spotifyToken: string | null = null
let tokenExpiry = 0

async function getSpotifyToken(): Promise<string | null> {
  if (spotifyToken && Date.now() < tokenExpiry) {
    return spotifyToken
  }

  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error("❌ Missing Spotify credentials")
      return null
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    spotifyToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

    console.log("✅ Successfully obtained Spotify token")
    return spotifyToken
  } catch (error: any) {
    console.error("❌ Error getting Spotify token:", error.message)
    return null
  }
}

function isWithinSevenDays(releaseDate: string): boolean {
  const release = new Date(releaseDate)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Ensure the release date is within the last 7 days
  return release >= sevenDaysAgo && release <= now
}

async function searchSpotifyWithTimeout(query: string, token: string, timeoutMs = 8000): Promise<SpotifyTrack[]> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=US`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      },
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after")
        const delay = retryAfter ? Number.parseInt(retryAfter) * 1000 : 3000
        console.log(`⏳ Rate limited for "${query}", waiting ${delay}ms`)
        throw new Error("Rate limited")
      }
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.tracks?.items || []
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === "AbortError") {
      console.error(`⏰ Timeout searching for "${query}"`)
      throw new Error("Request timeout")
    }
    throw error
  }
}

async function fetchFromSpotify(): Promise<Song[]> {
  console.log("🎵 Starting Spotify fetch for releases within last 7 days...")

  const token = await getSpotifyToken()
  if (!token) {
    throw new Error("Failed to get Spotify token")
  }

  const allTracks: SpotifyTrack[] = []
  const seenArtists = new Set<string>()
  let discoveredArtists = 0
  let successfulQueries = 0
  let failedQueries = 0

  // Current date for filtering
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0")
  const currentWeek = Math.ceil(now.getDate() / 7)

  // Prioritized search queries focusing on very recent releases
  const priorityQueries = [
    `Nigerian Afrobeats ${currentYear}`,
    `new releases ${currentYear}-${currentMonth}`,
    `latest Afrobeats ${currentYear}`,
    `Burna Boy new ${currentYear}`,
    `Wizkid latest ${currentYear}`,
    `Davido new song ${currentYear}`,
    `Tems new ${currentYear}`,
    `Asake latest ${currentYear}`,
    `Rema new release ${currentYear}`,
    `Ayra Starr new ${currentYear}`,
    `Fireboy DML latest ${currentYear}`,
    `Omah Lay new ${currentYear}`,
    `Tyla new song ${currentYear}`,
    `Amapiano new ${currentYear}`,
    `African music new releases ${currentYear}`,
  ]

  for (let i = 0; i < priorityQueries.length; i++) {
    const query = priorityQueries[i]

    try {
      console.log(`🔍 Searching: "${query}" (${i + 1}/${priorityQueries.length})`)

      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }

      const tracks = await searchSpotifyWithTimeout(query, token, 8000)

      if (tracks.length > 0) {
        console.log(`✅ Found ${tracks.length} tracks for "${query}"`)

        // Strict filtering for releases within exactly 7 days
        const recentTracks = tracks.filter((track) => {
          return isWithinSevenDays(track.album.release_date)
        })

        console.log(`📅 ${recentTracks.length} tracks are within 7 days for "${query}"`)

        for (const track of recentTracks) {
          const artistName = track.artists[0]?.name
          if (!artistName || seenArtists.has(artistName)) continue

          const artistScore = calculateArtistScore(artistName, track.name, track.popularity)

          if (artistScore >= 8) {
            allTracks.push(track)
            seenArtists.add(artistName)
            discoveredArtists++
            console.log(`✨ Added: ${track.name} by ${artistName} (Released: ${track.album.release_date})`)
          }
        }

        successfulQueries++
      } else {
        console.log(`⚠️ No tracks found for "${query}"`)
      }

      if (allTracks.length >= 30) {
        console.log(`🎯 Collected ${allTracks.length} tracks, stopping early`)
        break
      }
    } catch (error: any) {
      console.error(`❌ Error searching for "${query}":`, error.message)
      failedQueries++

      if (failedQueries >= 5) {
        console.log("⚠️ Too many failed queries, stopping search")
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  console.log(`📊 Search complete: ${successfulQueries} successful, ${failedQueries} failed`)
  console.log(`🎤 Total recent tracks found: ${allTracks.length}, Unique artists: ${seenArtists.size}`)

  // Convert to Song format
  const songs: Song[] = allTracks.slice(0, 20).map((track) => {
    const artistName = track.artists[0]?.name || "Unknown Artist"
    const artistScore = calculateArtistScore(artistName, track.name, track.popularity)

    return {
      id: track.id,
      name: track.name,
      artist: artistName,
      album: track.album.name,
      releaseDate: track.album.release_date,
      spotifyUrl: track.external_urls.spotify,
      genre: "Afrobeats",
      popularity: track.popularity,
      artistScore,
      isNewArtist: Math.random() > 0.7,
      previewUrl: track.preview_url,
    }
  })

  return songs
}

// Generate realistic recent fallback data (within 7 days)
function getFallbackSongs(): Song[] {
  const now = new Date()
  const fallbackArtists = [
    { name: "Burna Boy", genre: "Afrobeats", popularity: 85, country: "Nigeria" },
    { name: "Wizkid", genre: "Afrobeats", popularity: 88, country: "Nigeria" },
    { name: "Davido", genre: "Afrobeats", popularity: 82, country: "Nigeria" },
    { name: "Tiwa Savage", genre: "Afrobeats", popularity: 78, country: "Nigeria" },
    { name: "Asake", genre: "Afrobeats", popularity: 75, country: "Nigeria" },
    { name: "Rema", genre: "Afrobeats", popularity: 80, country: "Nigeria" },
    { name: "Tems", genre: "Afrobeats", popularity: 77, country: "Nigeria" },
    { name: "Ayra Starr", genre: "Afrobeats", popularity: 73, country: "Nigeria" },
    { name: "Fireboy DML", genre: "Afrobeats", popularity: 76, country: "Nigeria" },
    { name: "Omah Lay", genre: "Afrobeats", popularity: 74, country: "Nigeria" },
    { name: "Joeboy", genre: "Afrobeats", popularity: 72, country: "Nigeria" },
    { name: "CKay", genre: "Afrobeats", popularity: 79, country: "Nigeria" },
    { name: "Kizz Daniel", genre: "Afrobeats", popularity: 71, country: "Nigeria" },
    { name: "Oxlade", genre: "Afrobeats", popularity: 69, country: "Nigeria" },
    { name: "Ruger", genre: "Afrobeats", popularity: 68, country: "Nigeria" },
    { name: "Tyla", genre: "Amapiano", popularity: 75, country: "South Africa" },
    { name: "Focalistic", genre: "Amapiano", popularity: 70, country: "South Africa" },
    { name: "Black Sherif", genre: "Afrobeats", popularity: 70, country: "Ghana" },
    { name: "Stonebwoy", genre: "Dancehall", popularity: 67, country: "Ghana" },
    { name: "Diamond Platnumz", genre: "Bongo Flava", popularity: 67, country: "Tanzania" },
  ]

  return fallbackArtists.map((artist, i) => {
    // Generate dates within the last 7 days only
    const daysAgo = Math.floor(Math.random() * 7)
    const releaseDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

    return {
      id: `fallback-${i + 1}`,
      name: `New Track ${i + 1}`,
      artist: artist.name,
      album: `Latest Album ${i + 1}`,
      releaseDate: releaseDate.toISOString().split("T")[0],
      spotifyUrl: "https://open.spotify.com",
      genre: artist.genre,
      popularity: artist.popularity,
      streams: Math.floor(Math.random() * 1000000) + 100000,
      isNewArtist: i > 15,
      artistScore: 15,
    }
  })
}

function calculateArtistScore(artistName: string, trackName: string, popularity: number): number {
  let score = 0
  const lowerArtist = artistName.toLowerCase()
  const lowerTrack = trackName.toLowerCase()

  // Nigerian artist priority (15 points vs 12 for other African)
  const nigerianKeywords = ["naija", "lagos", "abuja", "nigerian", "nigeria", "yoruba", "igbo", "hausa"]
  const africanKeywords = ["african", "africa", "ghana", "kenya", "south africa", "tanzania", "uganda", "senegal"]

  if (nigerianKeywords.some((keyword) => lowerArtist.includes(keyword) || lowerTrack.includes(keyword))) {
    score += 15
  } else if (africanKeywords.some((keyword) => lowerArtist.includes(keyword) || lowerTrack.includes(keyword))) {
    score += 12
  }

  // Enhanced African name patterns
  const africanNamePatterns = [
    /^(Ade|Ola|Olu|Ayo|Bola|Kemi|Tunde|Wale|Yemi|Seun|Femi|Dami|Temi|Sola)/i,
    /^(Kwame|Kofi|Yaw|Akwasi|Ama|Efua|Adwoa|Akosua)/i,
    /^(Thabo|Sipho|Nomsa|Zanele|Mandla|Precious|Blessing)/i,
    /^(Amani|Baraka|Farida|Hassan|Imani|Jabari|Kesi|Nia)/i,
    /^(Abena|Akua|Amara|Asha|Fatou|Khadija|Mariam|Zara)/i,
  ]

  if (africanNamePatterns.some((pattern) => pattern.test(artistName))) {
    score += 8
  }

  // Afrobeats genre indicators
  const afrobeatsKeywords = ["afrobeats", "afrobeat", "amapiano", "highlife", "juju", "fuji", "bongo flava"]
  if (afrobeatsKeywords.some((keyword) => lowerTrack.includes(keyword) || lowerArtist.includes(keyword))) {
    score += 10
  }

  // Popularity bonus
  if (popularity > 70) score += 5
  else if (popularity > 50) score += 3
  else if (popularity > 30) score += 1

  return score
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    console.log("🎵 Fetching new releases within last 7 days...")

    let songs: Song[] = []
    let dataSource = "spotify_live"
    let error: string | undefined

    try {
      songs = await fetchFromSpotify()
      console.log(`✅ Successfully fetched ${songs.length} recent songs from Spotify`)
    } catch (spotifyError: any) {
      console.error("❌ Spotify fetch failed:", spotifyError.message)
      error = `Spotify API error: ${spotifyError.message}`
      dataSource = "fallback"
      songs = getFallbackSongs()
      console.log(`🔄 Using fallback data: ${songs.length} songs`)
    }

    // Ensure we have at least 20 songs
    if (songs.length < 20) {
      const additionalSongs = getFallbackSongs().slice(songs.length)
      songs = [...songs, ...additionalSongs].slice(0, 20)
      if (dataSource === "spotify_live") {
        dataSource = "spotify_mixed"
      }
    }

    const discoveredArtists = songs.filter((song) => song.isNewArtist).length

    const response: ApiResponse = {
      songs: songs.slice(0, 20),
      dataSource,
      discoveredArtists,
      timestamp: new Date().toISOString(),
      totalFetched: songs.length,
      error,
    }

    console.log(`🎉 Returning ${response.songs.length} songs (all within 7 days) with data source: ${dataSource}`)
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("❌ Critical error in releases API:", error.message)

    const fallbackResponse: ApiResponse = {
      songs: getFallbackSongs().slice(0, 20),
      dataSource: "error_fallback",
      discoveredArtists: 5,
      timestamp: new Date().toISOString(),
      error: `Critical API Error: ${error.message}`,
    }

    console.log("🔄 Returning fallback response due to critical error")
    return NextResponse.json(fallbackResponse)
  }
}

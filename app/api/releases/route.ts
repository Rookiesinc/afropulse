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
  "Kizz Daniel",
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
  "Wizkid",
  "Aya Nakamura",
  "Dadju",
  "Gims",
  "Ninho",
  "Burna Boy",
  "Master KG",
  "Jain",
  "Alpha Blondy",
  "Youssou N'Dour",
  "Salif Keita",
  "Angelique Kidjo",
  "Fally Ipupa",
  "Innoss'B",
]

// Comprehensive African search queries with Nigerian priority
const AFRICAN_SEARCH_QUERIES = [
  // Nigerian Priority Searches
  "Nigerian Afrobeats 2024",
  "Lagos music scene",
  "Naija new songs",
  "Nigerian artists trending",
  "Afrobeats Nigeria latest",
  "Lagos Afrobeats",
  "Nigerian music 2024",
  "Naija hits 2024",
  "Nigerian pop music",
  "Afrobeats Lagos",
  "Nigeria music industry",
  "Nigerian singers 2024",
  "Afrobeats Nigerian artists",
  "Lagos music 2024",
  "Nigerian contemporary music",

  // West African Searches
  "West African music",
  "Ghana Afrobeats",
  "Ghanaian music 2024",
  "Senegalese music",
  "Mali music",
  "Burkina Faso artists",
  "Ivory Coast music",
  "Sierra Leone music",
  "Liberia music",
  "Guinea music",
  "Gambia artists",
  "Cape Verde music",

  // South African Searches
  "South African Amapiano",
  "SA music 2024",
  "Amapiano hits",
  "South African house",
  "Kwaito music",
  "SA hip hop",
  "South African jazz",
  "Amapiano dance",

  // East African Searches
  "East African music",
  "Tanzanian Bongo Flava",
  "Kenyan music",
  "Ethiopian music",
  "Ugandan music",
  "Rwandan music",
  "Burundi music",
  "Somali music",

  // Central African Searches
  "Central African music",
  "Congolese music",
  "Cameroon music",
  "Gabon music",
  "Chad music",
  "CAR music",
  "Equatorial Guinea music",

  // North African Searches
  "North African music",
  "Moroccan music",
  "Algerian music",
  "Tunisian music",
  "Egyptian music",
  "Libyan music",
  "Sudanese music",

  // Genre-specific African searches
  "African contemporary music",
  "Modern African music",
  "African urban music",
  "African pop 2024",
  "African R&B",
  "African hip hop",
  "African electronic music",
]

let spotifyToken: string | null = null
let tokenExpiry = 0
let lastApiCall = 0
let consecutiveErrors = 0
const RATE_LIMIT_DELAY = 2000 // 2 seconds between calls
const MAX_CONSECUTIVE_ERRORS = 3

// Enhanced artist scoring with Nigerian priority
function calculateArtistScore(artistName: string, trackName: string, popularity: number): number {
  let score = 0
  const lowerArtist = artistName.toLowerCase()
  const lowerTrack = trackName.toLowerCase()

  // Nigerian artist priority (15 points vs 12 for other African)
  const nigerianKeywords = ["naija", "lagos", "abuja", "nigerian", "nigeria", "yoruba", "igbo", "hausa"]
  const africanKeywords = ["african", "africa", "ghana", "kenya", "south africa", "tanzania", "uganda", "senegal"]

  if (nigerianKeywords.some((keyword) => lowerArtist.includes(keyword) || lowerTrack.includes(keyword))) {
    score += 15 // Nigerian priority
  } else if (africanKeywords.some((keyword) => lowerArtist.includes(keyword) || lowerTrack.includes(keyword))) {
    score += 12
  }

  // Enhanced African name patterns
  const africanNamePatterns = [
    // Nigerian patterns
    /^(Ade|Ola|Olu|Ayo|Bola|Kemi|Tunde|Wale|Yemi|Seun|Femi|Dami|Temi|Sola)/i,
    // Ghanaian patterns
    /^(Kwame|Kofi|Yaw|Akwasi|Ama|Efua|Adwoa|Akosua)/i,
    // South African patterns
    /^(Thabo|Sipho|Nomsa|Zanele|Mandla|Precious|Blessing)/i,
    // East African patterns
    /^(Amani|Baraka|Farida|Hassan|Imani|Jabari|Kesi|Nia)/i,
    // General African patterns
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

async function getSpotifyToken(): Promise<string | null> {
  if (spotifyToken && Date.now() < tokenExpiry) {
    return spotifyToken
  }

  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error("Missing Spotify credentials")
      return null
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
      throw new Error(`Token request failed: ${response.status}`)
    }

    const data = await response.json()
    spotifyToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000 // 5 min buffer

    return spotifyToken
  } catch (error) {
    console.error("Error getting Spotify token:", error)
    return null
  }
}

async function searchSpotifyWithTimeout(query: string, token: string, timeoutMs = 10000): Promise<SpotifyTrack[]> {
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
        const delay = retryAfter ? Number.parseInt(retryAfter) * 1000 : 5000
        console.log(`Rate limited, waiting ${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        throw new Error("Rate limited")
      }
      throw new Error(`Spotify API error: ${response.status}`)
    }

    const data = await response.json()
    return data.tracks?.items || []
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === "AbortError") {
      throw new Error("Request timeout")
    }
    throw error
  }
}

async function fetchFromSpotify(): Promise<Song[]> {
  const token = await getSpotifyToken()
  if (!token) {
    throw new Error("Failed to get Spotify token")
  }

  const allTracks: SpotifyTrack[] = []
  const seenArtists = new Set<string>()
  let discoveredArtists = 0

  // Use priority queries (reduced from 70+ to 15 high-priority ones)
  const priorityQueries = AFRICAN_SEARCH_QUERIES.slice(0, 15)

  for (const query of priorityQueries) {
    try {
      // Rate limiting protection
      const timeSinceLastCall = Date.now() - lastApiCall
      if (timeSinceLastCall < RATE_LIMIT_DELAY) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastCall))
      }

      const tracks = await searchSpotifyWithTimeout(query, token, 10000)
      lastApiCall = Date.now()

      // Filter for recent releases (7 days) and African artists
      const recentTracks = tracks.filter((track) => {
        const releaseDate = new Date(track.album.release_date)
        const daysDiff = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= 7 // Changed from 6 to 7 days
      })

      for (const track of recentTracks) {
        const artistName = track.artists[0]?.name
        if (!artistName || seenArtists.has(artistName)) continue

        const artistScore = calculateArtistScore(artistName, track.name, track.popularity)

        if (artistScore >= 8) {
          // Threshold for African artists
          allTracks.push(track)
          seenArtists.add(artistName)

          if (!AFRICAN_ARTISTS.some((artist) => artist.toLowerCase() === artistName.toLowerCase())) {
            discoveredArtists++
          }
        }
      }

      consecutiveErrors = 0 // Reset error counter on success
    } catch (error) {
      console.error(`Error searching for "${query}":`, error)
      consecutiveErrors++

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.log("Too many consecutive errors, stopping API calls")
        break
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * Math.pow(2, consecutiveErrors), 10000)))
    }
  }

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
      genre: "Afrobeats", // Default genre
      popularity: track.popularity,
      artistScore,
      isNewArtist: !AFRICAN_ARTISTS.some((artist) => artist.toLowerCase() === artistName.toLowerCase()),
      previewUrl: track.preview_url,
    }
  })

  return songs
}

function getFallbackSongs(): Song[] {
  const fallbackArtists = [
    "Burna Boy",
    "Wizkid",
    "Davido",
    "Tems",
    "Ayra Starr",
    "Rema",
    "Fireboy DML",
    "Asake",
    "Omah Lay",
    "Joeboy",
    "Kizz Daniel",
    "Tyla",
    "Focalistic",
    "Black Sherif",
    "Stonebwoy",
    "King Promise",
    "Sauti Sol",
    "Diamond Platnumz",
    "Master KG",
    "CKay",
  ]

  return fallbackArtists.slice(0, 20).map((artist, index) => ({
    id: `fallback-${index + 1}`,
    name: `Latest Release ${index + 1}`,
    artist,
    album: "Recent Album",
    releaseDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    spotifyUrl: `https://open.spotify.com/artist/${artist.replace(/\s+/g, "")}`,
    genre: "Afrobeats",
    popularity: Math.floor(Math.random() * 40) + 60,
    artistScore: 15,
    isNewArtist: false,
  }))
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    console.log("Fetching new releases...")

    let songs: Song[] = []
    let dataSource = "spotify_live"
    let error: string | undefined

    try {
      songs = await fetchFromSpotify()
      console.log(`Successfully fetched ${songs.length} songs from Spotify`)
    } catch (spotifyError) {
      console.error("Spotify fetch failed:", spotifyError)
      error = `Spotify API error: ${spotifyError.message}`
      dataSource = "fallback"
      songs = getFallbackSongs()
      console.log(`Using fallback data: ${songs.length} songs`)
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
      songs: songs.slice(0, 20), // Ensure exactly 20 songs
      dataSource,
      discoveredArtists,
      timestamp: new Date().toISOString(),
      totalFetched: songs.length,
      error,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in releases API:", error)

    const fallbackResponse: ApiResponse = {
      songs: getFallbackSongs(),
      dataSource: "error_fallback",
      discoveredArtists: 0,
      timestamp: new Date().toISOString(),
      error: `API Error: ${error.message}`,
    }

    return NextResponse.json(fallbackResponse)
  }
}

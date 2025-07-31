import { NextResponse } from "next/server"

interface SpotifyAccessToken {
  access_token: string
  token_type: string
  expires_in: number
}

interface SpotifyImage {
  height: number
  url: string
  width: number
}

interface SpotifyArtist {
  id: string
  name: string
  type: "artist"
  uri: string
}

interface SpotifyAlbum {
  album_type: string
  artists: SpotifyArtist[]
  available_markets: string[]
  external_urls: { spotify: string }
  href: string
  id: string
  images: SpotifyImage[]
  name: string
  release_date: string
  release_date_precision: string
  total_tracks: number
  type: "album"
  uri: string
}

interface SpotifyTrackDetails {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  external_urls: { spotify: string }
  popularity: number
  preview_url: string | null
  genres?: string[] // Genres can be here too
}

interface Release {
  id: string
  name: string
  artist: string
  album: string
  releaseDate: string
  imageUrl: string
  spotifyUrl?: string
  audiomackUrl?: string // New optional field
  appleMusicUrl?: string // New optional field
  isFresh: boolean
  daysAgo: number
  score: number
  genre: string
  streams?: number
  previewUrl?: string
}

// Environment variables for Spotify API
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

// In-memory cache for Spotify access token
let spotifyAccessToken: string | null = null
let tokenExpiryTime = 0

// List of Nigerian and broader African artists for scoring and filtering
const NIGERIAN_ARTISTS = [
  "Wizkid",
  "Davido",
  "Burna Boy",
  "Tiwa Savage",
  "Yemi Alade",
  "Tekno",
  "Mr Eazi",
  "Fireboy DML",
  "Rema",
  "Joeboy",
  "Omah Lay",
  "Asake",
  "Ayra Starr",
  "Ckay",
  "Tems",
  "Kizz Daniel",
  "Flavour",
  "Phyno",
  "Olamide",
  "Zlatan",
  "Bella Shmurda",
  "Mohbad",
  "Portable",
  "BNXN fka Buju",
  "Ladipoe",
  "Johnny Drille",
  "Nonso Amadi",
  "Adekunle Gold",
  "Simi",
  "Chike",
  "Peruzzi",
  "Mayorkun",
  "Blaqbonez",
  "Falz",
  "Laycon",
  "Vector",
  "MI Abaga",
  "Ice Prince",
  "Jesse Jagz",
  "Brymo",
  "Show Dem Camp",
  "Alpha P",
  "Bad Boy Timz",
  "Lojay",
  "Fave",
  "Victony",
  "Pheelz",
  "Young Jonn",
  "Spyro",
  "Shallipopi",
  "Odumodublvck",
  "Seyi Vibez",
  "Zinoleesky",
  "Mohbad",
  "Bella Shmurda",
  "Portable",
  "Guchi",
  "Teni",
  "Niniola",
  "Sarz",
  "Masterkraft",
  "P Prime",
  "Rexxie",
  "London",
  "Andre Vibez",
  "Magicsticks",
  "Pheelz",
  "Cracker Mallo",
  "Kel-P",
  "Shizzi",
  "Krizbeatz",
  "Blaise Beatz",
  "Niphkeys",
  "Reward Beatz",
  "Semzi",
  "Tempoe",
  "Telz",
  "P.Priime",
  "SperoachBeatz",
  "Fresh VDM",
  "Kiddominant",
  "Northboi",
  "Killertunes",
  "Puffy Tee",
  "Don Jazzy",
  "D'Banj",
  "2Baba",
  "P-Square",
  "Banky W.",
  "Darey",
  "Naeto C",
  "Lynxxx",
  "Dr SID",
  "Wande Coal",
  "D'Prince",
  "Reekado Banks",
  "Korede Bello",
  "Di'Ja",
  "Johnny Drille",
  "Ladipoe",
  "Crayon",
  "Ruger",
  "Magixx",
  "Boy Spyce",
  "Bayanni",
  "Johnny Drille",
  "L.A.X",
  "Skales",
  "Lil Kesh",
  "Reekado Banks",
  "Korede Bello",
  "Di'Ja",
  "Dremo",
  "Ycee",
  "Dice Ailes",
  "Skiibii",
  "Harrysong",
  "Orezi",
  "Solidstar",
  "Iyanya",
  "Praiz",
  "Ric Hassani",
  "Nonso Amadi",
  "Johnny Drille",
  "Chike",
  "Oxlade",
]
const AFRICAN_ARTISTS = [
  ...NIGERIAN_ARTISTS,
  "Sarkodie",
  "Stonebwoy",
  "Shatta Wale", // Ghana
  "Black Coffee",
  "Master KG",
  "Kabza De Small", // South Africa
  "Sauti Sol",
  "Khaligraph Jones", // Kenya
  "Fally Ipupa",
  "Innoss'B", // DRC
  "Diamond Platnumz",
  "Harmonize", // Tanzania
  "Eddy Kenzo", // Uganda
  "Toofan", // Togo
  "Salif Keita", // Mali
  "Angelique Kidjo", // Benin
  "Aya Nakamura", // Mali/France
  "Dadju", // Congo/France
  "Gims", // Congo/France
  "Tayc", // Cameroon/France
  "C4 Pedro", // Angola
  "Nelson Freitas", // Cape Verde
  "Mayra Andrade", // Cape Verde
  "Mr. Vegas", // Jamaica (often collaborates)
  "Popcaan", // Jamaica (often collaborates)
  "Vybz Kartel", // Jamaica (often collaborates)
  "Busy Signal", // Jamaica (often collaborates)
]

const AFROBEATS_GENRES = [
  "afrobeats",
  "afropop",
  "afro-pop",
  "nigerian pop",
  "nigerian hip hop",
  "ghanaian hip hop",
  "ghanaian pop",
  "amapiano",
  "south african house",
  "bongo flava",
  "ethiopian pop",
  "azonto",
  "highlife",
  "juju",
  "fuji",
  "gqom",
  "kwaito",
  "zouk",
  "coupe decale",
  "ndombolo",
  "mbalax",
  "soukous",
  "world",
  "african",
  "naija",
  "nigeria",
  "ghana",
  "kenya",
  "south africa",
  "tanzania",
  "uganda",
  "ethiopia",
  "congo",
  "angola",
  "cape verde",
  "jamaican", // For collaborations
]

const MIN_RELEASES_COUNT = 15 // Target number of releases to return

// Helper to introduce a delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

// Function to get Spotify Access Token
async function getSpotifyAccessToken(): Promise<string | null> {
  if (spotifyAccessToken && tokenExpiryTime > Date.now()) {
    return spotifyAccessToken
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error("Spotify Client ID or Client Secret not configured.")
    return null
  }

  try {
    const authString = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to get Spotify access token: ${response.status} - ${errorText}`)
      return null
    }

    const data: SpotifyAccessToken = await response.json()
    spotifyAccessToken = data.access_token
    tokenExpiryTime = Date.now() + data.expires_in * 1000 - 60000 // Refresh 1 minute before expiry
    console.log("Successfully obtained new Spotify access token.")
    return spotifyAccessToken
  } catch (error) {
    console.error("Error fetching Spotify access token:", error)
    return null
  }
}

// Function to check if a release date is within the last 7 days and in the current year
function isWithinSevenDaysAndCurrentYear(releaseDateStr: string): {
  isWithin: boolean
  daysAgo: number | null
} {
  const now = new Date()
  const currentYear = now.getFullYear()

  let releaseDate: Date

  // Handle different date precisions from Spotify
  if (releaseDateStr.length === 4) {
    // Year only (e.g., "2025")
    releaseDate = new Date(`${releaseDateStr}-01-01T00:00:00Z`)
  } else if (releaseDateStr.length === 7) {
    // Year-Month (e.g., "2025-07")
    releaseDate = new Date(`${releaseDateStr}-01T00:00:00Z`)
  } else {
    // Year-Month-Day (e.g., "2025-07-31")
    releaseDate = new Date(`${releaseDateStr}T00:00:00Z`)
  }

  // Ensure the release is from the current year
  if (releaseDate.getFullYear() !== currentYear) {
    return { isWithin: false, daysAgo: null }
  }

  const diffTime = Math.abs(now.getTime() - releaseDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // Use ceil to include today

  // Check if it's within the last 7 days (inclusive of today)
  const isRecent = diffDays <= 7 && diffDays >= 0

  return { isWithin: isRecent, daysAgo: isRecent ? diffDays : null }
}

// Function to generate realistic fallback dates for mock data
function generateRecentDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split("T")[0]
}

// Function to get a random integer between min and max (inclusive)
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Simulated Audiomack new releases
async function fetchAudiomackNewReleases(): Promise<Release[]> {
  console.log("Simulating fetching new releases from Audiomack...")
  await delay(200) // Simulate network delay
  const currentYear = new Date().getFullYear()
  return [
    {
      id: "am-release-1",
      name: "Afrobeat Anthem (Audiomack)",
      artist: "Audiomack Star",
      album: "Audiomack Hits",
      releaseDate: generateRecentDate(1),
      imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Audiomack Star Afrobeat Anthem album cover")}`,
      audiomackUrl: "https://audiomack.com/song/audiomack-star/afrobeat-anthem",
      isFresh: true,
      daysAgo: 1,
      score: 75,
      genre: "Afrobeats",
      streams: getRandomInt(50000, 500000),
      previewUrl: undefined,
    },
    {
      id: "am-release-2",
      name: "Amapiano Groove (Audiomack)",
      artist: "Amapiano Queen",
      album: "Audiomack Amapiano",
      releaseDate: generateRecentDate(3),
      imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Amapiano Queen Amapiano Groove album cover")}`,
      audiomackUrl: "https://audiomack.com/song/amapiano-queen/amapiano-groove",
      isFresh: true,
      daysAgo: 3,
      score: 70,
      genre: "Amapiano",
      streams: getRandomInt(30000, 400000),
      previewUrl: undefined,
    },
    {
      id: "am-release-5",
      name: "Naija Vibe (Audiomack)",
      artist: "Naija Sound",
      album: "Audiomack Naija",
      releaseDate: generateRecentDate(0),
      imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Naija Sound Naija Vibe album cover")}`,
      audiomackUrl: "https://audiomack.com/song/naija-sound/naija-vibe",
      isFresh: true,
      daysAgo: 0,
      score: 80,
      genre: "Afrobeats",
      streams: getRandomInt(60000, 700000),
      previewUrl: undefined,
    },
  ].filter((r) => new Date(r.releaseDate).getFullYear() === currentYear)
}

// Simulated Apple Music new releases
async function fetchAppleMusicNewReleases(): Promise<Release[]> {
  console.log("Simulating fetching new releases from Apple Music...")
  await delay(200) // Simulate network delay
  const currentYear = new Date().getFullYear()
  return [
    {
      id: "am-release-3",
      name: "Apple Music Exclusive (Afro)",
      artist: "Apple Music Artist",
      album: "Exclusive Drops",
      releaseDate: generateRecentDate(2),
      imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Apple Music Artist Exclusive Drops album cover")}`,
      appleMusicUrl: "https://music.apple.com/us/album/apple-music-exclusive/id123456789",
      isFresh: true,
      daysAgo: 2,
      score: 80,
      genre: "Afropop",
      streams: getRandomInt(70000, 600000),
      previewUrl: undefined,
    },
    {
      id: "am-release-4",
      name: "New Wave (Apple Music)",
      artist: "Rising Star",
      album: "Fresh Sounds",
      releaseDate: generateRecentDate(4),
      imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Rising Star New Wave album cover")}`,
      appleMusicUrl: "https://music.apple.com/us/album/new-wave/id987654321",
      isFresh: true,
      daysAgo: 4,
      score: 72,
      genre: "Afrobeats",
      streams: getRandomInt(40000, 450000),
      previewUrl: undefined,
    },
    {
      id: "am-release-6",
      name: "African Rhythms (Apple Music)",
      artist: "African Beats",
      album: "Global Sounds",
      releaseDate: generateRecentDate(1),
      imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("African Beats African Rhythms album cover")}`,
      appleMusicUrl: "https://music.apple.com/us/album/african-rhythms/id1122334455",
      isFresh: true,
      daysAgo: 1,
      score: 85,
      genre: "World",
      streams: getRandomInt(80000, 800000),
      previewUrl: undefined,
    },
  ].filter((r) => new Date(r.releaseDate).getFullYear() === currentYear)
}

// Fallback data for when Spotify API is unavailable or returns no results
const FALLBACK_TRACKS: Release[] = [
  {
    id: "fallback1",
    name: "Essence (Remix)",
    artist: "Wizkid, Tems, Justin Bieber",
    album: "Made In Lagos (Deluxe)",
    releaseDate: generateRecentDate(1),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Wizkid Essence album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/5FG7L6aUj9g9f1g1P9j1P9",
    isFresh: true,
    daysAgo: 1,
    score: 100,
    genre: "Afrobeats",
  },
  {
    id: "fallback2",
    name: "Last Last",
    artist: "Burna Boy",
    album: "Love, Damini",
    releaseDate: generateRecentDate(2),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Burna Boy Last Last album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/2PDgfoGz74f202020202020",
    isFresh: true,
    daysAgo: 2,
    score: 95,
    genre: "Afrobeats",
  },
  {
    id: "fallback3",
    name: "Unavailable",
    artist: "Davido, Musa Keys",
    album: "Timeless",
    releaseDate: generateRecentDate(3),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Davido Unavailable album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/3RjC0202020202020202020",
    isFresh: true,
    daysAgo: 3,
    score: 90,
    genre: "Afrobeats",
  },
  {
    id: "fallback4",
    name: "Calm Down",
    artist: "Rema",
    album: "Rave & Roses",
    releaseDate: generateRecentDate(4),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Rema Calm Down album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/4RjC0202020202020202020",
    isFresh: true,
    daysAgo: 4,
    score: 85,
    genre: "Afrobeats",
  },
  {
    id: "fallback5",
    name: "Bandana",
    artist: "Fireboy DML, Asake",
    album: "Playboy",
    releaseDate: generateRecentDate(5),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Fireboy DML Bandana album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/5RjC0202020202020202020",
    isFresh: true,
    daysAgo: 5,
    score: 80,
    genre: "Afrobeats",
  },
  {
    id: "fallback6",
    name: "Sungba (Remix)",
    artist: "Asake, Burna Boy",
    album: "Mr. Money With The Vibe",
    releaseDate: generateRecentDate(6),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Asake Sungba album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/6RjC0202020202020202020",
    isFresh: true,
    daysAgo: 6,
    score: 75,
    genre: "Afrobeats",
  },
  {
    id: "fallback7",
    name: "Rush",
    artist: "Ayra Starr",
    album: "19 & Dangerous",
    releaseDate: generateRecentDate(1),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Ayra Starr Rush album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/7RjC0202020202020202020",
    isFresh: true,
    daysAgo: 1,
    score: 70,
    genre: "Afrobeats",
  },
  {
    id: "fallback8",
    name: "Ku Lo Sa",
    artist: "Oxlade",
    album: "Ku Lo Sa",
    releaseDate: generateRecentDate(2),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Oxlade Ku Lo Sa album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/8RjC0202020202020202020",
    isFresh: true,
    daysAgo: 2,
    score: 65,
    genre: "Afrobeats",
  },
  {
    id: "fallback9",
    name: "Buga (Lo Lo Lo)",
    artist: "Kizz Daniel, Tekno",
    album: "Buga (Lo Lo Lo)",
    releaseDate: generateRecentDate(3),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Kizz Daniel Buga album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/9RjC0202020202020202020",
    isFresh: true,
    daysAgo: 3,
    score: 60,
    genre: "Afrobeats",
  },
  {
    id: "fallback10",
    name: "Finesse",
    artist: "Pheelz, Buju",
    album: "Finesse",
    releaseDate: generateRecentDate(4),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Pheelz Finesse album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/10RjC0202020202020202020",
    isFresh: true,
    daysAgo: 4,
    score: 55,
    genre: "Afrobeats",
  },
  {
    id: "fallback11",
    name: "Common Person",
    artist: "Asake",
    album: "Mr. Money With The Vibe",
    releaseDate: generateRecentDate(5),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Asake Common Person album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/11RjC0202020202020202020",
    isFresh: true,
    daysAgo: 5,
    score: 50,
    genre: "Afrobeats",
  },
  {
    id: "fallback12",
    name: "Terminator",
    artist: "Asake",
    album: "Terminator",
    releaseDate: generateRecentDate(6),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Asake Terminator album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/12RjC0202020202020202020",
    isFresh: true,
    daysAgo: 6,
    score: 45,
    genre: "Afrobeats",
  },
  {
    id: "fallback13",
    name: "Electricity",
    artist: "Pheelz, Davido",
    album: "Electricity",
    releaseDate: generateRecentDate(1),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Pheelz Electricity album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/13RjC0202020202020202020",
    isFresh: true,
    daysAgo: 1,
    score: 40,
    genre: "Afrobeats",
  },
  {
    id: "fallback14",
    name: "Organise",
    artist: "Asake",
    album: "Mr. Money With The Vibe",
    releaseDate: generateRecentDate(2),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Asake Organise album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/14RjC0202020202020202020",
    isFresh: true,
    daysAgo: 2,
    score: 35,
    genre: "Afrobeats",
  },
  {
    id: "fallback15",
    name: "Nzaza",
    artist: "Asake",
    album: "Mr. Money With The Vibe",
    releaseDate: generateRecentDate(3),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Asake Nzaza album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/15RjC0202020202020202020",
    isFresh: true,
    daysAgo: 3,
    score: 30,
    genre: "Afrobeats",
  },
  {
    id: "fallback16",
    name: "Peace Be Unto You (PBUY)",
    artist: "Asake",
    album: "Peace Be Unto You (PBUY)",
    releaseDate: generateRecentDate(4),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Asake Peace Be Unto You album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/16RjC0202020202020202020",
    isFresh: true,
    daysAgo: 4,
    score: 25,
    genre: "Afrobeats",
  },
  {
    id: "fallback17",
    name: "Joha",
    artist: "Asake",
    album: "Mr. Money With The Vibe",
    releaseDate: generateRecentDate(5),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Asake Joha album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/17RjC0202020202020202020",
    isFresh: true,
    daysAgo: 5,
    score: 20,
    genre: "Afrobeats",
  },
  {
    id: "fallback18",
    name: "Dull",
    artist: "Asake",
    album: "Mr. Money With The Vibe",
    releaseDate: generateRecentDate(6),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Asake Dull album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/18RjC0202020202020202020",
    isFresh: true,
    daysAgo: 6,
    score: 15,
    genre: "Afrobeats",
  },
  {
    id: "fallback19",
    name: "Muse",
    artist: "Asake",
    album: "Mr. Money With The Vibe",
    releaseDate: generateRecentDate(1),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Asake Muse album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/19RjC0202020202020202020",
    isFresh: true,
    daysAgo: 1,
    score: 10,
    genre: "Afrobeats",
  },
  {
    id: "fallback20",
    name: "Sunmomi",
    artist: "Asake",
    album: "Mr. Money With The Vibe",
    releaseDate: generateRecentDate(2),
    imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent("Asake Sunmomi album cover")}`,
    spotifyUrl: "https://open.spotify.com/track/20RjC0202020202020202020",
    isFresh: true,
    daysAgo: 2,
    score: 5,
    genre: "Afrobeats",
  },
]

export async function GET() {
  const token = await getSpotifyAccessToken()

  let allNewReleases: Release[] = []
  let dataSource = "fallback" // Default to fallback
  let fallbackUsed = true

  if (token) {
    const markets = ["NG", "GH", "KE", "ZA", "US", "GB"] // Nigeria, Ghana, Kenya, South Africa, US, UK
    const spotifyReleases: Release[] = []
    const seenSpotifyTrackIds = new Set<string>()

    for (const market of markets) {
      try {
        console.log(`Fetching new releases for market: ${market}`)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout for market fetch

        const response = await fetch(`https://api.spotify.com/v1/browse/new-releases?country=${market}&limit=50`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorBody = await response.text()
          console.error(`Error fetching new releases for market ${market}: ${response.status} - ${errorBody}`)
          if (response.status === 401) {
            // Token might be invalid
            spotifyAccessToken = null
            tokenExpiryTime = 0
          }
          continue
        }

        const data = await response.json()
        const albums: SpotifyAlbum[] = data.albums.items

        for (const album of albums) {
          const { isWithin, daysAgo } = isWithinSevenDaysAndCurrentYear(album.release_date)

          if (isWithin) {
            try {
              const albumTracksController = new AbortController()
              const albumTracksTimeoutId = setTimeout(() => albumTracksController.abort(), 5000) // 5 second timeout for album tracks

              const tracksResponse = await fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks?limit=1`, {
                // Fetch only 1 track per album
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                signal: albumTracksController.signal,
              })
              clearTimeout(albumTracksTimeoutId)

              if (!tracksResponse.ok) {
                const errorBody = await tracksResponse.text()
                console.warn(
                  `Could not fetch tracks for album ${album.name} (${album.id}): ${tracksResponse.status} - ${errorBody}`,
                )
                continue
              }

              const tracksData = await tracksResponse.json()
              const track = tracksData.items[0] as SpotifyTrackDetails // Get the first track as a representative

              if (track && !seenSpotifyTrackIds.has(track.id)) {
                const artistName = track.artists[0]?.name || "Unknown Artist"
                const trackName = track.name
                const albumName = album.name
                const imageUrl =
                  album.images[0]?.url ||
                  `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(artistName + " " + albumName + " album cover")}`
                const spotifyUrl = track.external_urls.spotify

                let genre = "Unknown"
                if (album.genres && album.genres.length > 0) {
                  genre = album.genres[0]
                } else {
                  const lowerCaseArtist = artistName.toLowerCase()
                  const lowerCaseTrackName = track.name.toLowerCase()
                  const lowerCaseAlbumName = album.name.toLowerCase()

                  if (NIGERIAN_ARTISTS.some((a) => lowerCaseArtist.includes(a.toLowerCase()))) {
                    genre = "Afrobeats (Nigerian)"
                  } else if (AFRICAN_ARTISTS.some((a) => lowerCaseArtist.includes(a.toLowerCase()))) {
                    genre = "Afrobeats (African)"
                  } else if (
                    AFROBEATS_GENRES.some((g) => lowerCaseTrackName.includes(g) || lowerCaseAlbumName.includes(g))
                  ) {
                    genre = "Afrobeats (Inferred)"
                  }
                }

                const score =
                  (NIGERIAN_ARTISTS.some((a) => artistName.toLowerCase().includes(a.toLowerCase())) ? 40 : 0) +
                  (AFRICAN_ARTISTS.some((a) => artistName.toLowerCase().includes(a.toLowerCase())) ? 25 : 0) +
                  (track.popularity || 0)

                spotifyReleases.push({
                  id: track.id,
                  name: trackName,
                  artist: artistName,
                  album: albumName,
                  releaseDate: album.release_date,
                  imageUrl,
                  spotifyUrl,
                  isFresh: daysAgo !== null && daysAgo <= 2,
                  daysAgo: daysAgo!,
                  score: score,
                  genre: genre,
                  streams: track.popularity
                    ? track.popularity * getRandomInt(10000, 50000)
                    : getRandomInt(500000, 5000000),
                  previewUrl: track.preview_url || undefined,
                })
                seenSpotifyTrackIds.add(track.id)
              }
            } catch (albumTracksError) {
              console.error(`Error fetching track details for album ${album.id}:`, albumTracksError)
            }
          }
          if (spotifyReleases.length >= MIN_RELEASES_COUNT * 2) {
            // Fetch more than needed to allow for filtering
            break
          }
        }
      } catch (error) {
        console.error(`Error fetching releases for market ${market}:`, error)
      }
      if (spotifyReleases.length >= MIN_RELEASES_COUNT * 2) {
        break
      }
      await delay(300) // Delay between market requests
    }

    allNewReleases = spotifyReleases
    dataSource = "spotify"
    fallbackUsed = false

    // Supplement with Audiomack and Apple Music if Spotify didn't provide enough
    if (allNewReleases.length < MIN_RELEASES_COUNT) {
      console.log(`Spotify provided ${allNewReleases.length} releases. Supplementing with other sources.`)
      const audiomackReleases = await fetchAudiomackNewReleases()
      const appleMusicReleases = await fetchAppleMusicNewReleases()

      const combinedOtherReleases = [...audiomackReleases, ...appleMusicReleases]
      const seenOtherIds = new Set(allNewReleases.map((r) => r.id))

      for (const release of combinedOtherReleases) {
        if (!seenOtherIds.has(release.id) && allNewReleases.length < MIN_RELEASES_COUNT) {
          allNewReleases.push(release)
          seenOtherIds.add(release.id)
        }
      }
      dataSource = "spotify-audiomack-apple"
      fallbackUsed = false
    }
  } else {
    console.warn("Spotify access token not available. Using fallback data.")
  }

  // Sort by score (Nigerian artists first), then by recency (daysAgo)
  allNewReleases.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score // Higher score first
    }
    return a.daysAgo - b.daysAgo // Fewer days ago first
  })

  // Ensure artist diversity (max 1 track per artist for the final list)
  const artistMap = new Map<string, Release>()
  for (const song of allNewReleases) {
    const artistKey = song.artist.toLowerCase().trim()
    const existing = artistMap.get(artistKey)
    if (!existing || (song.score || 0) > (existing.score || 0)) {
      artistMap.set(artistKey, song)
    }
  }
  const deduplicatedReleases = Array.from(artistMap.values())

  // Limit to MIN_RELEASES_COUNT songs
  let finalReleases = deduplicatedReleases.slice(0, MIN_RELEASES_COUNT)

  // If still not enough, fill with generic fallback data
  if (finalReleases.length < MIN_RELEASES_COUNT) {
    const fallbackCount = MIN_RELEASES_COUNT - finalReleases.length
    const usedIds = new Set(finalReleases.map((r) => r.id))
    const additionalFallback = FALLBACK_TRACKS.filter((f) => !usedIds.has(f.id)).slice(0, fallbackCount)
    finalReleases = [...finalReleases, ...additionalFallback]
    fallbackUsed = true
    if (dataSource === "spotify") dataSource = "spotify-with-fallback"
    else if (dataSource === "spotify-audiomack-apple") dataSource = "spotify-audiomack-apple-with-fallback"
    else dataSource = "fallback"
  }

  console.log(
    `Successfully fetched and filtered ${finalReleases.length} new Afrobeats releases. Data source: ${dataSource}`,
  )
  return NextResponse.json({
    songs: finalReleases,
    lastUpdated: new Date().toISOString(),
    total: finalReleases.length,
    dataSource: dataSource,
    searchPeriod: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    fallbackUsed: fallbackUsed,
  })
}

import { NextResponse } from "next/server"

// In a real application, you would securely fetch and refresh this token
// For demonstration, assume it's obtained from a server-side process
const SPOTIFY_ACCESS_TOKEN = process.env.SPOTIFY_ACCESS_TOKEN || "YOUR_SPOTIFY_ACCESS_TOKEN" // Replace with actual token

// List of markets to fetch new releases from
const MARKETS = ["NG", "GH", "ZA", "KE", "US", "GB"] // Nigeria, Ghana, South Africa, Kenya, US, UK

// List of popular Nigerian/African artists for scoring
const NIGERIAN_ARTISTS = [
  "Wizkid",
  "Davido",
  "Burna Boy",
  "Tiwa Savage",
  "Olamide",
  "Fireboy DML",
  "Rema",
  "Joeboy",
  "Mr Eazi",
  "Tekno",
  "Yemi Alade",
  "Simi",
  "Adekunle Gold",
  "Kizz Daniel",
  "Flavour",
  "Phyno",
  "Patoranking",
  "Mayorkun",
  "Peruzzi",
  "Zinoleesky",
  "Mohbad",
  "Bella Shmurda",
  "Asake",
  "Ayra Starr",
  "Tems",
  "Ckay",
  "Omah Lay",
  "BNXN fka Buju",
  "Victony",
  "Fave",
  "Blaqbonez",
  "Ladipoe",
  "Johnny Drille",
  "Chike",
  "Nonso Amadi",
  "Show Dem Camp",
  "Falz",
  "Vector",
  "MI Abaga",
  "Naira Marley",
  "Zlatan",
  "Small Doctor",
  "Portable",
  "Spyro",
  "Shallipopi",
  "Odumodublvck",
  "Seyi Vibez",
  "Young Jonn",
  "Shallipopi",
  "Bloody Civilian",
  "Teni",
  "Oxlade",
  "Pheelz",
  "Lojay",
  "Guchi",
  "Bad Boy Timz",
  "Crayon",
  "Magixx",
  "Boy Spyce",
  "Ruger",
  "Johnny Drille",
  "Chike",
  "Nonso Amadi",
  "Show Dem Camp",
  "Falz",
  "Vector",
  "MI Abaga",
  "Naira Marley",
  "Zlatan",
  "Small Doctor",
  "Portable",
  "Spyro",
  "Shallipopi",
  "Odumodublvck",
  "Seyi Vibez",
  "Young Jonn",
  "Shallipopi",
  "Bloody Civilian",
  "Teni",
  "Oxlade",
  "Pheelz",
  "Lojay",
  "Guchi",
  "Bad Boy Timz",
  "Crayon",
  "Magixx",
  "Boy Spyce",
  "Ruger",
]

const AFRICAN_ARTISTS = [
  "Sarkodie",
  "Stonebwoy",
  "Shatta Wale",
  "Kuami Eugene",
  "Kidi", // Ghana
  "Diamond Platnumz",
  "Harmonize",
  "Rayvanny", // Tanzania
  "Fally Ipupa",
  "Maître Gims", // DRC
  "Nasty C",
  "Cassper Nyovest",
  "AKA", // South Africa
  "Sauti Sol",
  "Khaligraph Jones", // Kenya
  "Eddy Kenzo", // Uganda
  "Toofan", // Togo
  "Salatiel", // Cameroon
  "Aya Nakamura", // Mali/France
  "Dadju", // Congo/France
  "Tayc", // Cameroon/France
  "Innoss'B", // DRC
  "Crayon",
  "Magixx",
  "Boy Spyce",
  "Ruger",
]

// Helper to generate a recent date for fallback data
function generateRecentDate(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split("T")[0] // YYYY-MM-DD
}

// Fallback data in case Spotify API fails
const fallbackTracks = [
  {
    id: "fallback1",
    name: "Afrobeat Anthem 2025",
    artist: "Wizkid",
    album: "Future Sounds",
    release_date: generateRecentDate(1),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback1",
    is_fresh: true,
    days_ago: 1,
  },
  {
    id: "fallback2",
    name: "Lagos Groove",
    artist: "Davido",
    album: "City Vibes",
    release_date: generateRecentDate(2),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback2",
    is_fresh: true,
    days_ago: 2,
  },
  {
    id: "fallback3",
    name: "African Giant Remix",
    artist: "Burna Boy",
    album: "Global Fusion",
    release_date: generateRecentDate(3),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback3",
    is_fresh: false,
    days_ago: 3,
  },
  {
    id: "fallback4",
    name: "Naija Spirit",
    artist: "Tiwa Savage",
    album: "Queen of Afrobeats",
    release_date: generateRecentDate(4),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback4",
    is_fresh: false,
    days_ago: 4,
  },
  {
    id: "fallback5",
    name: "Ghetto Gospel",
    artist: "Olamide",
    album: "Street Anthems",
    release_date: generateRecentDate(5),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback5",
    is_fresh: false,
    days_ago: 5,
  },
  {
    id: "fallback6",
    name: "Vibration 2.0",
    artist: "Fireboy DML",
    album: "Laughter, Tears & Goosebumps",
    release_date: generateRecentDate(6),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback6",
    is_fresh: false,
    days_ago: 6,
  },
  {
    id: "fallback7",
    name: "Calm Down (Afro Remix)",
    artist: "Rema",
    album: "Rave & Roses",
    release_date: generateRecentDate(7),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback7",
    is_fresh: false,
    days_ago: 7,
  },
  {
    id: "fallback8",
    name: "Baby (Acoustic)",
    artist: "Joeboy",
    album: "Love & Light",
    release_date: generateRecentDate(1),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback8",
    is_fresh: true,
    days_ago: 1,
  },
  {
    id: "fallback9",
    name: "Leg Over (Live)",
    artist: "Mr Eazi",
    album: "Life Is Eazi, Vol. 1",
    release_date: generateRecentDate(2),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback9",
    is_fresh: true,
    days_ago: 2,
  },
  {
    id: "fallback10",
    name: "Pana (Dance Mix)",
    artist: "Tekno",
    album: "Old Romance",
    release_date: generateRecentDate(3),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback10",
    is_fresh: false,
    days_ago: 3,
  },
  {
    id: "fallback11",
    name: "Johnny (Amapiano)",
    artist: "Yemi Alade",
    album: "Woman of Steel",
    release_date: generateRecentDate(4),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback11",
    is_fresh: false,
    days_ago: 4,
  },
  {
    id: "fallback12",
    name: "Duduke (Remix)",
    artist: "Simi",
    album: "Omo Charlie Champagne, Vol. 1",
    release_date: generateRecentDate(5),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback12",
    is_fresh: false,
    days_ago: 5,
  },
  {
    id: "fallback13",
    name: "Something Different (Live)",
    artist: "Adekunle Gold",
    album: "Afro Pop, Vol. 1",
    release_date: generateRecentDate(6),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback13",
    is_fresh: false,
    days_ago: 6,
  },
  {
    id: "fallback14",
    name: "Madu (Acoustic)",
    artist: "Kizz Daniel",
    album: "King of Love",
    release_date: generateRecentDate(7),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback14",
    is_fresh: false,
    days_ago: 7,
  },
  {
    id: "fallback15",
    name: "Levels (Afrobeat)",
    artist: "Flavour",
    album: "Flavour of Africa",
    release_date: generateRecentDate(1),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback15",
    is_fresh: true,
    days_ago: 1,
  },
  {
    id: "fallback16",
    name: "Highway (feat. Phyno)",
    artist: "DJ Kaywise",
    album: "The Journey",
    release_date: generateRecentDate(2),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback16",
    is_fresh: true,
    days_ago: 2,
  },
  {
    id: "fallback17",
    name: "Abule (Remix)",
    artist: "Patoranking",
    album: "Three",
    release_date: generateRecentDate(3),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback17",
    is_fresh: false,
    days_ago: 3,
  },
  {
    id: "fallback18",
    name: "Betty Butter (feat. Davido)",
    artist: "Mayorkun",
    album: "Back In Office",
    release_date: generateRecentDate(4),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback18",
    is_fresh: false,
    days_ago: 4,
  },
  {
    id: "fallback19",
    name: "Cash App (Remix)",
    artist: "Bella Shmurda",
    album: "High Tension 2.0",
    release_date: generateRecentDate(5),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback19",
    is_fresh: false,
    days_ago: 5,
  },
  {
    id: "fallback20",
    name: "Holy Father (Acoustic)",
    artist: "Victony",
    album: "Outlaw",
    release_date: generateRecentDate(6),
    image: "/placeholder.svg?height=300&width=300",
    spotify_url: "https://open.spotify.com/track/fallback20",
    is_fresh: false,
    days_ago: 6,
  },
]

// Utility to check if a date is within the last 7 days and from 2025
function isWithinSevenDaysAnd2025(releaseDate: string): {
  isRecent: boolean
  daysAgo: number | null
  isFresh: boolean
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalize to start of day

  let parsedDate: Date
  if (releaseDate.length === 4) {
    // YYYY format (e.g., 2025) - assume Jan 1st
    parsedDate = new Date(Number.parseInt(releaseDate), 0, 1)
  } else if (releaseDate.length === 7) {
    // YYYY-MM format (e.g., 2025-01) - assume 1st of month
    const [year, month] = releaseDate.split("-").map(Number)
    parsedDate = new Date(year, month - 1, 1)
  } else {
    // YYYY-MM-DD format (e.g., 2025-01-15)
    parsedDate = new Date(releaseDate)
  }

  parsedDate.setHours(0, 0, 0, 0) // Normalize to start of day

  const diffTime = Math.abs(today.getTime() - parsedDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const isRecent = diffDays <= 7 && parsedDate.getFullYear() === 2025
  const isFresh = diffDays <= 2 && parsedDate.getFullYear() === 2025

  return {
    isRecent,
    daysAgo: isRecent ? diffDays : null,
    isFresh,
  }
}

// Function to score a track based on Afrobeats relevance
function scoreTrack(track: any): number {
  let score = 0
  const artistNames = track.artists.map((a: any) => a.name)
  const albumName = track.album.name.toLowerCase()
  const trackName = track.name.toLowerCase()

  // Prioritize Nigerian artists
  if (artistNames.some((artist: string) => NIGERIAN_ARTISTS.includes(artist))) {
    score += 40
  }
  // Score other African artists
  else if (artistNames.some((artist: string) => AFRICAN_ARTISTS.includes(artist))) {
    score += 25
  }

  // Check for Afrobeats genres (if available from album or artist)
  const genres = track.album.genres || []
  if (genres.some((genre: string) => genre.toLowerCase().includes("afro"))) {
    score += 15
  }

  // Check for keywords in album or track name
  const keywords = ["afro", "naija", "nigeria", "ghana", "amapiano", "bongo", "gengetone", "gqom"]
  if (keywords.some((keyword) => albumName.includes(keyword) || trackName.includes(keyword))) {
    score += 10
  }

  return score
}

export async function GET() {
  if (!SPOTIFY_ACCESS_TOKEN || SPOTIFY_ACCESS_TOKEN === "YOUR_SPOTIFY_ACCESS_TOKEN") {
    console.warn("Spotify access token not configured. Returning fallback data.")
    return NextResponse.json({ releases: fallbackTracks, source: "fallback" })
  }

  const allAfrobeatsReleases: any[] = []
  const processedAlbumIds = new Set<string>()
  const processedTrackIds = new Set<string>()
  const addedArtistIds = new Set<string>()

  try {
    for (const market of MARKETS) {
      console.log(`Fetching new releases for market: ${market}`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8-second timeout

      try {
        const response = await fetch(`https://api.spotify.com/v1/browse/new-releases?country=${market}&limit=50`, {
          headers: {
            Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
          },
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(
            `Error fetching new releases for market ${market}: ${response.status} ${response.statusText} - ${errorText}`,
          )
          continue // Skip to next market
        }

        const data = await response.json()
        const albums = data.albums.items || []

        for (const album of albums) {
          if (processedAlbumIds.has(album.id)) {
            continue
          }
          processedAlbumIds.add(album.id)

          const { isRecent, daysAgo, isFresh } = isWithinSevenDaysAnd2025(album.release_date)

          if (isRecent) {
            // Fetch tracks for each album
            const albumTracksController = new AbortController()
            const albumTracksTimeoutId = setTimeout(() => albumTracksController.abort(), 5000) // 5-second timeout for tracks

            try {
              const tracksResponse = await fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks?limit=10`, {
                headers: {
                  Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
                },
                signal: albumTracksController.signal,
              })
              clearTimeout(albumTracksTimeoutId)

              if (!tracksResponse.ok) {
                const errorText = await tracksResponse.text()
                console.error(
                  `Error fetching tracks for album ${album.id}: ${tracksResponse.status} ${tracksResponse.statusText} - ${errorText}`,
                )
                continue
              }

              const tracksData = await tracksResponse.json()
              const tracks = tracksData.items || []

              for (const track of tracks) {
                if (processedTrackIds.has(track.id)) {
                  continue
                }

                const fullTrack = {
                  id: track.id,
                  name: track.name,
                  artist: track.artists.map((a: any) => a.name).join(", "),
                  album: album.name,
                  release_date: album.release_date,
                  image: album.images[0]?.url || "/placeholder.svg",
                  spotify_url: track.external_urls.spotify,
                  is_fresh: isFresh,
                  days_ago: daysAgo,
                  score: scoreTrack({ ...track, album: album }), // Pass album for genre info
                }

                // Ensure artist diversity and limit to 20
                if (allAfrobeatsReleases.length < 20 && !addedArtistIds.has(fullTrack.artist) && fullTrack.score > 0) {
                  allAfrobeatsReleases.push(fullTrack)
                  processedTrackIds.add(fullTrack.id)
                  addedArtistIds.add(fullTrack.artist)
                } else if (allAfrobeatsReleases.length >= 20) {
                  break // Stop if we have enough
                }
              }
            } catch (trackError: any) {
              if (trackError.name === "AbortError") {
                console.warn(`Timeout fetching tracks for album ${album.id}.`)
              } else {
                console.error(`Unexpected error fetching tracks for album ${album.id}:`, trackError)
              }
            }
          }
        }
      } catch (marketError: any) {
        if (marketError.name === "AbortError") {
          console.warn(`Timeout fetching releases for market ${market}.`)
        } else {
          console.error(`Unexpected error fetching releases for market ${market}:`, marketError)
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 300)) // Delay between market calls
    }

    // Sort by score (descending) and then by days_ago (ascending)
    allAfrobeatsReleases.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return a.days_ago - b.days_ago
    })

    // Ensure exactly 20 releases, fill with fallback if needed
    const finalReleases = allAfrobeatsReleases.slice(0, 20)
    if (finalReleases.length < 20) {
      const needed = 20 - finalReleases.length
      for (let i = 0; i < needed; i++) {
        if (fallbackTracks[i]) {
          finalReleases.push(fallbackTracks[i])
        }
      }
    }

    return NextResponse.json({ releases: finalReleases, source: "spotify" })
  } catch (error) {
    console.error("Unhandled error in releases API:", error)
    return NextResponse.json({ releases: fallbackTracks, source: "fallback" })
  }
}

import { NextResponse } from "next/server"

interface WebBuzzData {
  artist: string
  song: string
  mentions: number
  sentiment: number
  sources: string[]
}

// Helper function to get a random integer between min and max (inclusive)
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Simulated data for web buzz from various sources
const generateWebBuzzData = () => {
  const data = []
  const artists = ["Wizkid", "Davido", "Burna Boy", "Rema", "Tems", "Asake", "Ayra Starr", "Omah Lay"]
  const songs = ["Essence", "Unavailable", "Last Last", "Calm Down", "Me & U", "Sungba", "Rush", "Soso"]
  const sources = ["YouTube", "Audiomack", "Apple Music", "Blogs", "News Sites", "Forums"]

  for (let i = 0; i < 20; i++) {
    const artist = artists[getRandomInt(0, artists.length - 1)]
    const song = songs[getRandomInt(0, songs.length - 1)]
    const source = sources[getRandomInt(0, sources.length - 1)]
    const totalMentions = getRandomInt(100, 5000)
    const avgSentiment = Number.parseFloat((Math.random() * 2 - 1).toFixed(2)) // Between -1 and 1
    const buzzScore = getRandomInt(50, 100)

    data.push({
      id: `web-buzz-${i}-${Date.now()}`,
      artist,
      song,
      source,
      totalMentions,
      avgSentiment,
      buzzScore,
      timestamp: new Date().toISOString(),
    })
  }
  return data
}

export async function GET() {
  try {
    const buzzData = generateWebBuzzData()
    return NextResponse.json({
      buzzData,
      lastUpdated: new Date().toISOString(),
      total: buzzData.length,
      sources: ["YouTube", "Audiomack", "Apple Music", "Blogs", "News Sites", "Forums"],
    })
  } catch (error) {
    console.error("Error fetching web buzz data:", error)
    return NextResponse.json({ error: "Failed to fetch web buzz data" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface SelectedSong {
  id: string
  name: string
  artist: string
  album: string
  releaseDate: string
  spotifyUrl: string
  genre: string
  popularity: number
  addedAt: string
  addedBy: string
}

const SELECTED_RELEASES_FILE = path.join(process.cwd(), "data", "selected-releases.json")

function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readSelectedReleases(): SelectedSong[] {
  try {
    ensureDataDirectory()
    if (fs.existsSync(SELECTED_RELEASES_FILE)) {
      const data = fs.readFileSync(SELECTED_RELEASES_FILE, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error reading selected releases:", error)
  }
  return []
}

function writeSelectedReleases(releases: SelectedSong[]) {
  try {
    ensureDataDirectory()
    fs.writeFileSync(SELECTED_RELEASES_FILE, JSON.stringify(releases, null, 2))
  } catch (error) {
    console.error("Error writing selected releases:", error)
    throw error
  }
}

function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

export async function GET() {
  try {
    const selectedReleases = readSelectedReleases()

    // If we have selected releases, return them
    if (selectedReleases.length > 0) {
      return NextResponse.json({
        songs: selectedReleases.slice(0, 20), // Ensure max 20
        source: "manual_selection",
        count: selectedReleases.length,
        timestamp: new Date().toISOString(),
      })
    }

    // If no selected releases, fall back to API releases
    try {
      const baseUrl = getBaseUrl()
      const response = await fetch(`${baseUrl}/api/releases`)

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({
          songs: data.songs || [],
          source: "api_fallback",
          count: data.songs?.length || 0,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error fetching fallback releases:", error)
    }

    // Final fallback
    return NextResponse.json({
      songs: [],
      source: "empty",
      count: 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in selected releases API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch selected releases",
        songs: [],
        source: "error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { songs } = await request.json()

    if (!Array.isArray(songs)) {
      return NextResponse.json({ error: "Songs must be an array" }, { status: 400 })
    }

    // Validate and format songs
    const formattedSongs: SelectedSong[] = songs.map((song, index) => ({
      id: song.id || `selected-${Date.now()}-${index}`,
      name: song.name || "Unknown Track",
      artist: song.artist || "Unknown Artist",
      album: song.album || "Unknown Album",
      releaseDate: song.releaseDate || new Date().toISOString(),
      spotifyUrl: song.spotifyUrl || "#",
      genre: song.genre || "Afrobeats",
      popularity: song.popularity || 0,
      addedAt: new Date().toISOString(),
      addedBy: "admin",
    }))

    // Save to file
    writeSelectedReleases(formattedSongs)

    return NextResponse.json({
      message: "Selected releases updated successfully",
      count: formattedSongs.length,
      songs: formattedSongs,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating selected releases:", error)
    return NextResponse.json(
      {
        error: "Failed to update selected releases",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    // Clear selected releases
    writeSelectedReleases([])

    return NextResponse.json({
      message: "Selected releases cleared successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error clearing selected releases:", error)
    return NextResponse.json(
      {
        error: "Failed to clear selected releases",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

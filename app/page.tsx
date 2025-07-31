"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, Calendar, Flame, Play, ExternalLink } from "lucide-react"
import Image from "next/image"

interface Song {
  id: string
  name: string
  artist: string
  album: string
  releaseDate: string
  spotifyUrl: string
  imageUrl: string
  popularity: number
  genre: string
  streams?: number // Make streams optional as it might be missing
  buzzScore?: number
  previewUrl?: string
}

interface ApiResponse {
  songs: Song[]
  lastUpdated: string
  total: number
  dataSource: string
  searchPeriod?: string
  fallbackUsed?: boolean
}

// Helper function to format stream numbers
function formatStreams(num: number | undefined | null): string {
  if (num === undefined || num === null) {
    return "N/A" // Handle undefined or null streams gracefully
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

// Helper function to calculate days ago
function getDaysAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}

// Helper function to check if release is fresh (within 2 days)
function isFreshRelease(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 2
}

export default function HomePage() {
  const [newReleases, setNewReleases] = useState<Song[]>([])
  const [buzzingSongs, setBuzzingSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [releasesRes, buzzingRes] = await Promise.all([fetch("/api/releases"), fetch("/api/buzzing")])

        if (!releasesRes.ok) {
          throw new Error(`Failed to fetch new releases: ${releasesRes.statusText}`)
        }
        if (!buzzingRes.ok) {
          throw new Error(`Failed to fetch buzzing songs: ${buzzingRes.statusText}`)
        }

        const releasesData: ApiResponse = await releasesRes.json()
        const buzzingData: ApiResponse = await buzzingRes.json()

        setNewReleases(releasesData.songs || [])
        setBuzzingSongs(buzzingData.songs || [])
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load music data. Please try again later.")
        // Provide some basic fallback if API fails completely
        setNewReleases([
          {
            id: "fallback-new-1",
            name: "No New Releases",
            artist: "Check Back Soon",
            album: "Error",
            releaseDate: new Date().toISOString(),
            spotifyUrl: "#",
            imageUrl: "/placeholder.svg?height=300&width=300",
            popularity: 0,
            genre: "N/A",
          },
        ])
        setBuzzingSongs([
          {
            id: "fallback-buzz-1",
            name: "No Buzzing Songs",
            artist: "Check Back Soon",
            album: "Error",
            releaseDate: new Date().toISOString(),
            spotifyUrl: "#",
            imageUrl: "/placeholder.svg?height=300&width=300",
            popularity: 0,
            genre: "N/A",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderSongCard = (song: Song) => (
    <Card key={song.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="relative w-full aspect-square mb-4 rounded-md overflow-hidden">
          <Image
            src={song.imageUrl || "/placeholder.svg?height=300&width=300&query=album+cover"}
            alt={`${song.name} by ${song.artist} album cover`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={true}
          />
          {isFreshRelease(song.releaseDate) && (
            <Badge variant="secondary" className="absolute top-2 left-2 flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" /> Fresh
            </Badge>
          )}
        </div>
        <div className="flex-grow">
          <CardTitle className="text-lg font-semibold mb-1 truncate">{song.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground truncate">{song.artist}</CardDescription>
          <p className="text-xs text-muted-foreground mt-1 truncate">{song.album}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">{song.genre}</Badge>
          <Badge variant="secondary">{formatStreams(song.streams)} streams</Badge>
          <Badge variant="outline">{getDaysAgo(song.releaseDate)}</Badge>
        </div>
        <div className="mt-4 flex gap-2">
          {song.previewUrl && (
            <Button size="sm" variant="outline" asChild>
              <a
                href={song.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Play preview of ${song.name}`}
              >
                <Play className="w-4 h-4" />
              </a>
            </Button>
          )}
          <Button size="sm" asChild>
            <a
              href={song.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Listen to ${song.name} on Spotify`}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Listen
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Afropulse: Your Beat to African Music
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the freshest Afrobeats, Amapiano, and Alté releases, and track what's buzzing across the web.
          </p>
        </header>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
            <p className="text-lg text-gray-700">Loading the latest beats...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-600">
            <p className="text-lg font-semibold mb-2">Error loading data:</p>
            <p className="text-md">{error}</p>
            <p className="text-sm text-muted-foreground mt-4">Displaying limited fallback data.</p>
          </div>
        )}

        {!loading && (
          <>
            {/* New Releases Section */}
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Calendar className="w-7 h-7 text-orange-600" /> New Releases
                </h2>
                <Button variant="outline" asChild>
                  <a href="/releases">View All</a>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {newReleases.length > 0 ? (
                  newReleases.slice(0, 8).map(renderSongCard)
                ) : (
                  <p className="col-span-full text-center text-muted-foreground">No new releases found.</p>
                )}
              </div>
            </section>

            {/* Buzzing Songs Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <TrendingUp className="w-7 h-7 text-red-600" /> Buzzing Now
                </h2>
                <Button variant="outline" asChild>
                  <a href="/trending">View All</a>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {buzzingSongs.length > 0 ? (
                  buzzingSongs.slice(0, 8).map(renderSongCard)
                ) : (
                  <p className="col-span-full text-center text-muted-foreground">No buzzing songs found.</p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

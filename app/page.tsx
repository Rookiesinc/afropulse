"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  TrendingUp,
  Calendar,
  Flame,
  Play,
  ExternalLink,
  Headphones,
  Star,
  Globe,
  Clock,
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Music,
} from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

interface Song {
  id: string
  name: string
  artist: string
  album: string
  releaseDate: string
  imageUrl: string
  spotifyUrl?: string
  audiomackUrl?: string // New optional field
  appleMusicUrl?: string // New optional field
  popularity: number
  genre: string
  streams?: number
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
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "success" | "error">("idle")
  const [dataSource, setDataSource] = useState<string>("")
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [releasesRes, buzzingRes] = await Promise.all([fetch("/api/releases"), fetch("/api/buzzing")])

        const releases: ApiResponse = releasesRes.ok
          ? await releasesRes.json()
          : { songs: [], dataSource: "error", searchPeriod: "", lastUpdated: "" }
        const buzzing: ApiResponse = buzzingRes.ok
          ? await buzzingRes.json()
          : { songs: [], dataSource: "error", searchPeriod: "", lastUpdated: "" }

        setNewReleases(releases.songs || [])
        setBuzzingSongs(buzzing.songs || [])
        setDataSource(releases.dataSource || buzzing.dataSource || "unknown")
        setLastUpdated(releases.lastUpdated || buzzing.lastUpdated || "")
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubscribing(true)
    setSubscriptionStatus("idle")

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubscriptionStatus("success")
        setEmail("")
        toast({
          title: "Successfully subscribed! 🎉",
          description: "You'll receive our weekly Afrobeats digest every Friday.",
        })
      } else {
        setSubscriptionStatus("error")
        toast({
          title: "Subscription failed",
          description: data.error || "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setSubscriptionStatus("error")
      toast({
        title: "Network error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  const getDataSourceBadge = () => {
    switch (dataSource) {
      case "spotify":
        return (
          <Badge variant="default" className="bg-green-500">
            Live Spotify Data
          </Badge>
        )
      case "manual":
        return <Badge variant="secondary">Admin Curated</Badge>
      case "fallback":
        return <Badge variant="outline">Curated Selection</Badge>
      case "spotify-with-fallback":
        return (
          <Badge variant="default" className="bg-green-500">
            Spotify + Fallback
          </Badge>
        )
      case "spotify-audiomack-apple":
        return (
          <Badge variant="default" className="bg-purple-500">
            Multi-Source
          </Badge>
        )
      default:
        return <Badge variant="outline">Music Data</Badge>
    }
  }

  const renderSongCard = (song: Song) => (
    <Card
      key={song.id}
      className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 bg-white/80 backdrop-blur-sm"
    >
      <CardContent className="p-0">
        <div className="relative w-full aspect-square rounded-t-lg overflow-hidden">
          <Image
            src={
              song.imageUrl ||
              `/placeholder.svg?height=300&width=300&query=${encodeURIComponent((song.artist || "unknown artist") + " " + (song.album || "unknown album") || "afrobeats music")}`
            }
            alt={`${song.name} by ${song.artist} album cover`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={true}
          />
          {isFreshRelease(song.releaseDate) && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 flex items-center gap-1">
              <Flame className="w-3 h-3" /> Fresh
            </Badge>
          )}
          {song.buzzScore && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs font-medium">{song.buzzScore}</span>
            </div>
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{song.name}</h3>
          <p className="text-muted-foreground mb-2 line-clamp-1">{song.artist}</p>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{song.album}</p>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {song.genre}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Headphones className="w-3 h-3" />
                {formatStreams(song.streams)}
              </div>
            </div>
            <div className="flex gap-1">
              {song.previewUrl && (
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
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
              {song.spotifyUrl && (
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                  <a
                    href={song.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Listen to ${song.name} on Spotify`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {song.audiomackUrl && (
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                  <a
                    href={song.audiomackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Listen to ${song.name} on Audiomack`}
                  >
                    <Headphones className="w-4 h-4" /> {/* Using headphones for Audiomack */}
                  </a>
                </Button>
              )}
              {song.appleMusicUrl && (
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                  <a
                    href={song.appleMusicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Listen to ${song.name} on Apple Music`}
                  >
                    <Music className="w-4 h-4" /> {/* Using music icon for Apple Music */}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-lg font-medium">Loading fresh Afrobeats...</p>
          <p className="text-sm text-muted-foreground mt-2">Discovering the latest releases</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
              Afropulse
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Your pulse on the freshest Afrobeats, Amapiano, and African music
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                <Music className="w-4 h-4 mr-2" />
                {newReleases.length} New Releases
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                {buzzingSongs.length} Buzzing Songs
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                <Globe className="w-4 h-4 mr-2" />
                African Focus
              </Badge>
            </div>

            {/* Newsletter Signup */}
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email for weekly digest"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:bg-white/20"
                  disabled={isSubscribing}
                />
                <Button
                  type="submit"
                  disabled={isSubscribing || !email.trim()}
                  className="bg-white text-orange-500 hover:bg-orange-50 font-semibold px-6"
                >
                  {isSubscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
              {subscriptionStatus === "success" && (
                <div className="flex items-center justify-center gap-2 mt-3 text-green-100">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Successfully subscribed!</span>
                </div>
              )}
              {subscriptionStatus === "error" && (
                <div className="flex items-center justify-center gap-2 mt-3 text-red-100">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">Subscription failed. Try again.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Data Source Info */}
      <section className="py-4 bg-white/50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Recently"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Last 7 days</span>
            </div>
            {getDataSourceBadge()}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* New Releases Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-orange-500" />
                  Fresh Releases
                </h2>
                <p className="text-muted-foreground">Latest drops from the last 7 days</p>
              </div>
              <Button variant="outline" asChild>
                <a href="/trending">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View All Trending
                </a>
              </Button>
            </div>

            {newReleases.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No New Releases</h3>
                  <p className="text-muted-foreground">Check back soon for the latest drops!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {newReleases.slice(0, 12).map(renderSongCard)}
              </div>
            )}
          </section>

          {/* Buzzing Songs Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-red-500" />
                  Buzzing Right Now
                </h2>
                <p className="text-muted-foreground">Most popular tracks across platforms</p>
              </div>
              <Button variant="outline" asChild>
                <a href="/news">
                  <Globe className="w-4 h-4 mr-2" />
                  Music News
                </a>
              </Button>
            </div>

            {buzzingSongs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Buzzing Songs</h3>
                  <p className="text-muted-foreground">Check back soon for trending tracks!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {buzzingSongs.slice(0, 12).map((song, index) => (
                  <Card
                    key={song.id}
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
                  >
                    <CardContent className="p-0">
                      <div className="relative w-full aspect-square rounded-t-lg overflow-hidden">
                        <Image
                          src={
                            song.imageUrl ||
                            `/placeholder.svg?height=300&width=300&query=${encodeURIComponent((song.artist || "unknown artist") + " " + (song.album || "unknown album") || "afrobeats music")}`
                          }
                          alt={`${song.name} by ${song.artist} album cover`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                          priority={true}
                        />
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
                          #{index + 1}
                        </Badge>
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium">{song.popularity}</span>
                        </div>
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{song.name}</h3>
                        <p className="text-muted-foreground mb-2 line-clamp-1">{song.artist}</p>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{song.album}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {song.genre}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Headphones className="w-3 h-3" />
                              {formatStreams(song.streams)}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {song.previewUrl && (
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
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
                            {song.spotifyUrl && (
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                                <a
                                  href={song.spotifyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Listen to ${song.name} on Spotify`}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            {song.audiomackUrl && (
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                                <a
                                  href={song.audiomackUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Listen to ${song.name} on Audiomack`}
                                >
                                  <Headphones className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            {song.appleMusicUrl && (
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                                <a
                                  href={song.appleMusicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Listen to ${song.name} on Apple Music`}
                                >
                                  <Music className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Features Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Afropulse?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Your one-stop destination for discovering the freshest African music
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6 bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fresh Daily Updates</h3>
                <p className="text-muted-foreground">
                  Get the latest releases within 7 days, updated daily with the freshest Afrobeats drops
                </p>
              </Card>

              <Card className="text-center p-6 bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Trending Insights</h3>
                <p className="text-muted-foreground">
                  Discover what's buzzing across social media and streaming platforms
                </p>
              </Card>

              <Card className="text-center p-6 bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Weekly Digest</h3>
                <p className="text-muted-foreground">
                  Never miss a beat with our curated weekly email featuring the best new music
                </p>
              </Card>
            </div>
          </section>

          {/* Newsletter CTA */}
          <section className="text-center">
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
                <p className="text-xl mb-8 text-orange-100">
                  Join thousands of music lovers getting their weekly Afrobeats fix
                </p>
                <div className="max-w-md mx-auto">
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:bg-white/20"
                      disabled={isSubscribing}
                    />
                    <Button
                      type="submit"
                      disabled={isSubscribing || !email.trim()}
                      className="bg-white text-orange-500 hover:bg-orange-50 font-semibold px-6"
                    >
                      {isSubscribing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Subscribe
                        </>
                      )}
                    </Button>
                  </form>
                  <p className="text-sm text-orange-100 mt-4">Free weekly digest • No spam • Unsubscribe anytime</p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}

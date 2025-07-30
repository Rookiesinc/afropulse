"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Music,
  TrendingUp,
  Calendar,
  Loader2,
  RefreshCw,
  Star,
  Play,
  Users,
  Mail,
  Search,
  Filter,
  Heart,
  Share2,
  Volume2,
  FlameIcon as Fire,
  Eye,
  ThumbsUp,
  ExternalLink,
  Activity,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

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

interface TrendingNews {
  id: string
  title: string
  summary: string
  category: string
  trendingScore: number
  viralityIndex: number
  artistMentions: string[]
  engagement: {
    views: number
    likes: number
    shares: number
  }
  publishedAt: string
  breaking: boolean
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

export default function HomePage() {
  const [newReleases, setNewReleases] = useState<Song[]>([])
  const [buzzingSongs, setBuzzingSongs] = useState<Song[]>([])
  const [trendingNews, setTrendingNews] = useState<TrendingNews[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [email, setEmail] = useState("")
  const [subscribing, setSubscribing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredReleases, setFilteredReleases] = useState<Song[]>([])
  const [filteredBuzzing, setFilteredBuzzing] = useState<Song[]>([])
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [dataSource, setDataSource] = useState<string>("")
  const [discoveredArtists, setDiscoveredArtists] = useState<number>(0)

  useEffect(() => {
    fetchData()
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterSongs()
  }, [searchQuery, selectedGenre, newReleases, buzzingSongs])

  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      const [releasesRes, buzzingRes] = await Promise.all([fetch("/api/releases"), fetch("/api/buzzing")])

      const releasesData: ApiResponse = releasesRes.ok
        ? await releasesRes.json()
        : { songs: [], dataSource: "error", timestamp: new Date().toISOString() }
      const buzzingData: ApiResponse = buzzingRes.ok
        ? await buzzingRes.json()
        : { songs: [], dataSource: "error", timestamp: new Date().toISOString() }

      setNewReleases(releasesData.songs || [])
      setBuzzingSongs(buzzingData.songs || [])
      setLastUpdated(releasesData.timestamp || new Date().toISOString())
      setDataSource(releasesData.dataSource || "unknown")
      setDiscoveredArtists(releasesData.discoveredArtists || 0)

      // Fetch trending news
      const trendingNewsData = generateTrendingNews()
      setTrendingNews(trendingNewsData)

      if (releasesData.error || buzzingData.error) {
        toast({
          title: "Data Warning",
          description: releasesData.error || buzzingData.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch latest music data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const generateTrendingNews = (): TrendingNews[] => {
    const trendingTopics = [
      {
        title: "🔥 Burna Boy's 'African Giant 2' Breaks Spotify Records in First 24 Hours",
        summary: "The Grammy winner's surprise album shatters streaming records with 50M plays in 24 hours.",
        category: "Breaking News",
        trendingScore: 98,
        viralityIndex: 95,
        artistMentions: ["Burna Boy", "Drake", "Rihanna", "Wizkid"],
        breaking: true,
      },
      {
        title: "🚨 BREAKING: Tyla Becomes First African Artist to Win Grammy for Best Pop Vocal Album",
        summary: "South African sensation Tyla makes history at the Grammy Awards.",
        category: "Awards",
        trendingScore: 96,
        viralityIndex: 92,
        artistMentions: ["Tyla"],
        breaking: true,
      },
      {
        title: "⚡ Wizkid vs Davido Twitter Space Draws 2.5 Million Listeners Live",
        summary: "The legendary rivals finally face off in a Twitter Space that crashes the platform.",
        category: "Social Media",
        trendingScore: 94,
        viralityIndex: 89,
        artistMentions: ["Wizkid", "Davido"],
        breaking: false,
      },
      {
        title: "🎵 Asake's 'Lungu Boy' Album Debuts at #1 on Billboard 200",
        summary: "The YBNL star becomes the third Nigerian artist to top the Billboard 200.",
        category: "Charts",
        trendingScore: 91,
        viralityIndex: 85,
        artistMentions: ["Asake"],
        breaking: false,
      },
      {
        title: "💥 Rema Announces $100M Deal with Universal Music Group",
        summary: "The 'Calm Down' hitmaker signs the biggest record deal in African music history.",
        category: "Industry News",
        trendingScore: 89,
        viralityIndex: 82,
        artistMentions: ["Rema"],
        breaking: false,
      },
    ]

    return trendingTopics.map((topic, i) => ({
      id: `trending-news-${i + 1}`,
      title: topic.title,
      summary: topic.summary,
      category: topic.category,
      trendingScore: topic.trendingScore,
      viralityIndex: topic.viralityIndex,
      artistMentions: topic.artistMentions,
      engagement: {
        views: Math.floor(Math.random() * 2000000) + 500000,
        likes: Math.floor(Math.random() * 100000) + 25000,
        shares: Math.floor(Math.random() * 50000) + 10000,
      },
      publishedAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
      breaking: topic.breaking,
    }))
  }

  const filterSongs = () => {
    const filterFunction = (songs: Song[]) => {
      return songs.filter((song) => {
        const matchesSearch =
          song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.album.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesGenre = selectedGenre === "all" || song.genre.toLowerCase().includes(selectedGenre.toLowerCase())

        return matchesSearch && matchesGenre
      })
    }

    setFilteredReleases(filterFunction(newReleases))
    setFilteredBuzzing(filterFunction(buzzingSongs))
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      setSubscribing(true)
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: data.message,
        })
        setEmail("")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to subscribe",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error subscribing:", error)
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubscribing(false)
    }
  }

  const handleRefresh = () => {
    fetchData(true)
  }

  const getDataSourceBadge = () => {
    const badges = {
      spotify_live: { text: "Live", color: "bg-green-500" },
      spotify_cached: { text: "Cached", color: "bg-yellow-500" },
      error: { text: "Error", color: "bg-red-500" },
      fallback: { text: "Fallback", color: "bg-gray-500" },
    }

    const badge = badges[dataSource as keyof typeof badges] || { text: "Unknown", color: "bg-gray-500" }

    return <Badge className={`${badge.color} text-white text-xs`}>{badge.text}</Badge>
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const SongCard = ({ song, index, showBuzzScore = false }: { song: Song; index: number; showBuzzScore?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                {song.name}
              </h3>
              <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                {song.artist}
                {song.isNewArtist && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    <Star className="w-3 h-3 mr-1" />
                    New
                  </Badge>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showBuzzScore && song.buzzScore && (
              <Badge variant="secondary" className="text-xs">
                {song.buzzScore}/100
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {song.popularity}%
            </Badge>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p className="truncate">
            <span className="font-medium">Album:</span> {song.album}
          </p>
          <p>
            <span className="font-medium">Released:</span> {new Date(song.releaseDate).toLocaleDateString()}
          </p>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {song.genre}
            </Badge>
            {song.streams && <span className="text-xs text-gray-500">{song.streams.toLocaleString()} streams</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            onClick={() => window.open(song.spotifyUrl, "_blank")}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-1" />
            Play on Spotify
          </Button>
          {song.previewUrl && (
            <Button size="sm" variant="outline" onClick={() => window.open(song.previewUrl, "_blank")}>
              <Volume2 className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" variant="outline">
            <Heart className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const TrendingNewsCard = ({ news }: { news: TrendingNews }) => (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {news.breaking && (
                <Badge className="bg-red-500 text-white text-xs animate-pulse">
                  <Activity className="w-3 h-3 mr-1" />
                  BREAKING
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {news.category}
              </Badge>
              <Badge className="bg-orange-500 text-white text-xs">🔥 {news.trendingScore}</Badge>
            </div>
            <CardTitle className="text-sm leading-tight hover:text-red-600 transition-colors">{news.title}</CardTitle>
          </div>
        </div>
        <CardDescription className="text-xs line-clamp-2">{news.summary}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {news.artistMentions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {news.artistMentions.slice(0, 2).map((artist) => (
                <Badge key={artist} variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  {artist}
                </Badge>
              ))}
              {news.artistMentions.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{news.artistMentions.length - 2}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(news.engagement.views)}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {formatNumber(news.engagement.likes)}
              </span>
            </div>
            <Badge className="bg-purple-100 text-purple-800 text-xs">Viral: {news.viralityIndex}%</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading the latest Afrobeats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🎵 Afropulse</h1>
              <p className="text-gray-600">
                Discover the pulse of African music • {newReleases.length + buzzingSongs.length} tracks •{" "}
                {discoveredArtists} artists
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getDataSourceBadge()}
              <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Trending News Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Fire className="w-6 h-6 text-red-500" />
              Trending Now
            </h2>
            <Button variant="outline" size="sm" onClick={() => window.open("/trending", "_blank")}>
              <ExternalLink className="w-4 h-4 mr-1" />
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingNews.slice(0, 3).map((news) => (
              <TrendingNewsCard key={news.id} news={news} />
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search songs, artists, or albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Genres</option>
                <option value="afrobeats">Afrobeats</option>
                <option value="amapiano">Amapiano</option>
                <option value="alte">Alté</option>
                <option value="highlife">Highlife</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Releases</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredReleases.length}</div>
              <p className="text-xs text-muted-foreground">
                {filteredReleases.length !== newReleases.length ? `of ${newReleases.length} total` : "tracks"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buzzing Now</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredBuzzing.length}</div>
              <p className="text-xs text-muted-foreground">
                {filteredBuzzing.length !== buzzingSongs.length ? `of ${buzzingSongs.length} total` : "tracks"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Artists</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{discoveredArtists}</div>
              <p className="text-xs text-muted-foreground">discovered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{new Date(lastUpdated).toLocaleTimeString()}</div>
              <p className="text-xs text-muted-foreground">{new Date(lastUpdated).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="releases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="releases" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              New Releases ({filteredReleases.length})
            </TabsTrigger>
            <TabsTrigger value="buzzing" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Buzzing Now ({filteredBuzzing.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="releases" className="space-y-4">
            {filteredReleases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReleases.map((song, index) => (
                  <SongCard key={song.id} song={song} index={index} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No releases found</h3>
                  <p className="text-gray-600">
                    {searchQuery || selectedGenre !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Check back later for the latest releases"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="buzzing" className="space-y-4">
            {filteredBuzzing.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBuzzing.map((song, index) => (
                  <SongCard key={song.id} song={song} index={index} showBuzzScore />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No buzzing songs found</h3>
                  <p className="text-gray-600">
                    {searchQuery || selectedGenre !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Check back later for trending tracks"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Newsletter Signup */}
        <Card className="mt-12">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="w-5 h-5" />
              Weekly Digest
            </CardTitle>
            <CardDescription>
              Get the top 20 new releases and buzzing songs delivered to your inbox every Friday
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={subscribing}>
                {subscribing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                Subscribe
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

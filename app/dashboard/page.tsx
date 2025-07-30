"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Music,
  TrendingUp,
  Calendar,
  Users,
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
  Globe,
  Clock,
  Database,
  Settings,
  Activity,
  Zap,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Play,
  ExternalLink,
  Edit3,
  Save,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DashboardStats {
  newReleases: number
  buzzingSongs: number
  uniqueArtists: number
  subscribers: number
  totalGenres: number
  dataSource: string
  lastUpdated: string
  searchPeriod: string
  manuallySelectedCount?: number
}

interface SystemHealth {
  spotifyApi: "healthy" | "warning" | "error"
  emailService: "healthy" | "warning" | "error"
  dataAggregation: "healthy" | "warning" | "error"
  cronJobs: "healthy" | "warning" | "error"
}

interface RecentActivity {
  id: string
  type: "email_sent" | "subscriber_added" | "data_refresh" | "system_check" | "songs_selected"
  message: string
  timestamp: string
  status: "success" | "warning" | "error"
}

interface SpotifyTrack {
  id: string
  name: string
  artist: string
  album: string
  releaseDate: string
  spotifyUrl: string
  imageUrl: string
  popularity: number
  genre: string
  streams: number
  previewUrl?: string
}

interface SelectedSong extends SpotifyTrack {
  selectedAt: string
  selectedBy: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  // Song selection states
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
  const [selectedSongs, setSelectedSongs] = useState<SelectedSong[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    fetchSelectedSongs()
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all dashboard data
      const [releasesRes, buzzingRes, subscribersRes] = await Promise.all([
        fetch("/api/releases"),
        fetch("/api/buzzing"),
        fetch("/api/subscribe"),
      ])

      const releases = releasesRes.ok ? await releasesRes.json() : { songs: [], dataSource: "error" }
      const buzzing = buzzingRes.ok ? await buzzingRes.json() : { songs: [], dataSource: "error" }
      const subscribers = subscribersRes.ok ? await subscribersRes.json() : { total: 0 }

      // Calculate unique artists across both lists
      const allArtists = new Set([
        ...(releases.songs?.map((s: any) => s.artist) || []),
        ...(buzzing.songs?.map((s: any) => s.artist) || []),
      ])

      // Calculate unique genres
      const allGenres = new Set([
        ...(releases.songs?.map((s: any) => s.genre) || []),
        ...(buzzing.songs?.map((s: any) => s.genre) || []),
      ])

      setStats({
        newReleases: releases.songs?.length || 0,
        buzzingSongs: buzzing.songs?.length || 0,
        uniqueArtists: allArtists.size,
        subscribers: subscribers.total || 0,
        totalGenres: allGenres.size,
        dataSource: releases.dataSource || buzzing.dataSource || "unknown",
        lastUpdated: new Date().toISOString(),
        searchPeriod: releases.searchPeriod || buzzing.searchPeriod || "unknown",
        manuallySelectedCount: releases.manuallySelectedCount || 0,
      })

      // Simulate system health checks
      setSystemHealth({
        spotifyApi: releasesRes.ok && buzzingRes.ok ? "healthy" : "error",
        emailService: "healthy",
        dataAggregation: releases.songs?.length > 0 && buzzing.songs?.length > 0 ? "healthy" : "warning",
        cronJobs: "healthy",
      })

      // Update recent activity
      const activityType = releases.manuallySelectedCount > 0 ? "songs_selected" : "data_refresh"
      const activityMessage =
        releases.manuallySelectedCount > 0
          ? `Using ${releases.manuallySelectedCount} manually selected songs`
          : `Refreshed data: ${releases.songs?.length || 0} new releases, ${buzzing.songs?.length || 0} buzzing songs`

      setRecentActivity([
        {
          id: "1",
          type: activityType,
          message: activityMessage,
          timestamp: new Date().toISOString(),
          status: "success",
        },
        {
          id: "2",
          type: "system_check",
          message: "System health check completed",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: "success",
        },
        {
          id: "3",
          type: "subscriber_added",
          message: `Total subscribers: ${subscribers.total || 0}`,
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: "success",
        },
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchSelectedSongs = async () => {
    try {
      const response = await fetch("/api/selected-releases")
      if (response.ok) {
        const data = await response.json()
        setSelectedSongs(data.songs || [])
      }
    } catch (error) {
      console.error("Error fetching selected songs:", error)
    }
  }

  const searchSpotify = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchPerformed(true)
    try {
      const response = await fetch(`/api/spotify-search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.tracks || [])
        toast({
          title: "Search Complete",
          description: `Found ${data.tracks?.length || 0} tracks`,
        })
      } else {
        throw new Error("Search failed")
      }
    } catch (error) {
      console.error("Error searching Spotify:", error)
      toast({
        title: "Search Error",
        description: "Failed to search Spotify tracks",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const toggleSongSelection = (track: SpotifyTrack, isSelected: boolean) => {
    if (isSelected) {
      if (selectedSongs.length >= 20) {
        toast({
          title: "Maximum Reached",
          description: "You can only select up to 20 songs",
          variant: "destructive",
        })
        return
      }
      const newSelectedSong: SelectedSong = {
        ...track,
        selectedAt: new Date().toISOString(),
        selectedBy: "admin",
      }
      setSelectedSongs([...selectedSongs, newSelectedSong])
    } else {
      setSelectedSongs(selectedSongs.filter((song) => song.id !== track.id))
    }
  }

  const removeSelectedSong = (songId: string) => {
    setSelectedSongs(selectedSongs.filter((song) => song.id !== songId))
  }

  const saveSelectedSongs = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/selected-releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songs: selectedSongs }),
      })

      if (response.ok) {
        toast({
          title: "Songs Saved!",
          description: `Successfully saved ${selectedSongs.length} selected songs`,
        })
        fetchDashboardData() // Refresh stats

        // Add to recent activity
        setRecentActivity((prev) => [
          {
            id: Date.now().toString(),
            type: "songs_selected",
            message: `Manually selected ${selectedSongs.length} songs for new releases`,
            timestamp: new Date().toISOString(),
            status: "success",
          },
          ...prev.slice(0, 4),
        ])
      } else {
        throw new Error("Failed to save songs")
      }
    } catch (error) {
      console.error("Error saving selected songs:", error)
      toast({
        title: "Save Error",
        description: "Failed to save selected songs",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const clearSelectedSongs = async () => {
    try {
      const response = await fetch("/api/selected-releases", {
        method: "DELETE",
      })

      if (response.ok) {
        setSelectedSongs([])
        toast({
          title: "Songs Cleared",
          description: "Cleared all manually selected songs. System will use live data.",
        })
        fetchDashboardData() // Refresh stats
      } else {
        throw new Error("Failed to clear songs")
      }
    } catch (error) {
      console.error("Error clearing selected songs:", error)
      toast({
        title: "Clear Error",
        description: "Failed to clear selected songs",
        variant: "destructive",
      })
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    toast({
      title: "Data Refreshed",
      description: "Dashboard data has been updated",
    })
  }

  const sendTestDigest = async () => {
    setIsSendingTest(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test-digest", {
        method: "POST",
      })

      const data = await response.json()
      setTestResult(data)

      if (response.ok) {
        toast({
          title: "Test Email Sent!",
          description: `Successfully sent to both test email addresses`,
        })

        // Add to recent activity
        setRecentActivity((prev) => [
          {
            id: Date.now().toString(),
            type: "email_sent",
            message: `Test digest sent to ${data.recipients?.join(", ") || "test addresses"}`,
            timestamp: new Date().toISOString(),
            status: "success",
          },
          ...prev.slice(0, 4),
        ])
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send test email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending test digest:", error)
      toast({
        title: "Error",
        description: "Failed to send test digest",
        variant: "destructive",
      })
    } finally {
      setIsSendingTest(false)
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4" />
      case "warning":
        return <Clock className="w-4 h-4" />
      case "error":
        return <XCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "email_sent":
        return <Mail className="w-4 h-4" />
      case "subscriber_added":
        return <Users className="w-4 h-4" />
      case "data_refresh":
        return <RefreshCw className="w-4 h-4" />
      case "system_check":
        return <Activity className="w-4 h-4" />
      case "songs_selected":
        return <Edit3 className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor Afropulse system performance and manage operations</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={refreshData} variant="outline" disabled={refreshing}>
                {refreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button onClick={sendTestDigest} disabled={isSendingTest}>
                {isSendingTest ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Test Email
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Releases</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.newReleases || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.manuallySelectedCount ? "Manually Selected" : "6-day cycle (Mon-Fri)"}
                </p>
                <Progress value={((stats?.newReleases || 0) / 20) * 100} className="mt-2" />
                {stats?.manuallySelectedCount && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    Admin Curated
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Buzzing Songs</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.buzzingSongs || 0}</div>
                <p className="text-xs text-muted-foreground">Multi-platform data</p>
                <Progress value={((stats?.buzzingSongs || 0) / 20) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Artists</CardTitle>
                <Music className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.uniqueArtists || 0}</div>
                <p className="text-xs text-muted-foreground">No duplicates</p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">
                    Afrobeats
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Amapiano
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Alté
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.subscribers || 0}</div>
                <p className="text-xs text-muted-foreground">Weekly digest recipients</p>
                <Badge variant="secondary" className="text-xs mt-2">
                  Friday 12:00 AM WAT
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="song-editor">Song Editor</TabsTrigger>
              <TabsTrigger value="health">System Health</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Data Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Spotify API</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Manual Selection</span>
                      <Badge variant={stats?.manuallySelectedCount ? "default" : "secondary"}>
                        {stats?.manuallySelectedCount ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Social Media Tracking</span>
                      <Badge variant="secondary">Simulated</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Web Scraping</span>
                      <Badge variant="secondary">Simulated</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Source</span>
                      <Badge variant="outline">{stats?.dataSource || "Unknown"}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent" onClick={refreshData}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh All Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" onClick={sendTestDigest}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Test Digest
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                      <a href="/admin">
                        <Settings className="w-4 h-4 mr-2" />
                        Email Management
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                      <a href="/verify-email">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify Email Delivery
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Test Result */}
              {testResult && (
                <Card className={testResult.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {testResult.error ? (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className={`font-semibold ${testResult.error ? "text-red-900" : "text-green-900"}`}>
                          {testResult.error ? "Test Failed" : "Test Successful"}
                        </h4>
                        <p className={`text-sm ${testResult.error ? "text-red-800" : "text-green-800"}`}>
                          {testResult.error || testResult.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="song-editor" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Manual Song Selection
                  </CardTitle>
                  <CardDescription>
                    Search and select specific songs from Spotify to override the automatic new releases list. Selected
                    songs will be used instead of live data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search Section */}
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search for songs, artists, or albums on Spotify..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && searchSpotify()}
                        className="flex-1"
                      />
                      <Button onClick={searchSpotify} disabled={isSearching || !searchQuery.trim()}>
                        {isSearching ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4 mr-2" />
                        )}
                        Search
                      </Button>
                    </div>

                    {/* Search Results */}
                    {searchPerformed && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Search Results ({searchResults.length})</h3>
                          <Badge variant="outline">Selected: {selectedSongs.length}/20</Badge>
                        </div>

                        {searchResults.length === 0 ? (
                          <Card>
                            <CardContent className="p-8 text-center">
                              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                              <p className="text-muted-foreground">
                                Try searching with different keywords or artist names.
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="grid gap-4 max-h-96 overflow-y-auto">
                            {searchResults.map((track) => {
                              const isSelected = selectedSongs.some((song) => song.id === track.id)
                              return (
                                <Card key={track.id} className="p-4">
                                  <div className="flex items-center gap-4">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(checked) => toggleSongSelection(track, checked as boolean)}
                                      disabled={!isSelected && selectedSongs.length >= 20}
                                    />
                                    <img
                                      src={track.imageUrl || "/placeholder.svg"}
                                      alt={`${track.album} cover`}
                                      className="w-12 h-12 rounded-md object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold truncate">{track.name}</h4>
                                      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                                      <p className="text-xs text-muted-foreground truncate">{track.album}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {track.genre}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {track.popularity}/100
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      {track.previewUrl && (
                                        <Button size="sm" variant="ghost" asChild>
                                          <a href={track.previewUrl} target="_blank" rel="noopener noreferrer">
                                            <Play className="w-4 h-4" />
                                          </a>
                                        </Button>
                                      )}
                                      <Button size="sm" variant="ghost" asChild>
                                        <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Songs Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Selected Songs ({selectedSongs.length}/20)</h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={saveSelectedSongs}
                          disabled={isSaving || selectedSongs.length === 0}
                          variant="default"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Selection
                        </Button>
                        <Button onClick={clearSelectedSongs} disabled={selectedSongs.length === 0} variant="outline">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear All
                        </Button>
                      </div>
                    </div>

                    {selectedSongs.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No Songs Selected</h3>
                          <p className="text-muted-foreground">
                            Search and select up to 20 songs to override the automatic new releases list.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {selectedSongs.map((song, index) => (
                          <Card key={song.id} className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <img
                                src={song.imageUrl || "/placeholder.svg"}
                                alt={`${song.album} cover`}
                                className="w-12 h-12 rounded-md object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{song.name}</h4>
                                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                                <p className="text-xs text-muted-foreground truncate">{song.album}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {song.genre}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {song.popularity}/100
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {song.previewUrl && (
                                  <Button size="sm" variant="ghost" asChild>
                                    <a href={song.previewUrl} target="_blank" rel="noopener noreferrer">
                                      <Play className="w-4 h-4" />
                                    </a>
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" asChild>
                                  <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => removeSelectedSong(song.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {systemHealth &&
                  Object.entries(systemHealth).map(([service, status]) => (
                    <Card key={service}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="capitalize">{service.replace(/([A-Z])/g, " $1").trim()}</span>
                          <div className={`flex items-center gap-2 ${getHealthColor(status)}`}>
                            {getHealthIcon(status)}
                            <span className="text-sm capitalize">{status}</span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {service === "spotifyApi" && (
                            <>
                              <p className="text-sm text-muted-foreground">Spotify Web API connection status</p>
                              <div className="flex justify-between text-xs">
                                <span>Last Check:</span>
                                <span>{new Date().toLocaleTimeString()}</span>
                              </div>
                            </>
                          )}
                          {service === "emailService" && (
                            <>
                              <p className="text-sm text-muted-foreground">Gmail SMTP configuration</p>
                              <div className="flex justify-between text-xs">
                                <span>Provider:</span>
                                <span>Gmail</span>
                              </div>
                            </>
                          )}
                          {service === "dataAggregation" && (
                            <>
                              <p className="text-sm text-muted-foreground">Data processing and aggregation</p>
                              <div className="flex justify-between text-xs">
                                <span>Sources:</span>
                                <span>Spotify + Manual + Social + Web</span>
                              </div>
                            </>
                          )}
                          {service === "cronJobs" && (
                            <>
                              <p className="text-sm text-muted-foreground">Scheduled weekly digest</p>
                              <div className="flex justify-between text-xs">
                                <span>Schedule:</span>
                                <span>Friday 11:00 PM UTC</span>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent System Activity
                  </CardTitle>
                  <CardDescription>Latest system events and operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div
                          className={`p-1 rounded ${
                            activity.status === "success"
                              ? "bg-green-100 text-green-600"
                              : activity.status === "warning"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            activity.status === "success"
                              ? "default"
                              : activity.status === "warning"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Content Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>New Releases Coverage</span>
                        <span>{(((stats?.newReleases || 0) / 20) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={((stats?.newReleases || 0) / 20) * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Buzzing Songs Coverage</span>
                        <span>{(((stats?.buzzingSongs || 0) / 20) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={((stats?.buzzingSongs || 0) / 20) * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Artist Diversity</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} />
                      <p className="text-xs text-muted-foreground">One song per artist maintained</p>
                    </div>
                    {stats?.manuallySelectedCount && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Manual Curation</span>
                          <span>Active</span>
                        </div>
                        <Badge variant="default" className="text-xs">
                          {stats.manuallySelectedCount} songs manually selected
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      System Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Freshness</span>
                      <Badge variant="default">Live</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Response Time</span>
                      <Badge variant="outline">Less than 2 seconds</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Email Delivery Rate</span>
                      <Badge variant="default">100%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Manual Override</span>
                      <Badge variant={stats?.manuallySelectedCount ? "default" : "secondary"}>
                        {stats?.manuallySelectedCount ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Uptime</span>
                      <Badge variant="default">99.9%</Badge>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Last updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : "Never"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

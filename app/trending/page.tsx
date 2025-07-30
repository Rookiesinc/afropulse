"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  TrendingUp,
  Hash,
  Activity,
  RefreshCw,
  Loader2,
  Search,
  Filter,
  ExternalLink,
  Heart,
  Share2,
  Eye,
  ThumbsUp,
  User,
  Zap,
  Star,
  AlertCircle,
  FlameIcon as Fire,
  Users,
  Clock,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TrendingNews {
  id: string
  title: string
  summary: string
  content: string
  author: string
  source: string
  publishedAt: string
  category: string
  tags: string[]
  imageUrl?: string
  url: string
  engagement: {
    views: number
    likes: number
    shares: number
    comments: number
  }
  sentiment: "positive" | "neutral" | "negative"
  trending: boolean
  breaking: boolean
  artistMentions: string[]
  trendingScore: number
  viralityIndex: number
}

interface SocialTrend {
  id: string
  hashtag: string
  platform: "twitter" | "instagram" | "tiktok" | "youtube"
  mentions: number
  growth: number
  sentiment: "positive" | "neutral" | "negative"
  category: string
  relatedArtists: string[]
  description: string
  trending: boolean
  viral: boolean
  peakTime: string
  engagementRate: number
}

interface ViralContent {
  id: string
  type: "video" | "post" | "challenge" | "meme"
  title: string
  creator: string
  platform: string
  views: number
  likes: number
  shares: number
  description: string
  hashtags: string[]
  artistMentions: string[]
  trending: boolean
  viralScore: number
  createdAt: string
}

interface TrendingArtist {
  id: string
  name: string
  country: string
  genre: string
  trendingReason: string
  socialMentions: number
  newsMentions: number
  streamingGrowth: number
  overallScore: number
  recentActivity: string[]
  profileImage?: string
}

export default function TrendingPage() {
  const [trendingNews, setTrendingNews] = useState<TrendingNews[]>([])
  const [socialTrends, setSocialTrends] = useState<SocialTrend[]>([])
  const [viralContent, setViralContent] = useState<ViralContent[]>([])
  const [trendingArtists, setTrendingArtists] = useState<TrendingArtist[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    fetchTrendingData()
    // Auto-refresh every 5 minutes for trending content
    const interval = setInterval(fetchTrendingData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchTrendingData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      // Generate trending news data
      const trendingNewsData = generateTrendingNews()
      setTrendingNews(trendingNewsData)

      // Generate social trends data
      const socialTrendsData = generateSocialTrends()
      setSocialTrends(socialTrendsData)

      // Generate viral content data
      const viralContentData = generateViralContent()
      setViralContent(viralContentData)

      // Generate trending artists data
      const trendingArtistsData = generateTrendingArtists()
      setTrendingArtists(trendingArtistsData)

      setLastUpdated(new Date().toISOString())

      if (showRefreshing) {
        toast({
          title: "Trending Updated",
          description: "Latest trending content has been refreshed",
        })
      }
    } catch (error) {
      console.error("Error fetching trending data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch trending data",
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
        summary:
          "The Grammy winner's surprise album shatters streaming records with 50M plays in 24 hours, featuring collaborations with Drake, Rihanna, and Wizkid.",
        category: "Breaking News",
        trendingScore: 98,
        viralityIndex: 95,
        artistMentions: ["Burna Boy", "Drake", "Rihanna", "Wizkid"],
      },
      {
        title: "🚨 BREAKING: Tyla Becomes First African Artist to Win Grammy for Best Pop Vocal Album",
        summary:
          "South African sensation Tyla makes history at the Grammy Awards, with 'Water (Deluxe)' taking home the prestigious award.",
        category: "Awards",
        trendingScore: 96,
        viralityIndex: 92,
        artistMentions: ["Tyla"],
      },
      {
        title: "⚡ Wizkid vs Davido Twitter Space Draws 2.5 Million Listeners Live",
        summary:
          "The legendary rivals finally face off in a Twitter Space that crashes the platform multiple times due to overwhelming traffic.",
        category: "Social Media",
        trendingScore: 94,
        viralityIndex: 89,
        artistMentions: ["Wizkid", "Davido"],
      },
      {
        title: "🎵 Asake's 'Lungu Boy' Album Debuts at #1 on Billboard 200",
        summary:
          "The YBNL star becomes the third Nigerian artist to top the Billboard 200, following Burna Boy and Wizkid.",
        category: "Charts",
        trendingScore: 91,
        viralityIndex: 85,
        artistMentions: ["Asake"],
      },
      {
        title: "💥 Rema Announces $100M Deal with Universal Music Group",
        summary:
          "The 'Calm Down' hitmaker signs the biggest record deal in African music history, including global distribution and marketing.",
        category: "Industry News",
        trendingScore: 89,
        viralityIndex: 82,
        artistMentions: ["Rema"],
      },
      {
        title: "🌟 Tems Collaborates with Beyoncé on New 'Renaissance' Track",
        summary:
          "The Nigerian songstress features on Beyoncé's surprise 'Renaissance Act II' album, marking another major international collaboration.",
        category: "Collaborations",
        trendingScore: 93,
        viralityIndex: 88,
        artistMentions: ["Tems", "Beyoncé"],
      },
      {
        title: "🔥 Ayra Starr's 'Rush' Hits 1 Billion Streams on Spotify",
        summary:
          "The Mavin Records star celebrates a major milestone as her breakout hit reaches 1 billion streams globally.",
        category: "Streaming",
        trendingScore: 87,
        viralityIndex: 80,
        artistMentions: ["Ayra Starr"],
      },
      {
        title: "⚡ Focalistic and DJ Maphorisa's Amapiano Track Goes Viral on TikTok",
        summary:
          "Their new collaboration 'Ke Star 2.0' sparks a massive dance challenge with over 500M views in 48 hours.",
        category: "Viral",
        trendingScore: 85,
        viralityIndex: 94,
        artistMentions: ["Focalistic", "DJ Maphorisa"],
      },
      {
        title: "🎤 Black Sherif Wins BET Award for Best International Flow",
        summary: "The Ghanaian rapper takes home the prestigious award, beating competition from across the globe.",
        category: "Awards",
        trendingScore: 83,
        viralityIndex: 75,
        artistMentions: ["Black Sherif"],
      },
      {
        title: "💫 CKay's 'Love Nwantiti' Becomes Most Streamed African Song Ever",
        summary:
          "The Nigerian hitmaker's global sensation surpasses 2.5 billion streams across all platforms, setting a new record.",
        category: "Records",
        trendingScore: 88,
        viralityIndex: 78,
        artistMentions: ["CKay"],
      },
    ]

    return trendingTopics.map((topic, i) => ({
      id: `trending-news-${i + 1}`,
      title: topic.title,
      summary: topic.summary,
      content: `${topic.summary} This breaking story continues to develop as fans and industry insiders react to this major development in African music. The impact on the global music scene is expected to be significant.`,
      author: "Trending News Team",
      source: "AfropulseTrending",
      publishedAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
      category: topic.category,
      tags: ["Trending", "African Music", ...topic.artistMentions],
      imageUrl: `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(topic.artistMentions[0] + " trending news")}`,
      url: `https://afropulse.com/trending/${topic.title.toLowerCase().replace(/\s+/g, "-")}`,
      engagement: {
        views: Math.floor(Math.random() * 2000000) + 500000,
        likes: Math.floor(Math.random() * 100000) + 25000,
        shares: Math.floor(Math.random() * 50000) + 10000,
        comments: Math.floor(Math.random() * 20000) + 5000,
      },
      sentiment: "positive" as const,
      trending: true,
      breaking: i < 3,
      artistMentions: topic.artistMentions,
      trendingScore: topic.trendingScore,
      viralityIndex: topic.viralityIndex,
    }))
  }

  const generateSocialTrends = (): SocialTrend[] => {
    const trends = [
      {
        hashtag: "#BurnaBoyAfricanGiant2",
        platform: "twitter" as const,
        mentions: 2500000,
        growth: 450,
        category: "Music Release",
        relatedArtists: ["Burna Boy"],
        description: "Fans celebrate Burna Boy's surprise album announcement",
        engagementRate: 15.2,
      },
      {
        hashtag: "#TylaGrammyWinner",
        platform: "instagram" as const,
        mentions: 1800000,
        growth: 380,
        category: "Awards",
        relatedArtists: ["Tyla"],
        description: "Historic Grammy win celebration posts flooding social media",
        engagementRate: 18.7,
      },
      {
        hashtag: "#WizkidVsDavidoSpace",
        platform: "twitter" as const,
        mentions: 3200000,
        growth: 520,
        category: "Social Media Event",
        relatedArtists: ["Wizkid", "Davido"],
        description: "Epic Twitter Space conversation breaks platform records",
        engagementRate: 22.1,
      },
      {
        hashtag: "#AsakeNumber1",
        platform: "tiktok" as const,
        mentions: 1200000,
        growth: 290,
        category: "Chart Success",
        relatedArtists: ["Asake"],
        description: "Celebration videos for Asake's Billboard #1 debut",
        engagementRate: 12.8,
      },
      {
        hashtag: "#RemaUMGDeal",
        platform: "instagram" as const,
        mentions: 950000,
        growth: 240,
        category: "Industry News",
        relatedArtists: ["Rema"],
        description: "Reactions to Rema's historic record deal announcement",
        engagementRate: 14.3,
      },
      {
        hashtag: "#TemsBeyonceCollab",
        platform: "twitter" as const,
        mentions: 1600000,
        growth: 350,
        category: "Collaboration",
        relatedArtists: ["Tems", "Beyoncé"],
        description: "Excitement over Tems and Beyoncé collaboration reveal",
        engagementRate: 16.9,
      },
      {
        hashtag: "#AyraStarr1Billion",
        platform: "instagram" as const,
        mentions: 800000,
        growth: 200,
        category: "Streaming Milestone",
        relatedArtists: ["Ayra Starr"],
        description: "Celebrating Ayra Starr's 1 billion streams milestone",
        engagementRate: 13.5,
      },
      {
        hashtag: "#KeStar2Challenge",
        platform: "tiktok" as const,
        mentions: 5000000,
        growth: 680,
        category: "Dance Challenge",
        relatedArtists: ["Focalistic", "DJ Maphorisa"],
        description: "Viral Amapiano dance challenge taking over TikTok",
        engagementRate: 25.4,
      },
      {
        hashtag: "#BlackSherifBET",
        platform: "twitter" as const,
        mentions: 700000,
        growth: 180,
        category: "Awards",
        relatedArtists: ["Black Sherif"],
        description: "Ghana celebrates Black Sherif's BET Award win",
        engagementRate: 11.7,
      },
      {
        hashtag: "#CKayRecord",
        platform: "instagram" as const,
        mentions: 600000,
        growth: 150,
        category: "Records",
        relatedArtists: ["CKay"],
        description: "Celebrating CKay's historic streaming record",
        engagementRate: 10.2,
      },
    ]

    return trends.map((trend, i) => ({
      id: `social-trend-${i + 1}`,
      hashtag: trend.hashtag,
      platform: trend.platform,
      mentions: trend.mentions,
      growth: trend.growth,
      sentiment: "positive" as const,
      category: trend.category,
      relatedArtists: trend.relatedArtists,
      description: trend.description,
      trending: true,
      viral: trend.mentions > 1000000,
      peakTime: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
      engagementRate: trend.engagementRate,
    }))
  }

  const generateViralContent = (): ViralContent[] => {
    const content = [
      {
        type: "challenge" as const,
        title: "Ke Star 2.0 Dance Challenge",
        creator: "AfricanDanceVibes",
        platform: "TikTok",
        views: 500000000,
        description: "The official dance challenge for Focalistic and DJ Maphorisa's hit",
        hashtags: ["#KeStar2Challenge", "#Amapiano", "#SouthAfrica"],
        artistMentions: ["Focalistic", "DJ Maphorisa"],
        viralScore: 98,
      },
      {
        type: "video" as const,
        title: "Burna Boy Studio Session Behind the Scenes",
        creator: "BurnaBoyOfficial",
        platform: "Instagram",
        views: 25000000,
        description: "Exclusive footage of Burna Boy creating African Giant 2",
        hashtags: ["#BurnaBoy", "#AfricanGiant2", "#StudioSession"],
        artistMentions: ["Burna Boy"],
        viralScore: 92,
      },
      {
        type: "meme" as const,
        title: "When Wizkid and Davido Finally Talk",
        creator: "NaijaMemeLord",
        platform: "Twitter",
        views: 15000000,
        description: "Hilarious memes about the historic Twitter Space",
        hashtags: ["#WizkidVsDavido", "#NaijaTwitter", "#Memes"],
        artistMentions: ["Wizkid", "Davido"],
        viralScore: 89,
      },
      {
        type: "post" as const,
        title: "Tyla's Grammy Acceptance Speech",
        creator: "TylaOfficial",
        platform: "Instagram",
        views: 30000000,
        description: "Emotional Grammy acceptance speech goes viral",
        hashtags: ["#TylaGrammy", "#SouthAfrica", "#WaterChallenge"],
        artistMentions: ["Tyla"],
        viralScore: 95,
      },
      {
        type: "video" as const,
        title: "Asake's Billboard Celebration Party",
        creator: "YBNLNation",
        platform: "YouTube",
        views: 12000000,
        description: "Asake celebrates his Billboard #1 with fans in Lagos",
        hashtags: ["#Asake", "#Billboard", "#LunguBoy"],
        artistMentions: ["Asake"],
        viralScore: 87,
      },
    ]

    return content.map((item, i) => ({
      id: `viral-content-${i + 1}`,
      type: item.type,
      title: item.title,
      creator: item.creator,
      platform: item.platform,
      views: item.views,
      likes: Math.floor(item.views * 0.08),
      shares: Math.floor(item.views * 0.02),
      description: item.description,
      hashtags: item.hashtags,
      artistMentions: item.artistMentions,
      trending: true,
      viralScore: item.viralScore,
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    }))
  }

  const generateTrendingArtists = (): TrendingArtist[] => {
    const artists = [
      {
        name: "Burna Boy",
        country: "Nigeria",
        genre: "Afrobeats",
        trendingReason: "Surprise album 'African Giant 2' breaks streaming records",
        socialMentions: 2500000,
        newsMentions: 450,
        streamingGrowth: 340,
        recentActivity: ["Released African Giant 2", "Spotify record broken", "Drake collaboration confirmed"],
      },
      {
        name: "Tyla",
        country: "South Africa",
        genre: "Amapiano",
        trendingReason: "Historic Grammy win for Best Pop Vocal Album",
        socialMentions: 1800000,
        newsMentions: 380,
        streamingGrowth: 280,
        recentActivity: ["Won Grammy Award", "Water hits 2B streams", "US tour announced"],
      },
      {
        name: "Wizkid",
        country: "Nigeria",
        genre: "Afrobeats",
        trendingReason: "Epic Twitter Space with Davido draws 2.5M listeners",
        socialMentions: 3200000,
        newsMentions: 520,
        streamingGrowth: 180,
        recentActivity: ["Twitter Space with Davido", "New album teased", "London O2 sold out"],
      },
      {
        name: "Asake",
        country: "Nigeria",
        genre: "Afrobeats",
        trendingReason: "Lungu Boy album debuts at #1 on Billboard 200",
        socialMentions: 1200000,
        newsMentions: 290,
        streamingGrowth: 250,
        recentActivity: ["Billboard #1 debut", "US tour dates added", "New music video released"],
      },
      {
        name: "Rema",
        country: "Nigeria",
        genre: "Afrobeats",
        trendingReason: "$100M Universal Music Group deal announcement",
        socialMentions: 950000,
        newsMentions: 240,
        streamingGrowth: 200,
        recentActivity: ["UMG deal signed", "Rave & Roses deluxe", "Global tour announced"],
      },
      {
        name: "Tems",
        country: "Nigeria",
        genre: "Afrobeats",
        trendingReason: "Beyoncé collaboration on Renaissance Act II",
        socialMentions: 1600000,
        newsMentions: 350,
        streamingGrowth: 220,
        recentActivity: ["Beyoncé collaboration", "Grammy nomination", "New single teased"],
      },
      {
        name: "Focalistic",
        country: "South Africa",
        genre: "Amapiano",
        trendingReason: "Ke Star 2.0 viral TikTok challenge with 500M views",
        socialMentions: 5000000,
        newsMentions: 180,
        streamingGrowth: 680,
        recentActivity: ["Viral TikTok challenge", "DJ Maphorisa collab", "International bookings surge"],
      },
      {
        name: "Ayra Starr",
        country: "Nigeria",
        genre: "Afrobeats",
        trendingReason: "Rush hits 1 billion streams milestone",
        socialMentions: 800000,
        newsMentions: 200,
        streamingGrowth: 160,
        recentActivity: ["1B streams milestone", "New album announced", "Fashion Week appearance"],
      },
      {
        name: "Black Sherif",
        country: "Ghana",
        genre: "Hip Hop",
        trendingReason: "BET Award win for Best International Flow",
        socialMentions: 700000,
        newsMentions: 180,
        streamingGrowth: 140,
        recentActivity: ["BET Award win", "Ghana homecoming", "New EP announced"],
      },
      {
        name: "CKay",
        country: "Nigeria",
        genre: "Afrobeats",
        trendingReason: "Love Nwantiti becomes most streamed African song ever",
        socialMentions: 600000,
        newsMentions: 150,
        streamingGrowth: 120,
        recentActivity: ["Streaming record broken", "Global tour extended", "New album in works"],
      },
    ]

    return artists
      .map((artist, i) => ({
        id: `trending-artist-${i + 1}`,
        name: artist.name,
        country: artist.country,
        genre: artist.genre,
        trendingReason: artist.trendingReason,
        socialMentions: artist.socialMentions,
        newsMentions: artist.newsMentions,
        streamingGrowth: artist.streamingGrowth,
        overallScore: Math.floor(artist.socialMentions / 10000 + artist.newsMentions * 2 + artist.streamingGrowth * 3),
        recentActivity: artist.recentActivity,
        profileImage: `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(artist.name + " artist photo")}`,
      }))
      .sort((a, b) => b.overallScore - a.overallScore)
  }

  const handleRefresh = () => {
    fetchTrendingData(true)
  }

  const filteredNews = trendingNews.filter((news) => {
    const matchesSearch =
      news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.artistMentions.some((artist) => artist.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      selectedCategory === "all" ||
      news.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === "breaking" && news.breaking) ||
      (selectedCategory === "viral" && news.viralityIndex > 85)

    return matchesSearch && matchesCategory
  })

  const getSentimentColor = (sentiment: "positive" | "neutral" | "negative") => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getTrendingScoreColor = (score: number) => {
    if (score >= 90) return "text-red-600 font-bold"
    if (score >= 80) return "text-orange-600 font-semibold"
    if (score >= 70) return "text-yellow-600"
    return "text-gray-600"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Loading trending content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Fire className="w-8 h-8 text-red-500" />🔥 Trending Now
              </h1>
              <p className="text-gray-600">
                Real-time trending African music content • {filteredNews.length} trending stories •{" "}
                {socialTrends.length} viral hashtags
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-red-500 text-white text-xs animate-pulse">
                <Activity className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
              <Badge variant="outline" className="text-xs">
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </Badge>
              <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search trending content, artists, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Categories</option>
                <option value="breaking">Breaking News</option>
                <option value="viral">Viral Content</option>
                <option value="awards">Awards</option>
                <option value="collaborations">Collaborations</option>
                <option value="charts">Charts</option>
                <option value="industry news">Industry News</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trending Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trending Stories</CardTitle>
              <Fire className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{filteredNews.length}</div>
              <p className="text-xs text-muted-foreground">
                {filteredNews.filter((n) => n.breaking).length} breaking news
              </p>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Viral Hashtags</CardTitle>
              <Hash className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{socialTrends.length}</div>
              <p className="text-xs text-muted-foreground">{socialTrends.filter((t) => t.viral).length} super viral</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Viral Content</CardTitle>
              <Zap className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{viralContent.length}</div>
              <p className="text-xs text-muted-foreground">
                {viralContent.filter((c) => c.viralScore > 90).length} ultra viral
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trending Artists</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{trendingArtists.length}</div>
              <p className="text-xs text-muted-foreground">
                {trendingArtists.filter((a) => a.overallScore > 1000).length} super trending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="news" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Fire className="w-4 h-4" />
              Trending News ({filteredNews.length})
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Social Trends ({socialTrends.length})
            </TabsTrigger>
            <TabsTrigger value="viral" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Viral Content ({viralContent.length})
            </TabsTrigger>
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Trending Artists ({trendingArtists.length})
            </TabsTrigger>
          </TabsList>

          {/* Trending News Tab */}
          <TabsContent value="news" className="space-y-4">
            {filteredNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((news) => (
                  <Card key={news.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {news.breaking && (
                              <Badge className="bg-red-500 text-white text-xs animate-pulse">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                BREAKING
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {news.category}
                            </Badge>
                            <Badge className={`text-xs ${getTrendingScoreColor(news.trendingScore)}`}>
                              🔥 {news.trendingScore}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg leading-tight hover:text-red-600 transition-colors">
                            {news.title}
                          </CardTitle>
                        </div>
                      </div>
                      <CardDescription className="text-sm line-clamp-2">{news.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {news.source}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(news.publishedAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        {news.artistMentions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {news.artistMentions.slice(0, 3).map((artist) => (
                              <Badge key={artist} variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                {artist}
                              </Badge>
                            ))}
                            {news.artistMentions.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{news.artistMentions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {formatNumber(news.engagement.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {formatNumber(news.engagement.likes)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="w-4 h-4" />
                              {formatNumber(news.engagement.shares)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              Viral: {news.viralityIndex}%
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => window.open(news.url, "_blank")}>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Fire className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No trending news found</h3>
                  <p className="text-gray-600">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Check back later for trending content"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Social Trends Tab */}
          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {socialTrends.map((trend) => (
                <Card key={trend.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-blue-600">{trend.hashtag}</span>
                          {trend.viral && (
                            <Badge className="bg-purple-500 text-white text-xs animate-pulse">
                              <Zap className="w-3 h-3 mr-1" />
                              VIRAL
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{trend.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className="capitalize">
                          {trend.platform}
                        </Badge>
                        <Badge className={getSentimentColor(trend.sentiment)}>{trend.sentiment}</Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{formatNumber(trend.mentions)} mentions</span>
                        <span
                          className={`flex items-center gap-1 ${trend.growth > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          <TrendingUp className={`w-4 h-4 ${trend.growth < 0 ? "rotate-180" : ""}`} />
                          {trend.growth > 0 ? "+" : ""}
                          {trend.growth.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Engagement Rate</span>
                        <span className="font-semibold text-orange-600">{trend.engagementRate}%</span>
                      </div>

                      {trend.relatedArtists.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {trend.relatedArtists.map((artist) => (
                            <Badge key={artist} variant="secondary" className="text-xs">
                              {artist}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Viral Content Tab */}
          <TabsContent value="viral" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {viralContent.map((content) => (
                <Card key={content.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {content.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {content.platform}
                          </Badge>
                          <Badge className={`text-xs ${getTrendingScoreColor(content.viralScore)}`}>
                            ⚡ {content.viralScore}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{content.title}</h3>
                        <p className="text-xs text-gray-600 mb-2">by {content.creator}</p>
                        <p className="text-sm text-gray-700">{content.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {formatNumber(content.views)} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {formatNumber(content.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-4 h-4" />
                          {formatNumber(content.shares)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Created</span>
                        <span className="text-gray-600">{new Date(content.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {content.hashtags.slice(0, 3).map((hashtag) => (
                          <Badge key={hashtag} variant="secondary" className="text-xs">
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trending Artists Tab */}
          <TabsContent value="artists" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingArtists.map((artist, index) => (
                <Card key={artist.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{artist.name}</h3>
                        <p className="text-sm text-gray-600">
                          {artist.country} • {artist.genre}
                        </p>
                        <Badge className={`text-xs mt-1 ${getTrendingScoreColor(artist.overallScore)}`}>
                          Score: {artist.overallScore}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-700 font-medium">{artist.trendingReason}</p>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{formatNumber(artist.socialMentions)}</div>
                          <div className="text-gray-500">Social</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{artist.newsMentions}</div>
                          <div className="text-gray-500">News</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">+{artist.streamingGrowth}%</div>
                          <div className="text-gray-500">Streams</div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Recent Activity:</p>
                        <div className="space-y-1">
                          {artist.recentActivity.slice(0, 3).map((activity, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
                              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                              {activity}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Live Updates Footer */}
        <Card className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500 animate-pulse" />
                <span className="font-semibold text-red-700">Live Trending Updates</span>
              </div>
              <div className="text-sm text-gray-600">
                Auto-refreshing every 5 minutes • Last update: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Real-time tracking of trending African music content across social media, news outlets, and streaming
              platforms. Content is ranked by engagement, virality, and cultural impact.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

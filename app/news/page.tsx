"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Newspaper,
  TrendingUp,
  Hash,
  Globe,
  RefreshCw,
  Loader2,
  Search,
  Filter,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  ThumbsUp,
  Calendar,
  User,
  Activity,
  Zap,
  Star,
  AlertCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface NewsArticle {
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
}

interface WebMention {
  id: string
  url: string
  title: string
  source: string
  publishedAt: string
  snippet: string
  sentiment: "positive" | "neutral" | "negative"
  relevanceScore: number
  artistMentions: string[]
  keywords: string[]
  engagement: {
    shares: number
    comments: number
    backlinks: number
  }
  category: string
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [socialTrends, setSocialTrends] = useState<SocialTrend[]>([])
  const [viralContent, setViralContent] = useState<ViralContent[]>([])
  const [webMentions, setWebMentions] = useState<WebMention[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    fetchAllData()
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchAllData, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchAllData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      const [newsRes, socialRes, webRes] = await Promise.all([
        fetch(`/api/entertainment-news?category=${selectedCategory}&limit=20`),
        fetch("/api/social-media-trends?limit=15"),
        fetch("/api/web-news-scraper?limit=20"),
      ])

      if (newsRes.ok) {
        const newsData = await newsRes.json()
        setArticles(newsData.articles || [])
      }

      if (socialRes.ok) {
        const socialData = await socialRes.json()
        setSocialTrends(socialData.trends || [])
        setViralContent(socialData.viralContent || [])
      }

      if (webRes.ok) {
        const webData = await webRes.json()
        setWebMentions(webData.mentions || [])
      }

      setLastUpdated(new Date().toISOString())

      toast({
        title: "News Updated",
        description: "Latest news and trends have been refreshed",
      })
    } catch (error) {
      console.error("Error fetching news data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch latest news data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchAllData(true)
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.artistMentions.some((artist) => artist.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      selectedCategory === "all" ||
      article.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === "breaking" && article.breaking) ||
      (selectedCategory === "trending" && article.trending)

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

  const NewsCard = ({ article }: { article: NewsArticle }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {article.breaking && (
                <Badge className="bg-red-500 text-white text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  BREAKING
                </Badge>
              )}
              {article.trending && (
                <Badge className="bg-orange-500 text-white text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  TRENDING
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {article.category}
              </Badge>
              <Badge className={`text-xs ${getSentimentColor(article.sentiment)}`}>{article.sentiment}</Badge>
            </div>
            <CardTitle className="text-lg leading-tight hover:text-orange-600 transition-colors">
              {article.title}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="text-sm line-clamp-2">{article.summary}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {article.source}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {article.artistMentions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {article.artistMentions.slice(0, 3).map((artist) => (
                <Badge key={artist} variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  {artist}
                </Badge>
              ))}
              {article.artistMentions.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{article.artistMentions.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatNumber(article.engagement.views)}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                {formatNumber(article.engagement.likes)}
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                {formatNumber(article.engagement.shares)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {formatNumber(article.engagement.comments)}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.open(article.url, "_blank")}>
              <ExternalLink className="w-4 h-4 mr-1" />
              Read More
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const TrendCard = ({ trend }: { trend: SocialTrend }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-blue-600">{trend.hashtag}</span>
              {trend.viral && (
                <Badge className="bg-purple-500 text-white text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  VIRAL
                </Badge>
              )}
              {trend.trending && (
                <Badge className="bg-orange-500 text-white text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  HOT
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
            <span className={`flex items-center gap-1 ${trend.growth > 0 ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp className={`w-4 h-4 ${trend.growth < 0 ? "rotate-180" : ""}`} />
              {trend.growth > 0 ? "+" : ""}
              {trend.growth.toFixed(1)}%
            </span>
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
  )

  const ViralContentCard = ({ content }: { content: ViralContent }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
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
              {content.trending && (
                <Badge className="bg-red-500 text-white text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  VIRAL
                </Badge>
              )}
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
  )

  const WebMentionCard = ({ mention }: { mention: WebMention }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {mention.source}
              </Badge>
              <Badge className={`text-xs ${getSentimentColor(mention.sentiment)}`}>{mention.sentiment}</Badge>
              <Badge variant="secondary" className="text-xs">
                {mention.relevanceScore.toFixed(0)}% relevant
              </Badge>
            </div>
            <h3 className="font-semibold text-sm mb-2 hover:text-orange-600 transition-colors">{mention.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{mention.snippet}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(mention.publishedAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                {mention.engagement.shares}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {mention.engagement.comments}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {mention.keywords.slice(0, 3).map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={() => window.open(mention.url, "_blank")}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading the latest news and trends...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📰 News Hub</h1>
              <p className="text-gray-600">
                Latest news, social trends, and web buzz • {articles.length} articles • {socialTrends.length} trends
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                Live Updates
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
                placeholder="Search news, artists, or topics..."
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
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="breaking">Breaking News</option>
                <option value="trending">Trending</option>
                <option value="new releases">New Releases</option>
                <option value="awards">Awards</option>
                <option value="collaborations">Collaborations</option>
                <option value="industry news">Industry News</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">News Articles</CardTitle>
              <Newspaper className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredArticles.length}</div>
              <p className="text-xs text-muted-foreground">{articles.filter((a) => a.breaking).length} breaking news</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Social Trends</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{socialTrends.length}</div>
              <p className="text-xs text-muted-foreground">{socialTrends.filter((t) => t.viral).length} viral trends</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Viral Content</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{viralContent.length}</div>
              <p className="text-xs text-muted-foreground">
                {viralContent.filter((c) => c.trending).length} trending now
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Web Mentions</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{webMentions.length}</div>
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="news" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              News ({filteredArticles.length})
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Social Trends ({socialTrends.length})
            </TabsTrigger>
            <TabsTrigger value="viral" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Viral Content ({viralContent.length})
            </TabsTrigger>
            <TabsTrigger value="web" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Web Buzz ({webMentions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-4">
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No news articles found</h3>
                  <p className="text-gray-600">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Check back later for the latest news"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {socialTrends.map((trend) => (
                <TrendCard key={trend.id} trend={trend} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="viral" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {viralContent.map((content) => (
                <ViralContentCard key={content.id} content={content} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="web" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {webMentions.map((mention) => (
                <WebMentionCard key={mention.id} mention={mention} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

import { NextResponse } from "next/server"

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

interface WebAnalytics {
  totalMentions: number
  topSources: string[]
  sentimentBreakdown: {
    positive: number
    neutral: number
    negative: number
  }
  mostMentionedArtists: Record<string, number>
  trendingKeywords: string[]
  averageRelevanceScore: number
  totalEngagement: number
}

function generateWebMentions(): WebMention[] {
  const sources = [
    "BBC News",
    "CNN",
    "Reuters",
    "Associated Press",
    "Rolling Stone",
    "Pitchfork",
    "Complex",
    "The Fader",
    "Billboard",
    "Variety",
    "Entertainment Weekly",
    "Vibe",
    "OkayAfrica",
    "NotJustOk",
    "Pulse Nigeria",
    "YNaija",
    "Music Week",
    "NME",
    "The Guardian",
    "Independent",
    "Daily Mail",
    "Mirror",
    "Metro",
    "Evening Standard",
    "AllAfrica",
    "African Business",
    "This Day Live",
    "Vanguard",
    "Premium Times",
  ]

  const africanArtists = [
    "Burna Boy",
    "Wizkid",
    "Davido",
    "Tiwa Savage",
    "Yemi Alade",
    "Asake",
    "Rema",
    "Tems",
    "Ayra Starr",
    "Fireboy DML",
    "Omah Lay",
    "Joeboy",
    "CKay",
    "Kizz Daniel",
    "Oxlade",
    "Ruger",
    "Zinoleesky",
    "Focalistic",
    "Kabza De Small",
    "DJ Maphorisa",
    "Amaarae",
    "Stonebwoy",
    "Shatta Wale",
    "Black Sherif",
    "Sarkodie",
  ]

  const categories = [
    "Music News",
    "Entertainment",
    "Culture",
    "Awards",
    "Collaborations",
    "Industry Analysis",
    "Concert Reviews",
    "Album Reviews",
    "Interviews",
    "Breaking News",
  ]

  const keywords = [
    "Afrobeats",
    "African music",
    "Nigerian music",
    "Amapiano",
    "Highlife",
    "Juju",
    "Grammy Awards",
    "BET Awards",
    "MTV EMAs",
    "streaming",
    "Billboard",
    "charts",
    "collaboration",
    "world tour",
    "album release",
    "single",
    "music video",
    "cultural impact",
    "global recognition",
    "African diaspora",
    "music industry",
  ]

  const mentionTemplates = [
    {
      title: "{artist} Dominates Global Music Charts with Latest Release",
      snippet: "The {genre} superstar continues to break barriers in international markets...",
      category: "Music News",
    },
    {
      title: "How {artist} is Reshaping the Global Music Landscape",
      snippet: "Industry experts analyze the cultural impact of {artist}'s recent success...",
      category: "Industry Analysis",
    },
    {
      title: "{artist} Concert Review: A Night of Pure {genre} Magic",
      snippet: "Last night's performance showcased why {artist} is considered one of Africa's finest...",
      category: "Concert Reviews",
    },
    {
      title: "EXCLUSIVE: {artist} Discusses Upcoming Projects and Global Expansion",
      snippet: "In a candid interview, {artist} reveals plans for international collaborations...",
      category: "Interviews",
    },
    {
      title: "{artist}'s New Album Receives Critical Acclaim Worldwide",
      snippet: "Music critics praise the innovative sound and production quality of the latest release...",
      category: "Album Reviews",
    },
    {
      title: "Breaking: {artist} Announces Major Label Deal",
      snippet: "The partnership is expected to bring {artist}'s music to even wider audiences...",
      category: "Breaking News",
    },
  ]

  return Array.from({ length: 30 }, (_, i) => {
    const template = mentionTemplates[Math.floor(Math.random() * mentionTemplates.length)]
    const artist = africanArtists[Math.floor(Math.random() * africanArtists.length)]
    const source = sources[Math.floor(Math.random() * sources.length)]
    const publishedAt = new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000) // Last 48 hours

    const title = template.title.replace(/{artist}/g, artist).replace(/{genre}/g, "Afrobeats")

    const snippet = template.snippet.replace(/{artist}/g, artist).replace(/{genre}/g, "Afrobeats")

    const relevanceScore = Math.random() * 100
    const sentiments: ("positive" | "neutral" | "negative")[] = ["positive", "neutral", "negative"]
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]

    const engagement = {
      shares: Math.floor(Math.random() * 5000) + 100,
      comments: Math.floor(Math.random() * 1000) + 20,
      backlinks: Math.floor(Math.random() * 50) + 5,
    }

    const selectedKeywords = keywords.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 3)

    return {
      id: `web-mention-${i + 1}`,
      url: `https://${source.toLowerCase().replace(/\s+/g, "")}.com/article/${title.toLowerCase().replace(/\s+/g, "-")}`,
      title,
      source,
      publishedAt: publishedAt.toISOString(),
      snippet,
      sentiment,
      relevanceScore,
      artistMentions: [artist],
      keywords: selectedKeywords,
      engagement,
      category: template.category,
    }
  }).sort((a, b) => b.relevanceScore - a.relevanceScore)
}

function calculateWebAnalytics(mentions: WebMention[]): WebAnalytics {
  const totalMentions = mentions.length

  const sourceCounts = mentions.reduce((acc: Record<string, number>, mention) => {
    acc[mention.source] = (acc[mention.source] || 0) + 1
    return acc
  }, {})

  const topSources = Object.entries(sourceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([source]) => source)

  const sentimentBreakdown = {
    positive: mentions.filter((m) => m.sentiment === "positive").length,
    neutral: mentions.filter((m) => m.sentiment === "neutral").length,
    negative: mentions.filter((m) => m.sentiment === "negative").length,
  }

  const mostMentionedArtists = mentions
    .flatMap((m) => m.artistMentions)
    .reduce((acc: Record<string, number>, artist) => {
      acc[artist] = (acc[artist] || 0) + 1
      return acc
    }, {})

  const keywordCounts = mentions
    .flatMap((m) => m.keywords)
    .reduce((acc: Record<string, number>, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1
      return acc
    }, {})

  const trendingKeywords = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([keyword]) => keyword)

  const averageRelevanceScore =
    mentions.length > 0 ? mentions.reduce((sum, m) => sum + m.relevanceScore, 0) / mentions.length : 0

  const totalEngagement = mentions.reduce(
    (sum, m) => sum + m.engagement.shares + m.engagement.comments + m.engagement.backlinks,
    0,
  )

  return {
    totalMentions,
    topSources,
    sentimentBreakdown,
    mostMentionedArtists,
    trendingKeywords,
    averageRelevanceScore: Math.round(averageRelevanceScore * 100) / 100,
    totalEngagement,
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get("source") || "all"
    const category = searchParams.get("category") || "all"
    const sentiment = searchParams.get("sentiment") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "25")

    console.log(`🌐 Fetching web mentions - Source: ${source}, Category: ${category}, Sentiment: ${sentiment}`)

    // Generate fresh web mentions data
    let mentions = generateWebMentions()

    // Apply filters
    if (source !== "all") {
      mentions = mentions.filter((mention) => mention.source.toLowerCase().includes(source.toLowerCase()))
    }

    if (category !== "all") {
      mentions = mentions.filter((mention) => mention.category.toLowerCase() === category.toLowerCase())
    }

    if (sentiment !== "all") {
      mentions = mentions.filter((mention) => mention.sentiment === sentiment)
    }

    // Apply limit
    mentions = mentions.slice(0, limit)

    // Calculate analytics
    const analytics = calculateWebAnalytics(mentions)

    console.log(`✅ Returning ${mentions.length} web mentions`)

    return NextResponse.json({
      mentions,
      analytics,
      metadata: {
        source,
        category,
        sentiment,
        limit,
        timestamp: new Date().toISOString(),
        dataSource: "web_scraping_simulation",
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Error fetching web mentions:", error)

    return NextResponse.json(
      {
        mentions: [],
        analytics: {
          totalMentions: 0,
          topSources: [],
          sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
          mostMentionedArtists: {},
          trendingKeywords: [],
          averageRelevanceScore: 0,
          totalEngagement: 0,
        },
        metadata: {
          source: "all",
          category: "all",
          sentiment: "all",
          limit: 25,
          timestamp: new Date().toISOString(),
          dataSource: "error",
          error: error.message,
        },
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"

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

interface PlatformAnalytics {
  platform: string
  totalEngagement: number
  trendingHashtags: number
  viralContent: number
  topHashtag: string
  growthRate: number
}

function generateSocialTrends(): SocialTrend[] {
  const platforms: ("twitter" | "instagram" | "tiktok" | "youtube")[] = ["twitter", "instagram", "tiktok", "youtube"]
  const categories = ["Music", "Dance", "Fashion", "Lifestyle", "News", "Entertainment", "Culture"]

  const africanArtists = [
    "Burna Boy",
    "Wizkid",
    "Davido",
    "Tiwa Savage",
    "Asake",
    "Rema",
    "Tems",
    "Ayra Starr",
    "Fireboy DML",
    "Omah Lay",
    "Joeboy",
    "CKay",
    "Kizz Daniel",
    "Focalistic",
    "Kabza De Small",
    "DJ Maphorisa",
    "Amaarae",
    "Black Sherif",
  ]

  const trendingHashtags = [
    "#Afrobeats",
    "#AfrobeatsTakeover",
    "#NaijaMusic",
    "#AmaPiano",
    "#AfricanMusic",
    "#BurnaBoyConcert",
    "#WizkidFC",
    "#DavidoWorldwide",
    "#TemsVoice",
    "#AsakeVibes",
    "#RemaRave",
    "#AyraStarrRising",
    "#FireboyDML",
    "#OmahLayMood",
    "#JoeboyEnergy",
    "#CKayLove",
    "#KizzDanielBuga",
    "#FocalisticKe",
    "#KabzaDeSmall",
    "#DJMaphorisa",
    "#AmaraaeFreaky",
    "#BlackSherifSecondSermon",
    "#AfrobeatsGlobal",
    "#NigerianMusic",
    "#SouthAfricanMusic",
    "#GhanaianMusic",
    "#AfricanPride",
    "#AfrobeatsDance",
    "#LagosNights",
    "#AccraVibes",
    "#JohannesburgScene",
    "#NairobiBeats",
    "#AfrobeatsChallenge",
    "#DanceChallenge",
    "#ViralDance",
    "#TikTokDance",
  ]

  return trendingHashtags
    .map((hashtag, i) => {
      const platform = platforms[Math.floor(Math.random() * platforms.length)]
      const category = categories[Math.floor(Math.random() * categories.length)]
      const relatedArtists = africanArtists.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1)

      const mentions = Math.floor(Math.random() * 500000) + 10000
      const growth = (Math.random() - 0.5) * 200 // -100% to +100%
      const sentiments: ("positive" | "neutral" | "negative")[] = ["positive", "neutral", "negative"]
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]

      return {
        id: `trend-${i + 1}`,
        hashtag,
        platform,
        mentions,
        growth,
        sentiment,
        category,
        relatedArtists,
        description: `Trending ${category.toLowerCase()} hashtag featuring ${relatedArtists.join(", ")} with ${mentions.toLocaleString()} mentions`,
        trending: mentions > 50000,
        viral: mentions > 200000 && growth > 50,
      }
    })
    .sort((a, b) => b.mentions - a.mentions)
}

function generateViralContent(): ViralContent[] {
  const types: ("video" | "post" | "challenge" | "meme")[] = ["video", "post", "challenge", "meme"]
  const platforms = ["TikTok", "Instagram", "Twitter", "YouTube", "Facebook"]
  const creators = [
    "AfrobeatsDaily",
    "NaijaVibesTV",
    "DanceWithAfrica",
    "MusicLoverNG",
    "AfricanPride",
    "BeatsByAfrica",
    "ViralAfrobeats",
    "TrendingNaija",
    "AfrobeatsCentral",
    "MusicMania",
  ]

  const contentTemplates = [
    {
      type: "challenge" as const,
      title: "{artist} Dance Challenge Goes Viral",
      description: "Fans recreate {artist}'s signature dance moves in viral TikTok challenge",
    },
    {
      type: "video" as const,
      title: "{artist} Behind the Scenes Studio Session",
      description: "Exclusive footage of {artist} creating their latest hit in the studio",
    },
    {
      type: "meme" as const,
      title: "When {artist} Drops a New Song",
      description: "Hilarious memes about fans' reactions to {artist}'s latest release",
    },
    {
      type: "post" as const,
      title: "{artist} Shares Personal Message with Fans",
      description: "{artist} connects with fans through heartfelt social media post",
    },
  ]

  const africanArtists = [
    "Burna Boy",
    "Wizkid",
    "Davido",
    "Tiwa Savage",
    "Asake",
    "Rema",
    "Tems",
    "Ayra Starr",
    "Fireboy DML",
    "Omah Lay",
    "Joeboy",
    "CKay",
  ]

  return Array.from({ length: 15 }, (_, i) => {
    const template = contentTemplates[Math.floor(Math.random() * contentTemplates.length)]
    const artist = africanArtists[Math.floor(Math.random() * africanArtists.length)]
    const creator = creators[Math.floor(Math.random() * creators.length)]
    const platform = platforms[Math.floor(Math.random() * platforms.length)]

    const views = Math.floor(Math.random() * 5000000) + 100000
    const likes = Math.floor(views * (Math.random() * 0.1 + 0.05)) // 5-15% of views
    const shares = Math.floor(likes * (Math.random() * 0.3 + 0.1)) // 10-40% of likes

    const title = template.title.replace(/{artist}/g, artist)
    const description = template.description.replace(/{artist}/g, artist)

    return {
      id: `viral-${i + 1}`,
      type: template.type,
      title,
      creator,
      platform,
      views,
      likes,
      shares,
      description,
      hashtags: [`#${artist.replace(/\s+/g, "")}`, "#Afrobeats", "#Viral", "#Trending"],
      artistMentions: [artist],
      trending: views > 1000000,
    }
  }).sort((a, b) => b.views - a.views)
}

function generatePlatformAnalytics(trends: SocialTrend[], viralContent: ViralContent[]): PlatformAnalytics[] {
  const platforms = ["twitter", "instagram", "tiktok", "youtube", "facebook"]

  return platforms
    .map((platform) => {
      const platformTrends = trends.filter((t) => t.platform === platform)
      const platformContent = viralContent.filter((c) => c.platform.toLowerCase() === platform)

      const totalEngagement =
        platformTrends.reduce((sum, t) => sum + t.mentions, 0) + platformContent.reduce((sum, c) => sum + c.views, 0)

      const trendingHashtags = platformTrends.filter((t) => t.trending).length
      const viralContentCount = platformContent.filter((c) => c.trending).length
      const topHashtag = platformTrends.sort((a, b) => b.mentions - a.mentions)[0]?.hashtag || ""
      const growthRate =
        platformTrends.length > 0 ? platformTrends.reduce((sum, t) => sum + t.growth, 0) / platformTrends.length : 0

      return {
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        totalEngagement,
        trendingHashtags,
        viralContent: viralContentCount,
        topHashtag,
        growthRate: Math.round(growthRate * 100) / 100,
      }
    })
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform") || "all"
    const category = searchParams.get("category") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    console.log(`📱 Fetching social media trends - Platform: ${platform}, Category: ${category}`)

    // Generate fresh social media data
    let trends = generateSocialTrends()
    let viralContent = generateViralContent()

    // Filter by platform if specified
    if (platform !== "all") {
      trends = trends.filter((trend) => trend.platform === platform.toLowerCase())
      viralContent = viralContent.filter((content) => content.platform.toLowerCase() === platform.toLowerCase())
    }

    // Filter by category if specified
    if (category !== "all") {
      trends = trends.filter((trend) => trend.category.toLowerCase() === category.toLowerCase())
    }

    // Apply limits
    trends = trends.slice(0, limit)
    viralContent = viralContent.slice(0, limit)

    // Generate platform analytics
    const platformAnalytics = generatePlatformAnalytics(trends, viralContent)

    // Calculate overall analytics
    const analytics = {
      totalTrends: trends.length,
      viralTrends: trends.filter((t) => t.viral).length,
      totalViralContent: viralContent.length,
      totalEngagement:
        trends.reduce((sum, t) => sum + t.mentions, 0) + viralContent.reduce((sum, c) => sum + c.views, 0),
      sentimentBreakdown: {
        positive: trends.filter((t) => t.sentiment === "positive").length,
        neutral: trends.filter((t) => t.sentiment === "neutral").length,
        negative: trends.filter((t) => t.sentiment === "negative").length,
      },
      topPlatforms: platformAnalytics.slice(0, 3).map((p) => p.platform),
      mostMentionedArtists: trends
        .flatMap((t) => t.relatedArtists)
        .concat(viralContent.flatMap((c) => c.artistMentions))
        .reduce((acc: Record<string, number>, artist) => {
          acc[artist] = (acc[artist] || 0) + 1
          return acc
        }, {}),
      trendingHashtags: trends
        .filter((t) => t.trending)
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 10)
        .map((t) => ({ hashtag: t.hashtag, mentions: t.mentions })),
    }

    console.log(`✅ Returning ${trends.length} social trends and ${viralContent.length} viral content items`)

    return NextResponse.json({
      trends,
      viralContent,
      platformAnalytics,
      analytics,
      metadata: {
        platform,
        category,
        limit,
        timestamp: new Date().toISOString(),
        dataSource: "live_social_simulation",
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Error fetching social media trends:", error)

    return NextResponse.json(
      {
        trends: [],
        viralContent: [],
        platformAnalytics: [],
        analytics: {
          totalTrends: 0,
          viralTrends: 0,
          totalViralContent: 0,
          totalEngagement: 0,
          sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
          topPlatforms: [],
          mostMentionedArtists: {},
          trendingHashtags: [],
        },
        metadata: {
          platform: "all",
          category: "all",
          limit: 20,
          timestamp: new Date().toISOString(),
          dataSource: "error",
          error: error.message,
        },
      },
      { status: 500 },
    )
  }
}

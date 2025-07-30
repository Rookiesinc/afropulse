import { NextResponse } from "next/server"

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

// Simulated real-time news data
function generateRecentNews(): NewsArticle[] {
  const now = new Date()
  const sources = [
    "BBC Africa",
    "CNN Entertainment",
    "Rolling Stone",
    "Pitchfork",
    "Complex",
    "The Fader",
    "OkayAfrica",
    "NotJustOk",
    "Pulse Nigeria",
    "YNaija",
    "Music Week",
    "Billboard",
    "Variety",
    "Entertainment Weekly",
    "Vibe",
    "XXL Magazine",
    "HipHopDX",
    "Rap-Up",
    "AllHipHop",
    "Hot New Hip Hop",
  ]

  const categories = [
    "Breaking News",
    "New Releases",
    "Awards",
    "Collaborations",
    "Trending",
    "Industry News",
    "Artist Spotlight",
    "Album Reviews",
    "Concert News",
    "Social Media Buzz",
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
    "Nasty C",
    "Cassper Nyovest",
    "AKA",
    "Master KG",
    "Nomcebo Zikode",
  ]

  const newsTemplates = [
    {
      title: "{artist} Announces Surprise Album Release for {month}",
      summary: "The {genre} superstar reveals plans for a new project featuring international collaborations.",
      category: "New Releases",
      trending: true,
      breaking: false,
    },
    {
      title: "BREAKING: {artist} Wins {award} at International Music Awards",
      summary: "The Nigerian artist takes home the prestigious award, marking a historic moment for African music.",
      category: "Breaking News",
      trending: true,
      breaking: true,
    },
    {
      title: "{artist} Collaborates with {artist2} on Upcoming Single",
      summary: "Two of Africa's biggest stars team up for what promises to be the song of the year.",
      category: "Collaborations",
      trending: true,
      breaking: false,
    },
    {
      title: "{artist}'s Latest Track Hits 100 Million Streams on Spotify",
      summary: "The {genre} hit continues to dominate streaming platforms worldwide.",
      category: "Trending",
      trending: true,
      breaking: false,
    },
    {
      title: "{artist} Announces World Tour Including Major US Cities",
      summary: "The tour will span 6 months and include stops in New York, Los Angeles, London, and more.",
      category: "Concert News",
      trending: false,
      breaking: false,
    },
    {
      title: "Industry Report: Afrobeats Revenue Increases by 300% This Year",
      summary: "New data shows unprecedented growth in African music consumption globally.",
      category: "Industry News",
      trending: true,
      breaking: false,
    },
    {
      title: "{artist} Responds to Social Media Controversy",
      summary: "The artist addresses recent online discussions about their latest statements.",
      category: "Social Media Buzz",
      trending: true,
      breaking: false,
    },
    {
      title: "Album Review: {artist}'s '{album}' Sets New Standards for {genre}",
      summary: "Critics praise the innovative sound and production quality of the latest release.",
      category: "Album Reviews",
      trending: false,
      breaking: false,
    },
  ]

  const awards = ["Grammy", "BET Award", "MTV EMA", "MOBO Award", "Headies Award", "AFRIMA", "SAMA"]
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const albums = [
    "Rhythm & Soul",
    "African Giant",
    "Made in Lagos",
    "Love Damini",
    "Rave & Roses",
    "Apollo",
    "Golden",
    "19 & Dangerous",
  ]

  return Array.from({ length: 25 }, (_, i) => {
    const template = newsTemplates[Math.floor(Math.random() * newsTemplates.length)]
    const artist = africanArtists[Math.floor(Math.random() * africanArtists.length)]
    const artist2 = africanArtists.filter((a) => a !== artist)[Math.floor(Math.random() * (africanArtists.length - 1))]
    const source = sources[Math.floor(Math.random() * sources.length)]
    const award = awards[Math.floor(Math.random() * awards.length)]
    const month = months[Math.floor(Math.random() * months.length)]
    const album = albums[Math.floor(Math.random() * albums.length)]

    const publishedAt = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000) // Last 24 hours

    const title = template.title
      .replace(/{artist}/g, artist)
      .replace(/{artist2}/g, artist2)
      .replace(/{award}/g, award)
      .replace(/{month}/g, month)
      .replace(/{album}/g, album)
      .replace(/{genre}/g, "Afrobeats")

    const summary = template.summary
      .replace(/{artist}/g, artist)
      .replace(/{artist2}/g, artist2)
      .replace(/{award}/g, award)
      .replace(/{month}/g, month)
      .replace(/{album}/g, album)
      .replace(/{genre}/g, "Afrobeats")

    const engagement = {
      views: Math.floor(Math.random() * 500000) + 10000,
      likes: Math.floor(Math.random() * 25000) + 500,
      shares: Math.floor(Math.random() * 5000) + 100,
      comments: Math.floor(Math.random() * 2000) + 50,
    }

    const sentiments: ("positive" | "neutral" | "negative")[] = ["positive", "neutral", "negative"]
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]

    return {
      id: `news-${i + 1}`,
      title,
      summary,
      content: `${summary} This story is developing and we will continue to provide updates as more information becomes available. The African music industry continues to show remarkable growth and international recognition.`,
      author: `${source} Staff`,
      source,
      publishedAt: publishedAt.toISOString(),
      category: template.category,
      tags: ["Afrobeats", "African Music", artist, "Entertainment"],
      imageUrl: `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(artist + " music news")}`,
      url: `https://${source.toLowerCase().replace(/\s+/g, "")}.com/news/${title.toLowerCase().replace(/\s+/g, "-")}`,
      engagement,
      sentiment,
      trending: template.trending,
      breaking: template.breaking,
      artistMentions: [artist, ...(artist2 ? [artist2] : [])],
    }
  }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    console.log(`📰 Fetching entertainment news - Category: ${category}, Limit: ${limit}`)

    // Generate fresh news data
    let articles = generateRecentNews()

    // Filter by category if specified
    if (category !== "all") {
      articles = articles.filter(
        (article) =>
          article.category.toLowerCase() === category.toLowerCase() ||
          (category === "breaking" && article.breaking) ||
          (category === "trending" && article.trending),
      )
    }

    // Apply limit
    articles = articles.slice(0, limit)

    // Calculate analytics
    const analytics = {
      totalArticles: articles.length,
      breakingNews: articles.filter((a) => a.breaking).length,
      trendingStories: articles.filter((a) => a.trending).length,
      totalEngagement: articles.reduce((sum, a) => sum + a.engagement.views, 0),
      sentimentBreakdown: {
        positive: articles.filter((a) => a.sentiment === "positive").length,
        neutral: articles.filter((a) => a.sentiment === "neutral").length,
        negative: articles.filter((a) => a.sentiment === "negative").length,
      },
      topSources: [...new Set(articles.map((a) => a.source))].slice(0, 5),
      mostMentionedArtists: articles
        .flatMap((a) => a.artistMentions)
        .reduce((acc: Record<string, number>, artist) => {
          acc[artist] = (acc[artist] || 0) + 1
          return acc
        }, {}),
      categoriesCount: articles.reduce((acc: Record<string, number>, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1
        return acc
      }, {}),
    }

    console.log(`✅ Returning ${articles.length} news articles`)

    return NextResponse.json({
      articles,
      analytics,
      metadata: {
        category,
        limit,
        timestamp: new Date().toISOString(),
        dataSource: "live_simulation",
        lastUpdated: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Error fetching entertainment news:", error)

    return NextResponse.json(
      {
        articles: [],
        analytics: {
          totalArticles: 0,
          breakingNews: 0,
          trendingStories: 0,
          totalEngagement: 0,
          sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
          topSources: [],
          mostMentionedArtists: {},
          categoriesCount: {},
        },
        metadata: {
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

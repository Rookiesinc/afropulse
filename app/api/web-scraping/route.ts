import { NextResponse } from "next/server"

interface WebMentionData {
  source: string
  artist: string
  song: string
  title: string
  url: string
  publishedDate: string
  sentiment: number
  relevanceScore: number
  category: string
}

// Simulate web scraping from music blogs and news sites
async function scrapeAfrobeatsBlog(): Promise<WebMentionData[]> {
  // In production, use web scraping libraries like Puppeteer or Cheerio
  const mockBlogData: WebMentionData[] = [
    {
      source: 'NotJustOk',
      artist: 'Burna Boy',
      song: 'Last Last',
      title: 'Burna Boy\'s "Last Last" Continues to Dominate Charts',
      url: 'https://notjustok.com/news/burna-boy-last-last-charts',
      publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 0.89,
      relevanceScore: 95,
      category: 'review'
    },
    {
      source: 'Pulse Nigeria',
      artist: 'Tyla',
      song: 'Water',
      title: 'Tyla\'s "Water" Makes Waves Internationally',
      url: 'https://pulse.ng/entertainment/music/tyla-water-international',
      publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 0.92,
      relevanceScore: 98,
      category: 'news'
    },
    {
      source: '360Nobs',
      artist: 'Asake',
      song: 'Joha',
      title: 'Asake\'s "Joha" Shows His Artistic Growth',
      url: 'https://360nobs.com/2024/01/asake-joha-review',
      publishedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 0.85,
      relevanceScore: 87,
      category: 'review'
    }
  ]
  
  return mockBlogData
}

// Simulate scraping from international music publications
async function scrapeInternationalPress(): Promise<WebMentionData[]> {
  const mockInternationalData: WebMentionData[] = [
    {
      source: 'Pitchfork',
      artist: 'Rema',
      song: 'Calm Down',
      title: 'Rema\'s Global Success with "Calm Down"',
      url: 'https://pitchfork.com/reviews/albums/rema-calm-down',
      publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 0.88,
      relevanceScore: 96,
      category: 'international'
    },
    {
      source: 'Rolling Stone',
      artist: 'Wizkid',
      song: 'Essence',
      title: 'How Wizkid\'s "Essence" Changed Afrobeats Forever',
      url: 'https://rollingstone.com/music/wizkid-essence-impact',
      publishedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 0.94,
      relevanceScore: 99,
      category: 'international'
    }
  ]
  
  return mockInternationalData
}

// Simulate scraping from radio station websites
async function scrapeRadioCharts(): Promise<WebMentionData[]> {
  const mockRadioData: WebMentionData[] = [
    {
      source: 'Beat FM Lagos',
      artist: 'Ayra Starr',
      song: 'Rush',
      title: 'Ayra Starr\'s "Rush" Tops Beat FM Charts',
      url: 'https://beatfm.ng/charts/ayra-starr-rush',
      publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 0.91,
      relevanceScore: 89,
      category: 'radio'
    },
    {
      source: 'Cool FM',
      artist: 'Davido',
      song: 'Unavailable',
      title: 'Davido\'s "Unavailable" Heavy Rotation on Cool FM',
      url: 'https://coolfm.ng/playlist/davido-unavailable',
      publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 0.86,
      relevanceScore: 92,
      category: 'radio'
    }
  ]
  
  return mockRadioData
}

export async function GET() {
  try {
    // Scrape data from multiple web sources
    const [blogData, internationalData, radioData] = await Promise.all([
      scrapeAfrobeatsBlog(),
      scrapeInternationalPress(),
      scrapeRadioCharts()
    ])
    
    // Combine all web mention data
    const allWebData = [...blogData, ...internationalData, ...radioData]
    
    // Aggregate mentions by artist/song to avoid duplicates
    const aggregatedMentions = allWebData.reduce((acc, mention) => {
      const key = `${mention.artist.toLowerCase().trim()}-${mention.song.toLowerCase().trim()}`
      
      if (!acc[key]) {
        acc[key] = {
          artist: mention.artist,
          song: mention.song,
          mentions: [],
          totalRelevanceScore: 0,
          avgSentiment: 0,
          sources: new Set<string>(),
          categories: new Set<string>(),
          sentimentSum: 0,
          mentionCount: 0
        }
      }
      
      acc[key].mentions.push(mention)
      acc[key].totalRelevanceScore += mention.relevanceScore
      acc[key].sentimentSum += mention.sentiment
      acc[key].mentionCount += 1
      acc[key].avgSentiment = acc[key].sentimentSum / acc[key].mentionCount
      acc[key].sources.add(mention.source)
      acc[key].categories.add(mention.category)
      
      return acc
    }, {} as any)
    
    // Convert to array and calculate web buzz scores
    const webBuzzRanking = Object.values(aggregatedMentions)
      .map((item: any) => ({
        artist: item.artist,
        song: item.song,
        mentionCount: item.mentionCount,
        sources: Array.from(item.sources),
        categories: Array.from(item.categories),
        avgSentiment: item.avgSentiment,
        avgRelevanceScore: item.totalRelevanceScore / item.mentionCount,
        webBuzzScore: Math.round(
          (item.mentionCount * 20) * 0.4 +
          (item.totalRelevanceScore / item.mentionCount) * 0.4 +
          item.avgSentiment * 100 * 0.2
        ),
        recentMentions: item.mentions
          .sort((a: any, b: any) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
          .slice(0, 3),
        lastUpdated: new Date().toISOString()
      }))
      .sort((a: any, b: any) => b.webBuzzScore - a.webBuzzScore)

    // Ensure only one song per artist (keep highest web buzz score)
    const artistMap = new Map<string, any>()
    webBuzzRanking.forEach((item: any) => {
      const artistKey = item.artist.toLowerCase().trim()
      const existing = artistMap.get(artistKey)
      
      if (!existing || item.webBuzzScore > existing.webBuzzScore) {
        artistMap.set(artistKey, item)
      }
    })

    const deduplicatedWebBuzzRanking = Array.from(artistMap.values())
      .sort((a: any, b: any) => b.webBuzzScore - a.webBuzzScore)

    return NextResponse.json({
      webBuzz: deduplicatedWebBuzzRanking,
      lastUpdated: new Date().toISOString(),
      sources: ["NotJustOk", "Pulse Nigeria", "360Nobs", "Pitchfork", "Rolling Stone", "Beat FM Lagos", "Cool FM"],
      categories: ["review", "news", "international", "radio"],
      total: deduplicatedWebBuzzRanking.length
    })
    
  } catch (error) {
    console.error("Error scraping web data:", error)
    return NextResponse.json(
      { error: "Failed to scrape web data" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"

interface SocialBuzzData {
  platform: string
  artist: string
  song: string
  mentions: number
  sentiment: number
  hashtags: string[]
  engagement: number
  trendingScore: number
  lastUpdated: string
}

interface TwitterMention {
  id: string
  text: string
  author: string
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
  }
  hashtags: string[]
}

// Simulate Twitter API v2 integration (replace with real API calls)
async function fetchTwitterBuzz(): Promise<SocialBuzzData[]> {
  // In production, use Twitter API v2
  const afrobeatsHashtags = [
    '#afrobeats', '#burnaboy', '#davido', '#wizkid', '#rema', '#tems', 
    '#ayrastarr', '#asake', '#tyla', '#amapiano', '#naija', '#afrobeat'
  ]
  
  const mockTwitterData: SocialBuzzData[] = [
    {
      platform: 'twitter',
      artist: 'Burna Boy',
      song: 'Last Last',
      mentions: 15420,
      sentiment: 0.85,
      hashtags: ['#burnaboy', '#lastlast', '#afrobeats'],
      engagement: 89500,
      trendingScore: 94,
      lastUpdated: new Date().toISOString()
    },
    {
      platform: 'twitter',
      artist: 'Tyla',
      song: 'Water',
      mentions: 18750,
      sentiment: 0.92,
      hashtags: ['#tyla', '#water', '#amapiano'],
      engagement: 125000,
      trendingScore: 98,
      lastUpdated: new Date().toISOString()
    },
    {
      platform: 'twitter',
      artist: 'Rema',
      song: 'Calm Down',
      mentions: 22100,
      sentiment: 0.88,
      hashtags: ['#rema', '#calmdown', '#afrobeats'],
      engagement: 156000,
      trendingScore: 96,
      lastUpdated: new Date().toISOString()
    },
    {
      platform: 'twitter',
      artist: 'Asake',
      song: 'Joha',
      mentions: 12340,
      sentiment: 0.79,
      hashtags: ['#asake', '#joha', '#afrobeats'],
      engagement: 67800,
      trendingScore: 87,
      lastUpdated: new Date().toISOString()
    },
    {
      platform: 'twitter',
      artist: 'Ayra Starr',
      song: 'Rush',
      mentions: 14200,
      sentiment: 0.91,
      hashtags: ['#ayrastarr', '#rush', '#afrobeats'],
      engagement: 78900,
      trendingScore: 89,
      lastUpdated: new Date().toISOString()
    }
  ]
  
  return mockTwitterData
}

// Simulate Instagram Graph API integration
async function fetchInstagramBuzz(): Promise<SocialBuzzData[]> {
  const mockInstagramData: SocialBuzzData[] = [
    {
      platform: 'instagram',
      artist: 'Davido',
      song: 'Unavailable',
      mentions: 8750,
      sentiment: 0.83,
      hashtags: ['#davido', '#unavailable', '#afrobeats'],
      engagement: 45600,
      trendingScore: 85,
      lastUpdated: new Date().toISOString()
    },
    {
      platform: 'instagram',
      artist: 'Tems',
      song: 'Free Mind',
      mentions: 11200,
      sentiment: 0.89,
      hashtags: ['#tems', '#freemind', '#alte'],
      engagement: 62300,
      trendingScore: 88,
      lastUpdated: new Date().toISOString()
    },
    {
      platform: 'instagram',
      artist: 'Oxlade',
      song: 'Ku Lo Sa',
      mentions: 6800,
      sentiment: 0.82,
      hashtags: ['#oxlade', '#kulosa', '#afrobeats'],
      engagement: 38900,
      trendingScore: 81,
      lastUpdated: new Date().toISOString()
    }
  ]
  
  return mockInstagramData
}

// Simulate TikTok trending data
async function fetchTikTokBuzz(): Promise<SocialBuzzData[]> {
  const mockTikTokData: SocialBuzzData[] = [
    {
      platform: 'tiktok',
      artist: 'CKay',
      song: 'Love Nwantiti',
      mentions: 45000,
      sentiment: 0.94,
      hashtags: ['#ckay', '#lovenwa', '#afrobeats'],
      engagement: 2100000,
      trendingScore: 99,
      lastUpdated: new Date().toISOString()
    },
    {
      platform: 'tiktok',
      artist: 'Kizz Daniel',
      song: 'Buga',
      mentions: 38900,
      sentiment: 0.91,
      hashtags: ['#kizzdaniel', '#buga', '#afrobeats'],
      engagement: 1850000,
      trendingScore: 97,
      lastUpdated: new Date().toISOString()
    },
    {
      platform: 'tiktok',
      artist: 'Fireboy DML',
      song: 'Peru',
      mentions: 28700,
      sentiment: 0.87,
      hashtags: ['#fireboy', '#peru', '#afrobeats'],
      engagement: 1320000,
      trendingScore: 93,
      lastUpdated: new Date().toISOString()
    }
  ]
  
  return mockTikTokData
}

// Simulate YouTube trending data
async function fetchYouTubeBuzz(): Promise<SocialBuzzData[]> {
  const mockYouTubeData: SocialBuzzData[] = [
    {
      platform: 'youtube',
      artist: 'Wizkid',
      song: 'Essence',
      mentions: 15600,
      sentiment: 0.90,
      hashtags: ['#wizkid', '#essence', '#afrobeats'],
      engagement: 890000,
      trendingScore: 95,
      lastUpdated: new Date().toISOString()
    },
    {
      platform: 'youtube',
      artist: 'Burna Boy',
      song: 'Ye',
      mentions: 12800,
      sentiment: 0.86,
      hashtags: ['#burnaboy', '#ye', '#afrobeats'],
      engagement: 720000,
      trendingScore: 91,
      lastUpdated: new Date().toISOString()
    }
  ]
  
  return mockYouTubeData
}

export async function GET() {
  try {
    // Fetch social buzz data from all platforms
    const [twitterBuzz, instagramBuzz, tiktokBuzz, youtubeBuzz] = await Promise.all([
      fetchTwitterBuzz(),
      fetchInstagramBuzz(),
      fetchTikTokBuzz(),
      fetchYouTubeBuzz()
    ])
    
    // Combine all social data
    const allSocialData = [...twitterBuzz, ...instagramBuzz, ...tiktokBuzz, ...youtubeBuzz]
    
    // Aggregate data by artist/song combination to avoid duplicates
    const aggregatedBuzz = allSocialData.reduce((acc, item) => {
      const key = `${item.artist.toLowerCase().trim()}-${item.song.toLowerCase().trim()}`
      
      if (!acc[key]) {
        acc[key] = {
          artist: item.artist,
          song: item.song,
          platforms: [],
          totalMentions: 0,
          totalEngagement: 0,
          avgSentiment: 0,
          allHashtags: new Set<string>(),
          maxTrendingScore: 0,
          sentimentSum: 0,
          platformCount: 0
        }
      }
      
      acc[key].platforms.push(item.platform)
      acc[key].totalMentions += item.mentions
      acc[key].totalEngagement += item.engagement
      acc[key].sentimentSum += item.sentiment
      acc[key].platformCount += 1
      acc[key].avgSentiment = acc[key].sentimentSum / acc[key].platformCount
      acc[key].maxTrendingScore = Math.max(acc[key].maxTrendingScore, item.trendingScore)
      
      item.hashtags.forEach(tag => acc[key].allHashtags.add(tag))
      
      return acc
    }, {} as any)
    
    // Convert to array and calculate final buzz scores
    const buzzRanking = Object.values(aggregatedBuzz)
      .map((item: any) => ({
        artist: item.artist,
        song: item.song,
        platforms: item.platforms,
        totalMentions: item.totalMentions,
        totalEngagement: item.totalEngagement,
        avgSentiment: item.avgSentiment,
        hashtags: Array.from(item.allHashtags),
        trendingScore: item.maxTrendingScore,
        buzzScore: Math.round(
          (item.totalMentions / 1000) * 0.3 +
          (item.totalEngagement / 10000) * 0.4 +
          item.avgSentiment * 100 * 0.3
        ),
        platformCount: item.platformCount,
        lastUpdated: new Date().toISOString()
      }))
      .sort((a: any, b: any) => b.buzzScore - a.buzzScore)

    // Ensure only one song per artist (keep highest buzz score)
    const artistMap = new Map<string, any>()
    buzzRanking.forEach((item: any) => {
      const artistKey = item.artist.toLowerCase().trim()
      const existing = artistMap.get(artistKey)
      
      if (!existing || item.buzzScore > existing.buzzScore) {
        artistMap.set(artistKey, item)
      }
    })

    const deduplicatedBuzzRanking = Array.from(artistMap.values())
      .sort((a: any, b: any) => b.buzzScore - a.buzzScore)

    return NextResponse.json({
      socialBuzz: deduplicatedBuzzRanking,
      lastUpdated: new Date().toISOString(),
      platforms: ["twitter", "instagram", "tiktok", "youtube"],
      total: deduplicatedBuzzRanking.length,
      topHashtags: getTopHashtags(deduplicatedBuzzRanking)
    })
    
  } catch (error) {
    console.error("Error fetching social buzz data:", error)
    return NextResponse.json(
      { error: "Failed to fetch social buzz data" },
      { status: 500 }
    )
  }
}

function getTopHashtags(buzzData: any[]): string[] {
  const hashtagCount = new Map<string, number>()
  
  buzzData.forEach(item => {
    item.hashtags.forEach((tag: string) => {
      hashtagCount.set(tag, (hashtagCount.get(tag) || 0) + 1)
    })
  })
  
  return Array.from(hashtagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag)
}

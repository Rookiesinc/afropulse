import { NextResponse } from "next/server"

interface AggregatedSong {
  id: string
  name: string
  artist: string
  album: string
  releaseDate: string
  spotifyUrl: string
  imageUrl: string
  popularity: number
  genre: string
  streams?: number
  buzzScore?: number
  webMentions?: number
  socialSentiment?: number
}

export async function GET() {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
    
    // Fetch data from all sources
    const [spotifyReleases, spotifyBuzzing, webBuzz] = await Promise.all([
      fetch(`${baseUrl}/api/releases`).then(res => res.ok ? res.json() : { songs: [] }),
      fetch(`${baseUrl}/api/buzzing`).then(res => res.ok ? res.json() : { songs: [] }),
      fetch(`${baseUrl}/api/web-buzz`).then(res => res.ok ? res.json() : { buzzData: [] })
    ])
    
    // Enhance Spotify data with web buzz data
    const enhancedReleases = spotifyReleases.songs?.map((song: AggregatedSong) => {
      const webData = webBuzz.buzzData?.find((buzz: any) => 
        buzz.artist.toLowerCase().includes(song.artist.toLowerCase().split(' ')[0]) ||
        buzz.song.toLowerCase().includes(song.name.toLowerCase())
      )
      
      return {
        ...song,
        webMentions: webData?.totalMentions || 0,
        socialSentiment: webData?.avgSentiment || 0,
        buzzScore: webData ? Math.round((song.popularity * 0.6) + (webData.buzzScore * 0.4)) : song.popularity
      }
    }) || []
    
    const enhancedBuzzing = spotifyBuzzing.songs?.map((song: AggregatedSong) => {
      const webData = webBuzz.buzzData?.find((buzz: any) => 
        buzz.artist.toLowerCase().includes(song.artist.toLowerCase().split(' ')[0]) ||
        buzz.song.toLowerCase().includes(song.name.toLowerCase())
      )
      
      return {
        ...song,
        webMentions: webData?.totalMentions || 0,
        socialSentiment: webData?.avgSentiment || 0,
        buzzScore: webData ? 
          Math.round((song.buzzScore || song.popularity) * 0.5 + webData.buzzScore * 0.5) : 
          song.buzzScore || song.popularity
      }
    }) || []
    
    return NextResponse.json({
      releases: {
        songs: enhancedReleases,
        total: enhancedReleases.length,
        lastUpdated: new Date().toISOString()
      },
      buzzing: {
        songs: enhancedBuzzing.sort((a: AggregatedSong, b: AggregatedSong) => 
          (b.buzzScore || 0) - (a.buzzScore || 0)
        ),
        total: enhancedBuzzing.length,
        lastUpdated: new Date().toISOString()
      },
      webBuzz: webBuzz.buzzData || [],
      aggregationComplete: true,
      sources: ["spotify", "twitter", "instagram", "youtube"]
    })
    
  } catch (error) {
    console.error("Error aggregating data:", error)
    return NextResponse.json(
      { error: "Failed to aggregate data from all sources" },
      { status: 500 }
    )
  }
}

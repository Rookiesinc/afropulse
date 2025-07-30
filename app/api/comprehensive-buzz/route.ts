import { NextResponse } from "next/server"

interface ComprehensiveSong {
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
  
  // Social media metrics
  socialBuzzScore: number
  totalMentions: number
  socialSentiment: number
  platforms: string[]
  hashtags: string[]
  
  // Web presence metrics
  webBuzzScore: number
  webMentions: number
  webSentiment: number
  webSources: string[]
  
  // Combined metrics
  overallBuzzScore: number
  trendingVelocity: number
  crossPlatformReach: number
}

function createUniqueKey(artist: string, song: string): string {
  return `${artist.toLowerCase().trim().replace(/[^a-z0-9]/g, '')}-${song.toLowerCase().trim().replace(/[^a-z0-9]/g, '')}`
}

function findBestMatch(targetArtist: string, targetSong: string, dataArray: any[]): any {
  const targetKey = createUniqueKey(targetArtist, targetSong)
  
  // First try exact match
  let match = dataArray.find(item => {
    const itemKey = createUniqueKey(item.artist || item.name, item.song || item.name)
    return itemKey === targetKey
  })
  
  if (match) return match
  
  // Try partial artist match
  const targetArtistClean = targetArtist.toLowerCase().trim()
  match = dataArray.find(item => {
    const itemArtist = (item.artist || '').toLowerCase().trim()
    return itemArtist.includes(targetArtistClean) || targetArtistClean.includes(itemArtist)
  })
  
  if (match) return match
  
  // Try partial song match
  const targetSongClean = targetSong.toLowerCase().trim()
  match = dataArray.find(item => {
    const itemSong = (item.song || item.name || '').toLowerCase().trim()
    return itemSong.includes(targetSongClean) || targetSongClean.includes(itemSong)
  })
  
  return match
}

export async function GET() {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
    
    // Fetch data from all sources
    const [spotifyBuzzing, socialBuzz, webBuzz] = await Promise.all([
      fetch(`${baseUrl}/api/buzzing`).then(res => res.ok ? res.json() : { songs: [] }),
      fetch(`${baseUrl}/api/social-buzz`).then(res => res.ok ? res.json() : { socialBuzz: [] }),
      fetch(`${baseUrl}/api/web-scraping`).then(res => res.ok ? res.json() : { webBuzz: [] })
    ])
    
    const spotifySongs = spotifyBuzzing.songs || []
    const socialData = socialBuzz.socialBuzz || []
    const webData = webBuzz.webBuzz || []
    
    // Create comprehensive song objects with deduplication
    const songMap = new Map<string, ComprehensiveSong>()
    
    // Start with Spotify data as the base
    spotifySongs.forEach((song: any) => {
      const key = createUniqueKey(song.artist, song.name)
      
      songMap.set(key, {
        id: song.id,
        name: song.name,
        artist: song.artist,
        album: song.album,
        releaseDate: song.releaseDate,
        spotifyUrl: song.spotifyUrl,
        imageUrl: song.imageUrl,
        popularity: song.popularity,
        genre: song.genre,
        streams: song.streams,
        
        // Initialize social metrics
        socialBuzzScore: 0,
        totalMentions: 0,
        socialSentiment: 0,
        platforms: [],
        hashtags: [],
        
        // Initialize web metrics
        webBuzzScore: 0,
        webMentions: 0,
        webSentiment: 0,
        webSources: [],
        
        // Initialize combined metrics
        overallBuzzScore: song.buzzScore || song.popularity || 0,
        trendingVelocity: 0,
        crossPlatformReach: 1 // Spotify only initially
      })
    })
    
    // Enhance with social media data
    socialData.forEach((social: any) => {
      const key = createUniqueKey(social.artist, social.song)
      let song = songMap.get(key)
      
      if (!song) {
        // Try to find existing song with fuzzy matching
        const existingKey = Array.from(songMap.keys()).find(existingKey => {
          const existing = songMap.get(existingKey)!
          return findBestMatch(social.artist, social.song, [existing])
        })
        
        if (existingKey) {
          song = songMap.get(existingKey)!
        } else {
          // Create new song entry from social data
          song = {
            id: `social-${key}`,
            name: social.song,
            artist: social.artist,
            album: 'Unknown Album',
            releaseDate: new Date().toISOString(),
            spotifyUrl: '#',
            imageUrl: '/placeholder.svg?height=300&width=300',
            popularity: 50,
            genre: 'Afrobeats',
            streams: 0,
            
            socialBuzzScore: 0,
            totalMentions: 0,
            socialSentiment: 0,
            platforms: [],
            hashtags: [],
            
            webBuzzScore: 0,
            webMentions: 0,
            webSentiment: 0,
            webSources: [],
            
            overallBuzzScore: 0,
            trendingVelocity: 0,
            crossPlatformReach: 0
          }
          songMap.set(key, song)
        }
      }
      
      // Update social metrics
      song.socialBuzzScore = social.buzzScore || 0
      song.totalMentions = social.totalMentions || 0
      song.socialSentiment = social.avgSentiment || 0
      song.platforms = social.platforms || []
      song.hashtags = social.hashtags || []
      song.crossPlatformReach += social.platforms?.length || 0
    })
    
    // Enhance with web data
    webData.forEach((web: any) => {
      const key = createUniqueKey(web.artist, web.song)
      let song = songMap.get(key)
      
      if (!song) {
        // Try fuzzy matching
        const existingKey = Array.from(songMap.keys()).find(existingKey => {
          const existing = songMap.get(existingKey)!
          return findBestMatch(web.artist, web.song, [existing])
        })
        
        if (existingKey) {
          song = songMap.get(existingKey)!
        }
      }
      
      if (song) {
        // Update web metrics
        song.webBuzzScore = web.webBuzzScore || 0
        song.webMentions = web.mentionCount || 0
        song.webSentiment = web.avgSentiment || 0
        song.webSources = web.sources || []
        song.crossPlatformReach += web.sources?.length || 0
      }
    })
    
    // Calculate comprehensive buzz scores
    const comprehensiveSongs = Array.from(songMap.values()).map(song => {
      // Calculate overall buzz score (weighted combination)
      const spotifyWeight = 0.3
      const socialWeight = 0.4
      const webWeight = 0.3
      
      const spotifyScore = song.popularity || 0
      const socialScore = song.socialBuzzScore || 0
      const webScore = song.webBuzzScore || 0
      
      song.overallBuzzScore = Math.round(
        spotifyScore * spotifyWeight +
        socialScore * socialWeight +
        webScore * webWeight
      )
      
      // Calculate trending velocity (how fast it's gaining traction)
      song.trendingVelocity = Math.round(
        (song.totalMentions / 100) * 0.5 +
        (song.webMentions * 10) * 0.3 +
        (song.socialSentiment * 100) * 0.2
      )
      
      return song
    })

    // Ensure only one song per artist (keep the highest overall buzz score)
    const artistMap = new Map<string, ComprehensiveSong>()
    comprehensiveSongs.forEach((song: ComprehensiveSong) => {
      const artistKey = song.artist.toLowerCase().trim()
      const existing = artistMap.get(artistKey)
      
      if (!existing || (song.overallBuzzScore || 0) > (existing.overallBuzzScore || 0)) {
        artistMap.set(artistKey, song)
      }
    })

    // Sort by overall buzz score and limit to 20 songs
    const finalSongs = Array.from(artistMap.values())
      .sort((a, b) => (b.overallBuzzScore || 0) - (a.overallBuzzScore || 0))
      .slice(0, 20)
    
    return NextResponse.json({
      songs: finalSongs,
      lastUpdated: new Date().toISOString(),
      total: finalSongs.length,
      dataSources: {
        spotify: spotifySongs.length,
        social: socialData.length,
        web: webData.length,
        combined: finalSongs.length
      },
      metrics: {
        avgBuzzScore: Math.round(finalSongs.reduce((sum, song) => sum + song.overallBuzzScore, 0) / finalSongs.length),
        avgCrossPlatformReach: Math.round(finalSongs.reduce((sum, song) => sum + song.crossPlatformReach, 0) / finalSongs.length),
        totalPlatforms: [...new Set(finalSongs.flatMap(song => song.platforms))].length
      }
    })
    
  } catch (error) {
    console.error("Error creating comprehensive buzz data:", error)
    return NextResponse.json(
      { error: "Failed to create comprehensive buzz data" },
      { status: 500 }
    )
  }
}

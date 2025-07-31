import { NextResponse } from "next/server"

interface AggregatedSong {
  id: string
  name: string
  artist: string
  album: string
  releaseDate: string
  imageUrl: string
  spotifyUrl?: string
  audiomackUrl?: string
  appleMusicUrl?: string
  popularity: number
  genre: string
  streams?: number
  buzzScore?: number
  webMentions?: number
  socialSentiment?: number
  platforms?: string[]
  hashtags?: string[]
  totalEngagement?: number
}

// Helper to create a unique key for deduplication
function createUniqueKey(artist: string, song: string): string {
  return `${artist
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "")}-${song
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "")}`
}

export async function GET() {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    // Fetch data from all sources
    const [spotifyReleasesRes, spotifyBuzzingRes, webBuzzRes, socialBuzzRes] = await Promise.all([
      fetch(`${baseUrl}/api/releases`),
      fetch(`${baseUrl}/api/buzzing`),
      fetch(`${baseUrl}/api/web-buzz`),
      fetch(`${baseUrl}/api/social-buzz`),
    ])

    const spotifyReleases = spotifyReleasesRes.ok ? await spotifyReleasesRes.json() : { songs: [] }
    const spotifyBuzzing = spotifyBuzzingRes.ok ? await spotifyBuzzingRes.json() : { songs: [] }
    const webBuzz = webBuzzRes.ok ? await webBuzzRes.json() : { buzzData: [] }
    const socialBuzz = socialBuzzRes.ok ? await socialBuzzRes.json() : { socialBuzz: [] }

    // Combine all song data from Spotify and social/web buzz
    const allSongsMap = new Map<string, AggregatedSong>()

    // Add Spotify releases
    spotifyReleases.songs?.forEach((song: AggregatedSong) => {
      allSongsMap.set(song.id, { ...song, buzzScore: song.popularity }) // Initialize buzzScore with popularity
    })

    // Add Spotify buzzing songs (prioritize higher buzzScore if already exists)
    spotifyBuzzing.songs?.forEach((song: AggregatedSong) => {
      const existing = allSongsMap.get(song.id)
      if (!existing || (song.buzzScore && song.buzzScore > (existing.buzzScore || 0))) {
        allSongsMap.set(song.id, song)
      }
    })

    // Enhance with Web Buzz data (mentions, sentiment from YouTube, Audiomack, Apple Music, etc.)
    webBuzz.buzzData?.forEach((buzzItem: any) => {
      const key = createUniqueKey(buzzItem.artist, buzzItem.song)
      let matchedSong: AggregatedSong | undefined = allSongsMap.get(key)

      if (!matchedSong) {
        // Try fuzzy matching if exact key not found
        for (const song of allSongsMap.values()) {
          const songKey = createUniqueKey(song.artist, song.name)
          if (songKey.includes(key) || key.includes(songKey)) {
            matchedSong = song
            break
          }
        }
      }

      if (matchedSong) {
        matchedSong.webMentions = (matchedSong.webMentions || 0) + buzzItem.totalMentions
        matchedSong.socialSentiment = (matchedSong.socialSentiment || 0) + buzzItem.avgSentiment
        // Re-calculate buzzScore based on existing and new web buzz
        matchedSong.buzzScore = Math.round(
          (matchedSong.buzzScore || matchedSong.popularity || 0) * 0.6 + buzzItem.buzzScore * 0.4,
        )
      } else {
        // If no Spotify match, add as a new entry (simulated ID)
        const newId = `web-buzz-${key}`
        allSongsMap.set(newId, {
          id: newId,
          name: buzzItem.song,
          artist: buzzItem.artist,
          album: "Web Buzz", // Default album
          releaseDate: new Date().toISOString(), // Current date for web buzz
          spotifyUrl: "#", // No direct Spotify URL
          imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(buzzItem.artist + " " + buzzItem.song + " web buzz")}`,
          popularity: Math.round(buzzItem.buzzScore), // Use buzzScore as popularity
          genre: "Afrobeats", // Default genre
          streams: buzzItem.totalMentions * 10, // Simulate streams from mentions
          webMentions: buzzItem.totalMentions,
          socialSentiment: buzzItem.avgSentiment,
          buzzScore: buzzItem.buzzScore,
        })
      }
    })

    // Enhance with Social Buzz data (from Twitter, Instagram, TikTok, YouTube)
    socialBuzz.socialBuzz?.forEach((socialItem: any) => {
      const key = createUniqueKey(socialItem.artist, socialItem.song)
      let matchedSong: AggregatedSong | undefined = allSongsMap.get(key)

      if (!matchedSong) {
        // Try fuzzy matching if exact key not found
        for (const song of allSongsMap.values()) {
          const songKey = createUniqueKey(song.artist, song.name)
          if (songKey.includes(key) || key.includes(songKey)) {
            matchedSong = song
            break
          }
        }
      }

      if (matchedSong) {
        matchedSong.webMentions = (matchedSong.webMentions || 0) + socialItem.totalMentions
        matchedSong.socialSentiment = (matchedSong.socialSentiment || 0) + socialItem.avgSentiment
        matchedSong.platforms = Array.from(new Set([...(matchedSong.platforms || []), ...(socialItem.platforms || [])]))
        matchedSong.hashtags = Array.from(new Set([...(matchedSong.hashtags || []), ...(socialItem.hashtags || [])]))
        matchedSong.totalEngagement = (matchedSong.totalEngagement || 0) + socialItem.totalEngagement

        // Re-calculate buzzScore with social buzz
        matchedSong.buzzScore = Math.round(
          (matchedSong.buzzScore || matchedSong.popularity || 0) * 0.5 + socialItem.buzzScore * 0.5,
        )
      } else {
        // If no Spotify match, add as a new entry (simulated ID)
        const newId = `social-buzz-${key}`
        allSongsMap.set(newId, {
          id: newId,
          name: socialItem.song,
          artist: socialItem.artist,
          album: "Social Buzz", // Default album
          releaseDate: new Date().toISOString(), // Current date for social buzz
          spotifyUrl: "#", // No direct Spotify URL
          imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(socialItem.artist + " " + socialItem.song + " social buzz")}`,
          popularity: Math.round(socialItem.buzzScore), // Use buzzScore as popularity
          genre: "Afrobeats", // Default genre
          streams: (socialItem.totalEngagement || 0) / 10, // Simulate streams from engagement
          webMentions: socialItem.totalMentions,
          socialSentiment: socialItem.avgSentiment,
          platforms: socialItem.platforms,
          hashtags: socialItem.hashtags,
          totalEngagement: socialItem.totalEngagement,
          buzzScore: socialItem.buzzScore,
        })
      }
    })

    // Convert map to array and sort by buzzScore
    const finalAggregatedSongs = Array.from(allSongsMap.values()).sort(
      (a, b) => (b.buzzScore || 0) - (a.buzzScore || 0),
    )

    // Ensure only one song per artist (keep the highest buzz score)
    const artistMap = new Map<string, AggregatedSong>()
    finalAggregatedSongs.forEach((song: AggregatedSong) => {
      const artistKey = song.artist.toLowerCase().trim()
      const existing = artistMap.get(artistKey)

      if (!existing || (song.buzzScore || 0) > (existing.buzzScore || 0)) {
        artistMap.set(artistKey, song)
      }
    })

    const deduplicatedSongs = Array.from(artistMap.values()).sort((a, b) => (b.buzzScore || 0) - (a.buzzScore || 0))

    return NextResponse.json({
      songs: deduplicatedSongs,
      lastUpdated: new Date().toISOString(),
      total: deduplicatedSongs.length,
      aggregationComplete: true,
      sources: ["spotify", "twitter", "instagram", "tiktok", "youtube", "audiomack", "apple-music", "web-scraping"],
      metrics: {
        spotifyReleasesCount: spotifyReleases.songs?.length || 0,
        spotifyBuzzingCount: spotifyBuzzing.songs?.length || 0,
        webBuzzCount: webBuzz.buzzData?.length || 0,
        socialBuzzCount: socialBuzz.socialBuzz?.length || 0,
        finalAggregatedCount: deduplicatedSongs.length,
      },
    })
  } catch (error) {
    console.error("Error aggregating data:", error)
    return NextResponse.json({ error: "Failed to aggregate data from all sources" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

export async function GET() {
  try {
    // This endpoint will be called by Vercel Cron or GitHub Actions
    // Trigger the digest sending
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const response = await fetch(`${baseUrl}/api/send-digest`, {
      method: "POST",
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    })
  } catch (error) {
    console.error("Cron job failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Cron job failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

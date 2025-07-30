"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

export default function TestDigestPage() {
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<any>(null)

  const sendTestDigest = async () => {
    setIsSending(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-digest", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)

      if (response.ok) {
        toast({
          title: "Test Email Sent!",
          description: `Successfully sent digest to both test email addresses`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send test email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending test digest:", error)
      toast({
        title: "Error",
        description: "Failed to send test digest",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-6 h-6" />
                Test Weekly Digest
              </CardTitle>
              <CardDescription>
                Send a test email digest to tobionisemo2020@gmail.com and tosinogen2012@gmail.com to verify the weekly digest functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Test Email Details:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Recipients: tobionisemo2020@gmail.com, tosinogen2012@gmail.com</li>
                    <li>• Content: Top 20 Buzzing Songs + Top 20 New Releases</li>
                    <li>• Format: HTML and plain text</li>
                    <li>• Source: Live Spotify data + Social buzz</li>
                  </ul>
                </div>

                <Button 
                  onClick={sendTestDigest} 
                  disabled={isSending}
                  className="w-full"
                  size="lg"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Test Email...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Test Digest
                    </>
                  )}
                </Button>

                {result && (
                  <Card className={result.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {result.error ? (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className={`font-semibold ${result.error ? "text-red-900" : "text-green-900"}`}>
                            {result.error ? "Error" : "Success"}
                          </h4>
                          <p className={`text-sm ${result.error ? "text-red-800" : "text-green-800"}`}>
                            {result.error || result.message}
                          </p>
                          
                          {result.songsIncluded && (
                            <div className="mt-3 space-y-1">
                              <Badge variant="outline" className="mr-2">
                                New Releases: {result.songsIncluded.newReleases}
                              </Badge>
                              <Badge variant="outline" className="mr-2">
                                Buzzing Songs: {result.songsIncluded.buzzingSongs}
                              </Badge>
                              <Badge variant="outline">
                                Unique Artists: {result.songsIncluded.uniqueArtists}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Make sure your Gmail credentials are configured in environment variables
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

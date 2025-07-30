"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Send, Users, Music, TrendingUp, Calendar, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

interface DigestStats {
  newReleases: number
  buzzingSongs: number
  uniqueArtists: number
  subscribers: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<DigestStats | null>(null)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isSendingFull, setIsSendingFull] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [fullResult, setFullResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [emailVerifyResult, setEmailVerifyResult] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [releasesRes, buzzingRes, subscribersRes] = await Promise.all([
        fetch("/api/releases"),
        fetch("/api/buzzing"),
        fetch("/api/subscribe")
      ])

      const releases = releasesRes.ok ? await releasesRes.json() : { songs: [] }
      const buzzing = buzzingRes.ok ? await buzzingRes.json() : { songs: [] }
      const subscribers = subscribersRes.ok ? await subscribersRes.json() : { total: 0 }

      const allArtists = new Set([
        ...releases.songs?.map((s: any) => s.artist) || [],
        ...buzzing.songs?.map((s: any) => s.artist) || []
      ])

      setStats({
        newReleases: releases.songs?.length || 0,
        buzzingSongs: buzzing.songs?.length || 0,
        uniqueArtists: allArtists.size,
        subscribers: subscribers.total || 0
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast({
        title: "Error",
        description: "Failed to fetch stats",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendTestDigest = async () => {
    setIsSendingTest(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test-digest", {
        method: "POST",
      })

      const data = await response.json()
      setTestResult(data)

      if (response.ok) {
        toast({
          title: "Test Email Sent!",
          description: `Successfully sent to both test email addresses`,
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
      setIsSendingTest(false)
    }
  }

  const sendFullDigest = async () => {
    setIsSendingFull(true)
    setFullResult(null)

    try {
      const response = await fetch("/api/send-digest", {
        method: "POST",
      })

      const data = await response.json()
      setFullResult(data)

      if (response.ok) {
        toast({
          title: "Digest Sent!",
          description: `Successfully sent to ${data.sent} subscribers`,
        })
        fetchStats() // Refresh stats
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send digest",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending full digest:", error)
      toast({
        title: "Error",
        description: "Failed to send digest",
        variant: "destructive",
      })
    } finally {
      setIsSendingFull(false)
    }
  }

  const addTestSubscriber = async () => {
    try {
      const response = await fetch("/api/add-test-subscriber", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        })
        fetchStats() // Refresh stats
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add test subscriber",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding test subscriber:", error)
      toast({
        title: "Error",
        description: "Failed to add test subscriber",
        variant: "destructive",
      })
    }
  }

  const verifyEmailDelivery = async () => {
    setIsVerifyingEmail(true)
    setEmailVerifyResult(null)

    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
      })

      const data = await response.json()
      setEmailVerifyResult(data)

      if (response.ok) {
        toast({
          title: "Email Verification Complete!",
          description: data.summary,
        })
      } else {
        toast({
          title: "Verification Error",
          description: data.error || "Failed to verify email delivery",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error verifying email:", error)
      toast({
        title: "Error",
        description: "Failed to verify email delivery",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Afropulse Admin</h1>
            <p className="text-muted-foreground">Manage weekly digests and monitor system stats</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Releases</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats?.newReleases || 0}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Buzzing Songs</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats?.buzzingSongs || 0}</div>
                <p className="text-xs text-muted-foreground">Trending now</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Artists</CardTitle>
                <Music className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats?.uniqueArtists || 0}</div>
                <p className="text-xs text-muted-foreground">No duplicates</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats?.subscribers || 0}</div>
                <p className="text-xs text-muted-foreground">Active</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="test" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="test">Test Digest</TabsTrigger>
              <TabsTrigger value="full">Full Digest</TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Test Weekly Digest
                  </CardTitle>
                  <CardDescription>
                    Send a test email to tobionisemo2020@gmail.com and tosinogen2012@gmail.com with the current week's top 20 songs in each category.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={addTestSubscriber} variant="outline">
                      Add Test Subscriber
                    </Button>
                    <Button 
                      onClick={sendTestDigest} 
                      disabled={isSendingTest}
                      className="flex-1"
                    >
                      {isSendingTest ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Test Digest
                        </>
                      )}
                    </Button>
                  </div>

                  {testResult && (
                    <Card className={testResult.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {testResult.error ? (
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className={`font-semibold ${testResult.error ? "text-red-900" : "text-green-900"}`}>
                              {testResult.error ? "Error" : "Success"}
                            </h4>
                            <p className={`text-sm ${testResult.error ? "text-red-800" : "text-green-800"}`}>
                              {testResult.error || testResult.message}
                            </p>
                            
                            {testResult.songsIncluded && (
                              <div className="mt-3 space-y-1">
                                <Badge variant="outline" className="mr-2">
                                  New Releases: {testResult.songsIncluded.newReleases}
                                </Badge>
                                <Badge variant="outline" className="mr-2">
                                  Buzzing Songs: {testResult.songsIncluded.buzzingSongs}
                                </Badge>
                                <Badge variant="outline">
                                  Unique Artists: {testResult.songsIncluded.uniqueArtists}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {testResult?.recipients && (
                    <div className="mt-2 text-xs text-green-700">
                      Sent to: {testResult.recipients.join(', ')}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Email Delivery Verification
                  </CardTitle>
                  <CardDescription>
                    Verify that emails can be successfully delivered to both test addresses without sending full digest content.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={verifyEmailDelivery} 
                    disabled={isVerifyingEmail}
                    variant="outline"
                    className="w-full"
                  >
                    {isVerifyingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying Email Delivery...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify Email Delivery
                      </>
                    )}
                  </Button>

                  {emailVerifyResult && (
                    <Card className={emailVerifyResult.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {emailVerifyResult.error ? (
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className={`font-semibold ${emailVerifyResult.error ? "text-red-900" : "text-green-900"}`}>
                              {emailVerifyResult.error ? "Verification Failed" : "Verification Complete"}
                            </h4>
                            <p className={`text-sm ${emailVerifyResult.error ? "text-red-800" : "text-green-800"}`}>
                              {emailVerifyResult.error || emailVerifyResult.message}
                            </p>
                            
                            {emailVerifyResult.results && (
                              <div className="mt-3 space-y-2">
                                {emailVerifyResult.results.map((result: any, index: number) => (
                                  <div key={index} className="flex items-center gap-2">
                                    {result.status === "success" ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-600" />
                                    )}
                                    <span className="text-xs">{result.email}: {result.message}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="full" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Send to All Subscribers
                  </CardTitle>
                  <CardDescription>
                    Send the weekly digest to all active subscribers. This includes the test email address.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={sendFullDigest} 
                    disabled={isSendingFull || (stats?.subscribers || 0) === 0}
                    className="w-full"
                    size="lg"
                  >
                    {isSendingFull ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending to {stats?.subscribers || 0} subscribers...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send to {stats?.subscribers || 0} Subscribers
                      </>
                    )}
                  </Button>

                  {fullResult && (
                    <Card className={fullResult.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {fullResult.error ? (
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className={`font-semibold ${fullResult.error ? "text-red-900" : "text-green-900"}`}>
                              {fullResult.error ? "Error" : "Success"}
                            </h4>
                            <p className={`text-sm ${fullResult.error ? "text-red-800" : "text-green-800"}`}>
                              {fullResult.error || fullResult.message}
                            </p>
                            
                            {fullResult.sent && (
                              <div className="mt-3">
                                <Badge variant="outline">
                                  Sent: {fullResult.sent}/{fullResult.total}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

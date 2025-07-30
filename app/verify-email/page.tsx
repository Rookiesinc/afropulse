"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<any>(null)

  const verifyEmailDelivery = async () => {
    setIsVerifying(true)
    setResult(null)

    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)

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
      setIsVerifying(false)
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
                Email Delivery Verification
              </CardTitle>
              <CardDescription>
                Test email delivery to both tobionisemo2020@gmail.com and tosinogen2012@gmail.com without sending full digest content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Verification Details:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Recipients: tobionisemo2020@gmail.com, tosinogen2012@gmail.com</li>
                    <li>• Content: Simple verification message (not full digest)</li>
                    <li>• Purpose: Confirm email delivery is working</li>
                    <li>• Gmail SMTP configuration test</li>
                  </ul>
                </div>

                <Button 
                  onClick={verifyEmailDelivery} 
                  disabled={isVerifying}
                  className="w-full"
                  size="lg"
                >
                  {isVerifying ? (
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
                            {result.error ? "Verification Failed" : "Verification Complete"}
                          </h4>
                          <p className={`text-sm ${result.error ? "text-red-800" : "text-green-800"}`}>
                            {result.error || result.message}
                          </p>
                          
                          {result.summary && (
                            <div className="mt-2">
                              <Badge variant="outline">
                                {result.summary}
                              </Badge>
                            </div>
                          )}

                          {result.results && (
                            <div className="mt-3 space-y-2">
                              <h5 className="font-medium text-sm">Individual Results:</h5>
                              {result.results.map((res: any, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                  {res.status === "success" ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  )}
                                  <span className="text-xs">
                                    <strong>{res.email}:</strong> {res.message}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    This verification sends a simple test email without the full digest content
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

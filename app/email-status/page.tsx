"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Mail, Settings, Send, Loader2, ExternalLink, Copy } from "lucide-react"

interface EmailStatus {
  success: boolean
  status: string
  message: string
  details?: any
  setup?: any
  troubleshooting?: any
  timestamp: string
}

export default function EmailStatusPage() {
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testEmail, setTestEmail] = useState("")
  const [sendingTest, setSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    checkEmailStatus()
  }, [])

  const checkEmailStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/check-email-status")
      const data = await response.json()
      setEmailStatus(data)
    } catch (error) {
      console.error("Error checking email status:", error)
      setEmailStatus({
        success: false,
        status: "error",
        message: "Failed to check email status",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) return

    try {
      setSendingTest(true)
      const response = await fetch("/api/check-email-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testEmail }),
      })
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      console.error("Error sending test email:", error)
      setTestResult({
        success: false,
        message: "Failed to send test email",
      })
    } finally {
      setSendingTest(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "connection_failed":
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-200"
      case "connection_failed":
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid gap-6">
              <div className="bg-white rounded-lg p-6 h-40"></div>
              <div className="bg-white rounded-lg p-6 h-60"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 Email System Status</h1>
          <p className="text-gray-600">Monitor and test your Gmail SMTP configuration</p>
        </div>

        {/* Status Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {emailStatus && getStatusIcon(emailStatus.status)}
              Email Configuration Status
            </CardTitle>
            <CardDescription>Current status of your Gmail SMTP connection</CardDescription>
          </CardHeader>
          <CardContent>
            {emailStatus && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(emailStatus.status)}>
                    {emailStatus.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-start justify-between">
                  <span className="font-medium">Message:</span>
                  <span className="text-right max-w-md">{emailStatus.message}</span>
                </div>

                {emailStatus.details && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Connection Details:</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(emailStatus.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                          </span>
                          <span className="font-mono">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Last checked:</span>
                  <span>{new Date(emailStatus.timestamp).toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Instructions (if not configured) */}
        {emailStatus && !emailStatus.success && emailStatus.setup && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Gmail Setup Instructions
              </CardTitle>
              <CardDescription>Follow these steps to configure Gmail SMTP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You need to set up Gmail App Passwords to use SMTP with your application.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {emailStatus.setup.steps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(emailStatus.setup.links.googleAccount, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Google Account
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(emailStatus.setup.links.appPasswords, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    App Passwords
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium mb-2">Environment Variables:</h4>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex items-center gap-2">
                      <span>GMAIL_USER=your-email@gmail.com</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("GMAIL_USER=your-email@gmail.com")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>GMAIL_APP_PASSWORD=your-16-character-app-password</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("GMAIL_APP_PASSWORD=your-16-character-app-password")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Troubleshooting (if connection failed) */}
        {emailStatus && !emailStatus.success && emailStatus.troubleshooting && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Troubleshooting
              </CardTitle>
              <CardDescription>Common issues and solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Common Issues:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {emailStatus.troubleshooting.commonIssues.map((issue: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Solutions:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {emailStatus.troubleshooting.solutions.map((solution: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Email */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Test Email
            </CardTitle>
            <CardDescription>Test your email configuration by sending a test message</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    disabled={!emailStatus?.success}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={sendTestEmail} disabled={!testEmail || !emailStatus?.success || sendingTest}>
                    {sendingTest ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Send Test
                  </Button>
                </div>
              </div>

              {!emailStatus?.success && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Email configuration must be working before you can send test emails.
                  </AlertDescription>
                </Alert>
              )}

              {testResult && (
                <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{testResult.message}</p>
                      {testResult.details && (
                        <div className="text-sm">
                          <p>
                            <strong>From:</strong> {testResult.details.from}
                          </p>
                          <p>
                            <strong>To:</strong> {testResult.details.to}
                          </p>
                          <p>
                            <strong>Subject:</strong> {testResult.details.subject}
                          </p>
                          <p>
                            <strong>Sent At:</strong> {new Date(testResult.details.sentAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={checkEmailStatus} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
            Refresh Status
          </Button>

          <Button variant="outline" onClick={() => (window.location.href = "/admin")}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

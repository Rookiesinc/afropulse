import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import { Music, TrendingUp, Newspaper, BarChart3 } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Afropulse - African Music Discovery Platform",
  description: "Discover the pulse of African music with real-time releases, trending news, and social buzz tracking",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-orange-600">
                <Music className="w-6 h-6" />
                Afropulse
              </Link>

              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <Music className="w-4 h-4" />
                  Releases
                </Link>
                <Link
                  href="/trending"
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </Link>
                <Link
                  href="/news"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Newspaper className="w-4 h-4" />
                  News
                </Link>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {children}
        <Toaster />
      </body>
    </html>
  )
}

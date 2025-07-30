import { Loader2 } from "lucide-react"

export default function TrendingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
        <p className="text-gray-600">Loading trending content...</p>
      </div>
    </div>
  )
}

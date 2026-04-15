import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'

export default function NotFound() {
  return (
    <PageContainer className="text-center py-24">
      <div className="text-6xl mb-4">🧭</div>
      <h1 className="text-3xl font-bold text-stone-900 mb-3">Page Not Found</h1>
      <p className="text-stone-500 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors text-sm font-medium"
        >
          Go Home
        </Link>
        <a
          href="/book-reader"
          className="px-5 py-2.5 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700"
        >
          Book Reader
        </a>
        <a
          href="/daily-nuance/"
          className="px-5 py-2.5 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700"
        >
          Daily Nuance
        </a>
      </div>
    </PageContainer>
  )
}

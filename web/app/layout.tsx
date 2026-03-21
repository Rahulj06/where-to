import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Where To? — Curated Restaurants',
  description: 'Discover Mumbai\'s best curated restaurants, filtered by mood, cuisine, and budget.',
  openGraph: {
    title: 'Where To? — Curated Restaurants',
    description: 'Discover Mumbai\'s best curated restaurants.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-stone-50 text-stone-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}

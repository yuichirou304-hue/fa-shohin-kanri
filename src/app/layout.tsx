import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FA商材管理システム',
  description: 'FA機器の商材管理データベース',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex">
          <Navigation />
          <main className="flex-1 ml-60 p-8 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

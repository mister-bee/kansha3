// app/layout.tsx

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kansha AI',
  description: 'Playful AI with Next.js and Firebase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <nav className="bg-gray-800 text-white p-4">
          <ul className="flex space-x-4">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/about">About Us</Link></li>
          </ul>
        </nav>
        {children}
      </body>
    </html>
  )
}
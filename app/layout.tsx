import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NomadicMatch — Dating for Digital Nomads',
  description:
    'Find single digital nomads who match your travel pace, lifestyle, and values. Get instant access to our global nomad dating community.',
  icons: {
    icon: [
      { url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❤️</text></svg>", type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'NomadicMatch — Dating for Digital Nomads',
    description: 'Find single digital nomads who match your travel pace, lifestyle, and values.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}

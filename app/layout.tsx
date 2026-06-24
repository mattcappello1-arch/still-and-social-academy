import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Still & Social OS',
  description:
    'Staff operating system for Still & Social — training, operations, compliance, and team development.',
  manifest: '/manifest.json',
  themeColor: '#241F21',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'S&S OS',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink antialiased">
        {children}
      </body>
    </html>
  )
}

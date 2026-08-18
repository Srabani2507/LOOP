import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'LOOP - AI Customer Feedback Intelligence',
  description: 'Analyze customer feedback with AI-powered insights',
  icons: {
    icon: [
      {
        url: '/LOOP-logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/LOOP-logo.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'rgb(249, 250, 251)' },
    { media: '(prefers-color-scheme: dark)', color: 'rgb(31, 31, 31)' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className="antialiased">
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'auto';
                if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else if (theme === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.remove('dark', 'light');
                }
              } catch (e) {}
            `,
          }}
        />
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LOOP — AI Customer Feedback Intelligence Platform',
  description:
    'LOOP ingests multi-channel customer feedback, uses AI to classify and cluster it, surfaces what is trending, and answers plain-English questions about what customers actually want. Close the loop on customer feedback.',
  keywords: [
    'customer feedback',
    'AI feedback analysis',
    'voice of customer',
    'sentiment analysis',
    'feedback intelligence',
    'product analytics',
  ],
  openGraph: {
    title: 'LOOP — Close the loop on customer feedback',
    description:
      'AI-powered platform that classifies, clusters, and surfaces actionable insights from multi-channel customer feedback.',
    type: 'website',
  },
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

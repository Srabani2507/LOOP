'use client'

import dynamic from 'next/dynamic'

const LandingPage = dynamic(() => import('./(landing)/page'), { ssr: false })

export default function LandingClient() {
  return <LandingPage />
}

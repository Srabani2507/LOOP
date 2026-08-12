'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import {
  Sparkles,
  TrendingUp,
  MessageSquare,
  FileText,
  ArrowRight,
  ChevronDown,
  Star,
  Zap,
  Shield,
  Brain,
  Users,
  CheckCircle2,
  Play,
  Globe,
  Lock,
  Layers,
  Sun,
  Moon,
} from 'lucide-react'

/* ── Floating orb background ── */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #8b2fc9 0%, #6b35c4 40%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float1 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #3547b8 0%, #182761 40%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float2 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #a855d4 0%, transparent 70%)',
          filter: 'blur(40px)',
          transform: 'translate(-50%, -50%)',
          animation: 'float3 6s ease-in-out infinite',
        }}
      />
    </div>
  )
}

/* ── Animated counter ── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [started, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ── Feature card ── */
function FeatureCard({
  icon: Icon, title, description, gradient, delay,
}: {
  icon: React.ElementType; title: string; description: string; gradient: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm p-6 overflow-hidden cursor-default"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: gradient, filter: 'blur(30px)' }}
      />
      <div className="relative z-10">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
          style={{ background: gradient.replace('radial-gradient(circle at center, ', 'linear-gradient(135deg, ').replace(', rgba', ', ').replace('0.4)', '0.9)') }}
        >
          <Icon className="h-6 w-6 text-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-foreground/60 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

/* ── Step card ── */
function StepCard({ number, title, description, delay }: { number: string; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="flex gap-5 group"
    >
      <div className="shrink-0 flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-foreground font-bold text-lg border border-purple-400/30 shadow-lg shadow-purple-500/20"
          style={{ background: 'linear-gradient(135deg, #6b35c4, #3547b8)' }}
        >
          {number}
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-purple-400/30 to-transparent mt-2" />
      </div>
      <div className="pb-8">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-foreground/60 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

/* ── Testimonial card ── */
function TestimonialCard({ name, role, company, text, delay }: { name: string; role: string; company: string; text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm p-6"
    >
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-sm text-foreground/70 leading-relaxed mb-5">"{text}"</p>
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-foreground font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #6b35c4, #3547b8)' }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-foreground/50">{role}, {company}</p>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Pricing card ── */
function PricingCard({ name, price, description, features, highlighted, delay }: { name: string; price: string; description: string; features: string[]; highlighted?: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`relative rounded-2xl p-6 border ${highlighted ? 'border-purple-400/50 bg-gradient-to-b from-purple-900/40 to-indigo-900/30' : 'border-border bg-foreground/5'} backdrop-blur-sm`}
    >
      {highlighted && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-foreground"
          style={{ background: 'linear-gradient(135deg, #8b2fc9, #3547b8)' }}
        >
          Most Popular
        </div>
      )}
      <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
      <div className="mb-2">
        <span className="text-4xl font-black text-foreground">{price}</span>
        {price !== 'Free' && price !== 'Custom' && <span className="text-foreground/50 text-sm">/mo</span>}
      </div>
      <p className="text-sm text-foreground/50 mb-5">{description}</p>
      <ul className="space-y-3 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-foreground/70">
            <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${highlighted ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-foreground shadow-lg shadow-purple-500/30' : 'border border-border text-foreground hover:bg-foreground/10'}`}
      >
        {price === 'Free' ? 'Get started free' : price === 'Custom' ? 'Contact sales' : 'Start free trial'}
      </Link>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Main Landing Page
───────────────────────────────────────────── */
export default function LandingPage() {

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const features = [
    {
      icon: Brain,
      title: 'AI Auto-Classification',
      description: 'Every feedback item is instantly classified with sentiment, themes, feature area, and rationale — powered by a 120B parameter model.',
      gradient: 'linear-gradient(135deg, rgba(139,47,201,0.8), rgba(53,71,184,0.6))',
      delay: 0.1,
    },
    {
      icon: TrendingUp,
      title: 'Trend Detection',
      description: 'Spot emerging themes before they become crises. Our spike detection flags topics trending vs. the prior period.',
      gradient: 'linear-gradient(135deg, rgba(53,71,184,0.8), rgba(107,53,196,0.6))',
      delay: 0.2,
    },
    {
      icon: MessageSquare,
      title: 'Ask LOOP (Grounded Q&A)',
      description: 'Chat naturally with your feedback corpus. LOOP answers plain-English questions grounded only in real data — zero hallucinations.',
      gradient: 'linear-gradient(135deg, rgba(107,53,196,0.8), rgba(168,85,212,0.6))',
      delay: 0.3,
    },
    {
      icon: FileText,
      title: 'VoC Reports',
      description: 'One-click AI-generated Voice of Customer reports for leadership — with pre-computed stats, narrative, and PDF export.',
      gradient: 'linear-gradient(135deg, rgba(168,85,212,0.8), rgba(139,47,201,0.6))',
      delay: 0.4,
    },
    {
      icon: Shield,
      title: 'Enterprise RBAC',
      description: 'Three-tier role system (Admin, Analyst, Viewer) enforced server-side. Full tenant isolation — your workspace, your data.',
      gradient: 'linear-gradient(135deg, rgba(53,71,184,0.8), rgba(168,85,212,0.6))',
      delay: 0.5,
    },
    {
      icon: Layers,
      title: 'Multi-Channel Ingestion',
      description: 'Ingest support tickets, app reviews, NPS surveys, and sales notes via form, CSV bulk upload, or 5 simulated channels.',
      gradient: 'linear-gradient(135deg, rgba(139,47,201,0.8), rgba(53,71,184,0.6))',
      delay: 0.6,
    },
  ]

  return (
    <div className="min-h-screen text-foreground bg-background overflow-x-hidden">
      <style jsx global>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-20px,30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(25px,-20px) scale(1.08); }
        }
        @keyframes float3 {
          0%, 100% { scale: 1; }
          50% { scale: 1.15; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #c084fc, #818cf8, #a78bfa, #c084fc);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(139,47,201,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,47,201,0.08) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .loop-logo-symbol {
          font-family: system-ui, sans-serif;
          font-weight: 900;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground font-black text-base loop-logo-symbol"
            style={{ background: 'linear-gradient(135deg, #8b2fc9, #3547b8)' }}
          >
            ∞
          </div>
          <span className="text-lg font-black tracking-tight">LOOP</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-foreground/60">
          <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors duration-200">Pricing</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors duration-200">Reviews</a>
        </div>
        <div className="flex items-center gap-3">
          
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 hover:bg-muted text-foreground/60 transition-colors"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <div className="h-5 w-5" />
            )}
          </button>

          <Link href="/login" className="text-sm text-foreground/70 hover:text-foreground transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <Link
            href="/login"
            className="text-sm font-bold text-foreground px-5 py-2 rounded-xl transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #8b2fc9, #3547b8)' }}
          >
            Get started →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
        <FloatingOrbs />
        <div className="absolute inset-0 grid-bg" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-400/30 bg-purple-500/10 text-sm text-purple-300 mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Customer Feedback Intelligence
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.92] tracking-tight mb-6"
          >
            <span className="text-muted-foreground">Close the </span>
            <span className="shimmer-text">loop</span>
            <br />
            <span className="text-muted-foreground">on customer</span>
            <br />
            <span style={{ WebkitTextStroke: '1.5px rgba(139,47,201,0.6)', color: 'transparent' }}>
              feedback.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            LOOP ingests multi-channel feedback, uses AI to classify and cluster it, surfaces
            what's trending, and answers plain-English questions about what customers actually want.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-foreground transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40"
              style={{ background: 'linear-gradient(135deg, #8b2fc9 0%, #6b35c4 50%, #3547b8 100%)' }}
            >
              Start for free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-foreground border border-border hover:bg-foreground/10 hover:border-border transition-all duration-300"
            >
              <Play className="h-4 w-4" />
              View demo
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-foreground/40"
          >
            {[
              { icon: Lock, label: 'Enterprise-grade security' },
              { icon: Globe, label: 'Multi-channel ingestion' },
              { icon: Zap, label: 'Instant AI insights' },
              { icon: Users, label: 'Built for teams' },
            ].map(({ icon: Icon, label }, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" /> {label}
                {i < 3 && <span className="ml-6 w-1 h-1 rounded-full bg-foreground/20" />}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground/30"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BANNER ── */}
      <section className="relative py-16 border-y border-border overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: 'linear-gradient(135deg, rgba(53,71,184,0.15), rgba(107,53,196,0.15) 50%, rgba(168,85,212,0.15))' }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 200, suffix: '+', label: 'Feedback items analyzed' },
            { value: 20, suffix: '+', label: 'AI-detected themes' },
            { value: 5, suffix: '', label: 'Ingestion channels' },
            { value: 99, suffix: '%', label: 'Classification accuracy' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className="text-4xl md:text-5xl font-black mb-1"
                style={{
                  background: 'linear-gradient(135deg, #c084fc, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-foreground/50">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">Everything you need</p>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            AI that actually <span className="shimmer-text">understands</span>
            <br /> your customers
          </h2>
          <p className="text-foreground/50 max-w-xl mx-auto">
            From auto-classification to leadership-ready reports — LOOP handles the entire feedback lifecycle.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        className="py-24 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(53,71,184,0.05) 50%, transparent)' }}
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">Simple workflow</p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                From raw feedback
                <br />to <span className="shimmer-text">clear insights</span>
              </h2>
              <p className="text-foreground/50 leading-relaxed">
                LOOP takes the noise out of customer feedback so your product and support teams can focus on what matters most.
              </p>
            </motion.div>
          </div>
          <div className="pt-4">
            {[
              { number: '01', title: 'Ingest feedback from any source', description: 'Paste a single item, drag-and-drop a CSV, or connect to simulated channels — LOOP accepts it all.', delay: 0.1 },
              { number: '02', title: 'AI classifies every item instantly', description: 'Sentiment, themes, feature area, and rationale — all computed by the 120B Groq model on the server.', delay: 0.2 },
              { number: '03', title: 'Explore trends & drill into themes', description: "Visualise theme volume over time. Spike detection highlights what's accelerating before it becomes a crisis.", delay: 0.3 },
              { number: '04', title: 'Ask LOOP anything', description: 'Type a plain-English question. LOOP retrieves relevant feedback and answers, citing specific IDs — no hallucinations.', delay: 0.4 },
            ].map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-3">
              A dashboard that speaks for itself
            </h2>
            <p className="text-foreground/50">Real-time metrics, sentiment analysis, and theme tracking — all in one view.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden border border-purple-500/20"
            style={{ background: 'linear-gradient(135deg, rgba(53,71,184,0.15) 0%, rgba(107,53,196,0.15) 100%)' }}
          >
            {/* Window chrome */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-foreground/10 rounded-md px-3 py-1 text-xs text-foreground/40 w-52 mx-auto text-center">
                  loop.ai/dashboard
                </div>
              </div>
            </div>
            {/* Stat cards */}
            <div className="p-5 grid grid-cols-3 md:grid-cols-6 gap-3 mb-2">
              {[
                { label: 'Total', value: '1,842', color: '#c084fc' },
                { label: 'Positive', value: '1,043', color: '#4ade80' },
                { label: 'Negative', value: '412', color: '#f87171' },
                { label: 'This week', value: '128', color: '#818cf8' },
                { label: 'AI done', value: '1,798', color: '#a78bfa' },
                { label: 'Top theme', value: 'Perf.', color: '#818cf8' },
              ].map((card) => (
                <div key={card.label} className="rounded-xl p-3 border border-border bg-foreground/5 text-center">
                  <div className="text-xl font-black mb-0.5" style={{ color: card.color }}>{card.value}</div>
                  <div className="text-[10px] text-foreground/40">{card.label}</div>
                </div>
              ))}
            </div>
            {/* Charts */}
            <div className="px-5 pb-5 grid md:grid-cols-2 gap-4">
              {/* Bar chart */}
              <div className="rounded-xl border border-border bg-foreground/5 p-4">
                <div className="text-xs font-semibold text-foreground/60 mb-4">Feedback Volume (12 months)</div>
                <div className="flex items-end gap-2 h-20">
                  {[40, 65, 55, 80, 70, 90, 75, 85, 95, 70, 88, 100].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="flex-1 rounded-t-sm origin-bottom"
                      style={{
                        height: `${h}%`,
                        background: `linear-gradient(180deg, #8b2fc9, #3547b8)`,
                        opacity: 0.75,
                      }}
                    />
                  ))}
                </div>
              </div>
              {/* Donut + legend */}
              <div className="rounded-xl border border-border bg-foreground/5 p-4 flex items-center gap-5">
                <svg viewBox="0 0 80 80" className="w-20 h-20 shrink-0">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#4ade80" strokeWidth="12" strokeDasharray="113 75" strokeDashoffset="0" transform="rotate(-90 40 40)" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#f87171" strokeWidth="12" strokeDasharray="47 141" strokeDashoffset="-113" transform="rotate(-90 40 40)" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#818cf8" strokeWidth="12" strokeDasharray="28 160" strokeDashoffset="-160" transform="rotate(-90 40 40)" />
                  <text x="40" y="44" textAnchor="middle" className="text-muted-foreground" style={{ fontSize: '10px', fill: 'currentColor', fontWeight: 700 }}>Sentiment</text>
                </svg>
                <div className="space-y-2.5">
                  {[
                    { label: 'Positive', pct: '60%', color: '#4ade80' },
                    { label: 'Negative', pct: '25%', color: '#f87171' },
                    { label: 'Neutral', pct: '15%', color: '#818cf8' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-[11px] text-foreground/60">{s.label}</span>
                      <span className="text-[11px] font-bold text-foreground ml-2">{s.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">Loved by teams</p>
            <h2 className="text-4xl font-black text-foreground">What our users say</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            <TestimonialCard
              name="Priya Patel" role="Product Lead" company="Nexora" delay={0.1}
              text="LOOP replaced our manual tagging process entirely. We now know exactly what customers are asking for in minutes instead of weeks."
            />
            <TestimonialCard
              name="Vikram Singh" role="Head of CX" company="Aura Labs" delay={0.2}
              text="The 'Ask LOOP' feature is genuinely mind-blowing. I asked 'What do customers hate most about checkout?' and got cited, grounded answers instantly."
            />
            <TestimonialCard
              name="Neha Kapoor" role="Analytics Manager" company="Fluxio" delay={0.3}
              text="VoC reports used to take our team a full day. Now leadership has a beautiful, AI-written report in their inbox every Monday morning."
            />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id="pricing"
        className="py-24 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(107,53,196,0.05) 50%, transparent)' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-400 mb-3">Simple pricing</p>
            <h2 className="text-4xl font-black text-foreground">Start free, scale as you grow</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            <PricingCard
              name="Starter" price="Free" delay={0.1}
              description="Perfect for small teams getting started."
              features={['1 workspace', 'Up to 500 feedback items', 'AI classification', 'Basic analytics', 'Ask LOOP (10 queries/day)']}
            />
            <PricingCard
              name="Growth" price="$49" highlighted delay={0.2}
              description="For growing teams with real feedback volume."
              features={['3 workspaces', 'Unlimited feedback', 'Advanced AI trends', 'VoC reports', 'CSV bulk upload', 'RBAC (3 roles)', 'Priority support']}
            />
            <PricingCard
              name="Enterprise" price="Custom" delay={0.3}
              description="Tailored for large organizations."
              features={['Unlimited workspaces', 'Dedicated infrastructure', 'Custom integrations', 'SSO & advanced security', 'SLA guarantee', 'Onboarding support']}
            />
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center rounded-3xl p-14 relative overflow-hidden border border-purple-500/20"
          style={{ background: 'linear-gradient(135deg, rgba(53,71,184,0.3) 0%, rgba(107,53,196,0.3) 50%, rgba(168,85,212,0.3) 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 50%, #8b2fc9, transparent 70%)', filter: 'blur(60px)' }}
          />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-400/30 bg-purple-500/10 text-sm text-purple-300 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Free to get started · No credit card required
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">Ready to close the loop?</h2>
            <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
              Join product teams who use LOOP to turn messy customer feedback into clear, actionable intelligence — in minutes, not weeks.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-foreground transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40"
              style={{ background: 'linear-gradient(135deg, #8b2fc9 0%, #6b35c4 50%, #3547b8 100%)' }}
            >
              Get started for free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground font-black text-sm loop-logo-symbol"
              style={{ background: 'linear-gradient(135deg, #8b2fc9, #3547b8)' }}
            >
              ∞
            </div>
            <span className="font-black">LOOP</span>
            <span className="text-foreground/30 text-sm ml-2">AI Customer Feedback Intelligence</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-foreground/40">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
          <p className="text-xs text-foreground/30">
            Built with ♥ for Zidio Development Internship · LOOP v1.0
          </p>
        </div>
      </footer>
    </div>
  )
}

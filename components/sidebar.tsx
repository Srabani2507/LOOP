"use client"

import type React from "react"
import { useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/lib/sidebar-context"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import {
  LayoutDashboard,
  Inbox,
  TrendingUp,
  MessageSquare,
  FileText,
  Users,
  Settings,
  LogOut,
  X,
} from "lucide-react"

/* ─────────────────────────────────────────────
   Framer Motion Variants (Water-like Animation)
───────────────────────────────────────────── */
const waterWaveVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: { duration: 0.15 },
  },
}

const iconWaveVariants: Variants = {
  initial: { scale: 0.5, rotate: -360, opacity: 0 },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
      mass: 1,
    },
  },
  exit: { scale: 0, rotate: 360, opacity: 0, transition: { duration: 0.3 } },
}

const pillWaveVariants: Variants = {
  initial: { opacity: 0, x: -15 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
      delay: 0.05,
    },
  },
  exit: {
    opacity: 0,
    x: -15,
    transition: { duration: 0.15 },
  },
}

/* ─────────────────────────────────────────────
   Nav Item Types & Data
───────────────────────────────────────────── */
interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Trends", href: "/trends", icon: TrendingUp },
  { label: "Ask LOOP", href: "/ask", icon: MessageSquare },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Members", href: "/members", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
]

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function InactiveItem({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 6 }}
      transition={{ type: "spring", stiffness: 150, damping: 12, duration: 0.3 }}
    >
      <Link
        href={item.href}
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
      >
        <motion.div
          className="shrink-0 h-5 w-5"
          whileHover={{ rotate: 8, scale: 1.15 }}
          transition={{ type: "spring", stiffness: 160, damping: 10 }}
        >
          <item.icon className="h-5 w-5" />
        </motion.div>
        <span className="flex-1 truncate">{item.label}</span>
        <motion.div
          className="absolute inset-0 rounded-lg bg-primary/5 -z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 14 }}
        />
      </Link>
    </motion.div>
  )
}

function ActiveItem({ item }: { item: NavItem }) {
  return (
    <motion.div
      key={`active-${item.href}`}
      className="flex items-center gap-3 px-4 py-3"
      variants={waterWaveVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        layoutId="active-icon"
        className="rounded-full bg-primary/90 flex items-center justify-center shadow-xl shadow-primary/50 h-10 w-10 shrink-0"
        variants={iconWaveVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <item.icon className="text-primary-foreground h-5 w-5" />
      </motion.div>

      <motion.div
        layoutId="active-pill"
        className="flex-1 bg-gradient-to-r from-primary/25 to-primary/10 backdrop-blur-md border border-primary/40 rounded-full flex items-center shadow-sm shadow-primary/20 h-10 px-4"
        variants={pillWaveVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.span className="font-semibold text-primary truncate text-sm">
          {item.label}
        </motion.span>
      </motion.div>
    </motion.div>
  )
}

function NavList({
  items,
  activeIndex,
  prefix = "main",
  onNavClick,
}: {
  items: NavItem[]
  activeIndex: number
  prefix?: string
  onNavClick?: () => void
}) {
  return (
    <motion.div className="flex flex-col">
      {/* TOP CARD — items above active */}
      <motion.div
        key={`${prefix}-top-card`}
        className="bg-card rounded-2xl border border-border/50 overflow-hidden"
        initial={false}
        animate={{
          height: activeIndex > 0 ? "auto" : 0,
          opacity: activeIndex > 0 ? 1 : 0,
          marginBottom: activeIndex > 0 ? 16 : 0,
          borderWidth: activeIndex > 0 ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
      >
        {items
          .slice(0, activeIndex > -1 ? activeIndex : 0)
          .map((item) => (
            <InactiveItem key={item.href} item={item} onClick={onNavClick} />
          ))}
      </motion.div>

      {/* ACTIVE ITEM (floats, no card) */}
      <AnimatePresence mode="wait">
        {activeIndex !== -1 && (
          <div className="mb-4">
            <ActiveItem item={items[activeIndex]} />
          </div>
        )}
      </AnimatePresence>

      {/* BOTTOM CARD — items below active */}
      <motion.div
        key={`${prefix}-bottom-card`}
        className="bg-card rounded-2xl border border-border/50 overflow-hidden"
        initial={false}
        animate={{
          height: activeIndex < items.length - 1 ? "auto" : 0,
          opacity: activeIndex < items.length - 1 ? 1 : 0,
          borderWidth: activeIndex < items.length - 1 ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
      >
        {items.slice(activeIndex + 1).map((item) => (
          <InactiveItem key={item.href} item={item} onClick={onNavClick} />
        ))}
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Main Sidebar
───────────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen, isMobile } = useSidebar()

  const activeIndex = useMemo(() => {
    return navigationItems.findIndex((item) => pathname?.startsWith(item.href))
  }, [pathname])

  /* Mobile scroll lock */
  useEffect(() => {
    if (isMobile && isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"

      return () => {
        document.body.style.position = ""
        document.body.style.top = ""
        document.body.style.width = ""
        document.body.style.overflow = ""
        window.scrollTo(0, scrollY)
      }
    }
  }, [isMobile, isOpen])

  const handleNavClick = () => {
    if (isMobile) setIsOpen(false)
  }

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300",
          "bg-background/20 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none",
          isMobile && !isOpen && "-translate-x-full",
          isMobile && isOpen && "translate-x-0"
        )}
      >
        <div className="flex h-full flex-col p-4 gap-4 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex flex-col">
              <h1 className="font-bold text-2xl text-foreground">LOOP</h1>
              <p className="text-xs text-muted-foreground">Customer Feedback AI</p>
            </div>
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 hover:bg-muted text-foreground/60 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Navigation Scroll Area */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-0 pr-1 -mr-1">
            <NavList
              items={navigationItems}
              activeIndex={activeIndex}
              prefix="main"
              onNavClick={handleNavClick}
            />
          </div>

          {/* Footer Profile Card */}
          <div className="mt-auto">
            <div className="bg-card rounded-2xl p-4 space-y-2 border border-border/50">
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/80">
                <div className="shrink-0 h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary/80 border border-primary/20 text-sm">
                  AR
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Alex Rivera</p>
                  <p className="text-xs text-muted-foreground truncate">Admin</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 mt-1">
                <Link
                  href="/settings"
                  onClick={handleNavClick}
                  className="flex items-center justify-center h-8 rounded-xl text-sm font-normal bg-blue-500/25 text-blue-700 dark:text-blue-400 hover:bg-blue-400/40 transition-colors shadow-sm"
                >
                  Profile
                </Link>
                <button
                  className="flex items-center justify-center gap-1.5 h-8 rounded-xl text-sm font-normal bg-destructive/20 text-destructive hover:bg-destructive/35 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </>
  )
}

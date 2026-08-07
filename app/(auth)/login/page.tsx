"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  Sun, 
  Moon,
  Loader2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [redirectUrl, setRedirectUrl] = useState("/dashboard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cb = params.get("callbackUrl");
      if (cb) {
        setRedirectUrl(cb);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Background Decorative Ambient Glow & Mesh Elements */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[130px] dark:bg-primary/30" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[150px] dark:bg-purple-900/25" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-blue-600/5 blur-[180px] dark:bg-blue-500/10" />

      {/* Grid Pattern Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"
      />

      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex items-center gap-1">
          <Image src="/LOOP-logo.svg" alt="LOOP Logo" width={48} height={48} className="h-10 w-auto" priority />
          <Image src="/LOOP-text.svg" alt="LOOP Text" width={80} height={24} className="h-10 w-auto -ml-6" priority />
        </div>

        <button
          onClick={toggleTheme}
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/40 backdrop-blur-md text-foreground/70 transition-all hover:bg-card hover:text-foreground hover:shadow-md"
          aria-label="Toggle Theme"
        >
          {mounted && theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </header>

      {/* Main Content Container */}
      <div className="relative z-10 flex w-full items-center justify-center px-4 py-20 lg:py-12">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          
          {/* Left Side: Brand Showcase & Dashboard Insights (Visible on lg screens) */}
          <div className="hidden lg:col-span-6 lg:flex lg:flex-col lg:justify-center lg:pr-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md w-fit mb-6 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Customer Feedback Intelligence Platform</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-5xl leading-[1.15]">
              Turn feedback into{" "}
              <span className="text-primary-gradient">
                actionable insights.
              </span>
            </h1>

            <p className="mt-4 text-base text-muted-foreground max-w-lg leading-relaxed">
              Experience the power of real-time AI sentiment analysis, trend tracking, and team collaboration designed to help you build products customers love.
            </p>

            {/* Interactive Preview Cards */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-md shadow-lg transition-all hover:border-primary/40 hover:shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">AI Processed</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold">95%</div>
                <p className="mt-1 text-[11px] text-emerald-500 flex items-center gap-1 font-medium">
                  <TrendingUp className="h-3 w-3" /> +12% performance vs last week
                </p>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-md shadow-lg transition-all hover:border-primary/40 hover:shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Feedback Volume</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold">1,248</div>
                <p className="mt-1 text-[11px] text-primary flex items-center gap-1 font-medium">
                  <Zap className="h-3 w-3" /> Real-time active stream
                </p>
              </div>
            </div>

            {/* Quote Pill */}
            <div className="mt-6 rounded-2xl border border-primary/20 bg-primary-gradient p-[1px] shadow-xl">
              <div className="rounded-[15px] bg-card/90 backdrop-blur-xl p-4">
                <p className="text-xs italic text-foreground/80">
                  &ldquo;LOOP has completely transformed how our product team categorizes user requests and acts on critical insights.&rdquo;
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary-gradient shadow-inner flex items-center justify-center text-[10px] font-bold text-white">
                    AR
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Alex Rivera</p>
                    <p className="text-[10px] text-muted-foreground">Lead Product Architect</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: High-End Glassmorphic Login Form */}
          <div className="col-span-1 lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-card/75 p-8 sm:p-10 shadow-2xl backdrop-blur-xl transition-all relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient" />

              {/* Brand Mobile Logo & Form Header */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2 lg:hidden">
                  <Image src="/LOOP-logo.svg" alt="LOOP Logo" width={52} height={52} className="h-11 w-auto" priority />
                  <Image src="/LOOP-text.svg" alt="LOOP Text" width={90} height={26} className="h-11 w-auto -ml-7" priority />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Sign in to your LOOP workspace dashboard
                </p>
              </div>

              {/* Form */}
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive dark:text-red-400 flex items-center gap-2 animate-in fade-in">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 pl-10 rounded-xl bg-background/50 border-border/80 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="alex@company.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                        Password
                      </label>
                      <a href="#" onClick={(e) => { e.preventDefault(); setError("Password reset feature is currently disabled. Please contact your workspace Administrator."); }} className="text-xs font-medium text-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pl-10 pr-10 rounded-xl bg-background/50 border-border/80 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40 accent-primary"
                    />
                    <span className="text-xs font-medium text-muted-foreground">Keep me signed in</span>
                  </label>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-primary-gradient text-white font-semibold shadow-lg shadow-primary/20 transition-all hover:opacity-95 hover:shadow-primary/30 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Social Login Options */}
              <div className="mt-6">
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-border/60" />
                  <span className="absolute bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => signIn("credentials", { callbackUrl: "/dashboard" })}
                    className="h-10 rounded-xl border-border/70 bg-background/50 hover:bg-muted font-medium text-xs gap-2"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => signIn("credentials", { callbackUrl: "/dashboard" })}
                    className="h-10 rounded-xl border-border/70 bg-background/50 hover:bg-muted font-medium text-xs gap-2"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <p className="mt-8 text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-primary hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


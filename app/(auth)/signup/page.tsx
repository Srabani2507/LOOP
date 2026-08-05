"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Mail, 
  Lock, 
  Building, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Sun, 
  Moon, 
  Loader2,
  CheckCircle2
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, workspaceName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong");
      }

      // Automatically sign in the user after successful registration
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setError("Account created but failed to sign in.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Background Decorative Ambient Glow & Mesh Elements */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[130px] dark:bg-primary/30" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[150px] dark:bg-purple-900/25" />
      
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
      <div className="relative z-10 flex w-full items-center justify-center px-4 py-20 lg:py-16">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          
          {/* Left Side: Features Showcase */}
          <div className="hidden lg:col-span-6 lg:flex lg:flex-col lg:justify-center lg:pr-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md w-fit mb-6 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Get Started in Under 2 Minutes</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-[1.15]">
              Build a workspace for your{" "}
              <span className="text-primary-gradient">
                customer voice.
              </span>
            </h1>

            <p className="mt-4 text-base text-muted-foreground max-w-lg leading-relaxed">
              Join thousands of teams leveraging AI-driven feedback categorization, automatic sentiment scoring, and team-wide trend reports.
            </p>

            {/* Checklist */}
            <div className="mt-8 space-y-4">
              {[
                "Instant AI Sentiment & Keyword Tagging",
                "Unified Feedback Streams across channels",
                "Automated weekly trend reports & team alerts",
                "Enterprise security and multi-user workspace"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Glassmorphic Signup Form */}
          <div className="col-span-1 lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-card/75 p-8 sm:p-10 shadow-2xl backdrop-blur-xl transition-all relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient" />

              {/* Header */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2 lg:hidden">
                  <Image src="/LOOP-logo.svg" alt="LOOP Logo" width={52} height={52} className="h-11 w-auto" priority />
                  <Image src="/LOOP-text.svg" alt="LOOP Text" width={90} height={26} className="h-11 w-auto -ml-7" priority />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Create your workspace
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Get started with your free LOOP account
                </p>
              </div>

              {/* Form */}
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive dark:text-red-400 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10 pl-10 rounded-xl bg-background/50 border-border/80 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Jane Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1">
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
                        className="h-10 pl-10 rounded-xl bg-background/50 border-border/80 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 pl-10 pr-10 rounded-xl bg-background/50 border-border/80 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Minimum 8 characters"
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Workspace Name */}
                  <div>
                    <label htmlFor="workspaceName" className="block text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-1">
                      Workspace Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="workspaceName"
                        name="workspaceName"
                        type="text"
                        required
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        className="h-10 pl-10 rounded-xl bg-background/50 border-border/80 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Acme Corp"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-11 mt-2 rounded-xl bg-primary-gradient text-white font-semibold shadow-lg shadow-primary/20 transition-all hover:opacity-95 hover:shadow-primary/30 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <p className="mt-6 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


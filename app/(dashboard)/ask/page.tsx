'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Lightbulb, Bot, ExternalLink, CheckCircle2, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SourceItem {
  id: string;
  content: string;
  channel: string;
  sentiment: string | null;
  sentimentScore?: number | null;
  createdAt?: string;
  cited: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceItem[];
  retrievedCount?: number;
  error?: boolean;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const sentimentStyles: Record<string, string> = {
  POSITIVE: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  NEGATIVE: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
  NEUTRAL: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

const channelLabel: Record<string, string> = {
  WEBSITE: 'Website',
  MOBILE_APP: 'Mobile App',
  EMAIL: 'Email',
  API: 'API',
  CSV: 'CSV',
};

const DEFAULT_QUESTIONS = [
  'What are customers saying about onboarding & signup?',
  'Which features are most requested by users?',
  'How has customer sentiment changed recently?',
  'What are the top complaint areas this week?',
  'What do customers love most about the product?',
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AskPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (questionText?: string) => {
    const query = (questionText ?? message).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to get AI answer');
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: [
          ...(data.sources || []),
          ...(data.related || []),
        ],
        retrievedCount: data.retrievedCount,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err.message || 'Something went wrong. Please try again.',
        error: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ask LOOP</h1>
        <p className="mt-1 text-muted-foreground">
          Ask plain-English questions — answers are grounded in your real customer feedback
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Chat panel ── */}
        <div className="lg:col-span-2 flex flex-col h-[650px]">
          {/* Message list */}
          <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-5 mb-4 space-y-5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center select-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-inner">
                  <Bot className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Ask anything about your feedback</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-2 leading-relaxed">
                  LOOP AI searches your workspace's actual customer feedback and answers only from what it finds — no hallucinations.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground font-medium'
                        : msg.error
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
                        : 'bg-muted/60 border border-border/60 text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Source citations (assistant messages only) */}
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="max-w-[90%] w-full space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        Grounded in {msg.retrievedCount} feedback item{msg.retrievedCount !== 1 ? 's' : ''} — {msg.sources.filter(s => s.cited).length} cited
                      </p>
                      <div className="space-y-1.5">
                        {msg.sources.slice(0, 6).map((src) => (
                          <div
                            key={src.id}
                            className={`rounded-xl border p-3 text-xs ${
                              src.cited
                                ? 'border-primary/30 bg-primary/5'
                                : 'border-border/50 bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              {src.cited && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  Cited
                                </span>
                              )}
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 h-4 ${src.sentiment ? sentimentStyles[src.sentiment] : 'bg-muted'}`}
                              >
                                {src.sentiment ?? '—'}
                              </Badge>
                              <span className="text-muted-foreground text-[10px]">
                                {channelLabel[src.channel] ?? src.channel}
                              </span>
                              <span className="text-muted-foreground/60 text-[10px] ml-auto font-mono">
                                <Hash className="inline h-2.5 w-2.5" />{src.id.slice(-6)}
                              </span>
                            </div>
                            <p className="text-foreground/80 line-clamp-2 leading-relaxed">
                              &ldquo;{src.content}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-muted/60 border border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
                  <Loader className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Searching feedback & generating grounded answer…</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask anything about your customer feedback…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!message.trim() || isLoading}
              className="gap-2 rounded-xl px-5"
            >
              {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Suggested questions */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Suggested Questions
            </h2>
            <div className="space-y-2">
              {DEFAULT_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="w-full text-left rounded-xl border border-border/70 bg-card p-3.5 text-xs font-medium hover:bg-muted/50 hover:border-primary/40 transition-all disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              How Ask LOOP Works
            </h3>
            <ol className="text-xs text-muted-foreground space-y-2 leading-relaxed list-none">
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">1.</span>
                Your question is matched against your workspace's feedback using keyword retrieval
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">2.</span>
                The top matching items are passed to the AI as grounding context
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">3.</span>
                The AI answers <strong>only</strong> from that context — no hallucinations
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold flex-shrink-0">4.</span>
                Cited sources are shown so you can verify every claim
              </li>
            </ol>
          </div>

          {/* Powered by */}
          <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">Powered by</p>
            <p className="text-xs font-semibold text-foreground mt-0.5">Groq · GPT OSS 120B</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Answers grounded in your data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
